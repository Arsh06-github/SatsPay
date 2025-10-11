import { PaymentRequest, BalanceInfo, Transaction } from '../../types/transaction';
import TransactionService from './transactionService';
import { WalletService } from './walletService';
import { MempoolApi } from '../api/mempoolApi';

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  txId?: string;
  error?: string;
  timestamp: Date;
}

export interface PaymentResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

// Payment service for handling Bitcoin payments end-to-end
export class PaymentService {
  private static paymentStatuses = new Map<string, PaymentStatus>();
  
  /**
   * Process a Bitcoin payment from creation to broadcast
   */
  static async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      console.log('Processing payment:', paymentRequest);
      
      // Validate payment request
      const validation = this.validatePaymentRequest(paymentRequest);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Check wallet connection and balance
      const balanceCheck = await this.checkBalance(paymentRequest);
      if (!balanceCheck.sufficient) {
        return { success: false, error: balanceCheck.error };
      }
      
      // Get sender address from wallet
      const senderAddress = await WalletService.getWalletAddress(paymentRequest.walletId);
      
      // Create transaction record in database with pending status
      const transactionRecord = await TransactionService.createTransaction({
        user_id: 'current-user', // This should come from auth store
        type: 'sent',
        amount: paymentRequest.amount,
        recipient: paymentRequest.recipientAddress,
        sender: senderAddress || undefined,
        status: 'pending',
        tx_hash: undefined
      });
      
      // Create and broadcast Bitcoin transaction
      const txResult = await this.createAndBroadcastTransaction(paymentRequest, senderAddress);
      
      if (txResult.success && txResult.txId) {
        // Update transaction record with tx hash and completed status
        const updatedTransaction = await TransactionService.updateTransaction(transactionRecord.id, {
          status: 'completed',
          tx_hash: txResult.txId
        });
        
        // Track payment status
        this.paymentStatuses.set(txResult.txId, {
          status: 'completed',
          txId: txResult.txId,
          timestamp: new Date(),
        });
        
        console.log('Payment processed and broadcast successfully:', updatedTransaction);
        return { success: true, transaction: updatedTransaction };
      } else {
        // Mark transaction as failed
        await TransactionService.updateTransaction(transactionRecord.id, {
          status: 'failed'
        });
        
        return { success: false, error: txResult.error || 'Transaction broadcast failed' };
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }
  
  /**
   * Get current balance for a wallet
   */
  static async getWalletBalance(walletId: string): Promise<BalanceInfo | null> {
    try {
      if (!WalletService.isWalletConnected(walletId)) {
        console.warn(`Wallet ${walletId} is not connected`);
        return null;
      }
      
      const address = await WalletService.getWalletAddress(walletId);
      if (!address) {
        console.warn(`Could not get address for wallet ${walletId}`);
        return null;
      }
      
      // Get balance from Mempool API
      const balanceData = await MempoolApi.getAddressBalance(address);
      if (!balanceData) {
        console.warn(`Could not get balance for address ${address}`);
        return null;
      }
      
      // Convert satoshis to BTC
      const confirmed = TransactionService.satoshisToBTC(balanceData.confirmed);
      const unconfirmed = TransactionService.satoshisToBTC(balanceData.unconfirmed);
      
      return {
        confirmed,
        unconfirmed,
        total: confirmed + unconfirmed
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return null;
    }
  }
  
  /**
   * Get payment status by transaction ID
   */
  static getPaymentStatus(txId: string): PaymentStatus | null {
    return this.paymentStatuses.get(txId) || null;
  }
  
  /**
   * Get all tracked payment statuses
   */
  static getAllPaymentStatuses(): Map<string, PaymentStatus> {
    return new Map(this.paymentStatuses);
  }
  
  /**
   * Update payment status manually (for testing or external updates)
   */
  static updatePaymentStatus(txId: string, status: PaymentStatus): void {
    this.paymentStatuses.set(txId, status);
  }
  
  /**
   * Validate payment request
   */
  private static validatePaymentRequest(request: PaymentRequest): { valid: boolean; error?: string } {
    if (!request.recipientAddress || typeof request.recipientAddress !== 'string') {
      return { valid: false, error: 'Invalid recipient address' };
    }
    
    if (!request.amount || typeof request.amount !== 'number' || request.amount <= 0) {
      return { valid: false, error: 'Invalid amount' };
    }
    
    if (!request.walletId || typeof request.walletId !== 'string') {
      return { valid: false, error: 'Invalid wallet ID' };
    }
    
    // Check if amount is too small (dust limit)
    const amountSats = request.amount * 100000000; // Convert BTC to satoshis
    if (amountSats < 546) {
      return { valid: false, error: 'Amount too small (below dust limit)' };
    }
    
    return { valid: true };
  }
  
  /**
   * Check if wallet has sufficient balance for payment
   */
  private static async checkBalance(request: PaymentRequest): Promise<{ sufficient: boolean; error?: string }> {
    try {
      const balance = await this.getWalletBalance(request.walletId);
      if (!balance) {
        return { sufficient: false, error: 'Could not retrieve wallet balance' };
      }
      
      // Balance is already in BTC from our mock
      const balanceBTC = balance.confirmed;
      
      // Estimate fee (rough estimate)
      const estimatedFee = 0.0001; // 0.0001 BTC (~10,000 sats)
      const totalRequired = request.amount + estimatedFee;
      
      if (balanceBTC < totalRequired) {
        return {
          sufficient: false,
          error: `Insufficient balance. Required: ${totalRequired} BTC, Available: ${balanceBTC} BTC`,
        };
      }
      
      return { sufficient: true };
    } catch (error) {
      console.error('Error checking balance:', error);
      return { sufficient: false, error: 'Failed to check balance' };
    }
  }
  
  /**
   * Monitor transaction status and update payment status
   */
  private static async monitorTransactionStatus(txId: string): Promise<void> {
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        attempts++;
        const status = await TransactionService.getTransactionStatus(txId);
        
        const currentPaymentStatus = this.paymentStatuses.get(txId);
        if (!currentPaymentStatus) return;
        
        // Update payment status based on transaction status
        if (status === 'completed') {
          this.paymentStatuses.set(txId, {
            ...currentPaymentStatus,
            status: 'completed',
          });
          console.log(`Payment ${txId} completed`);
          return;
        } else if (status === 'failed') {
          this.paymentStatuses.set(txId, {
            ...currentPaymentStatus,
            status: 'failed',
            error: 'Transaction failed',
          });
          console.log(`Payment ${txId} failed`);
          return;
        }
        
        // Continue monitoring if still pending and haven't exceeded max attempts
        if (attempts < maxAttempts && status === 'pending') {
          setTimeout(checkStatus, 30000); // Check again in 30 seconds
        } else if (attempts >= maxAttempts) {
          console.warn(`Stopped monitoring payment ${txId} after ${maxAttempts} attempts`);
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${txId}:`, error);
        
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 30000); // Retry in 30 seconds
        }
      }
    };
    
    // Start monitoring after a short delay
    setTimeout(checkStatus, 5000);
  }
  
  /**
   * Estimate transaction fee for a payment
   */
  static async estimateTransactionFee(amount: number, walletId: string): Promise<number | null> {
    try {
      // Get current fee rate
      const feeEstimates = await MempoolApi.getFeeEstimates();
      const feeRate = feeEstimates?.fastestFee || 10; // Default to 10 sat/vB
      
      // Estimate transaction size (simplified)
      // Typical transaction: 1 input + 2 outputs = ~250 bytes
      const estimatedSize = 250;
      const feeSats = estimatedSize * feeRate;
      
      // Convert to BTC
      return TransactionService.satoshisToBTC(feeSats);
    } catch (error) {
      console.error('Error estimating transaction fee:', error);
      return null;
    }
  }
  
  /**
   * Create and broadcast Bitcoin transaction using Mempool API
   */
  private static async createAndBroadcastTransaction(
    paymentRequest: PaymentRequest, 
    senderAddress: string | null
  ): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
      // In a real implementation, this would:
      // 1. Get UTXOs for the sender address
      // 2. Create a proper Bitcoin transaction using bitcoinjs-lib
      // 3. Sign the transaction with the wallet
      // 4. Broadcast via Mempool API
      
      // For development/demo purposes, we'll simulate this process
      console.log('Creating Bitcoin transaction...');
      
      // Get UTXOs from Mempool API (for real implementation)
      if (senderAddress) {
        const utxos = await MempoolApi.getAddressUTXOs(senderAddress);
        console.log(`Found ${utxos?.length || 0} UTXOs for address ${senderAddress}`);
      }
      
      // Get current fee estimates
      const feeEstimates = await MempoolApi.getFeeEstimates();
      console.log('Current fee estimates:', feeEstimates);
      
      // Create mock transaction hex (in real implementation, use bitcoinjs-lib)
      const mockTxHex = this.createMockTransactionHex(paymentRequest, feeEstimates?.fastestFee || 10);
      
      // Broadcast transaction via Mempool API
      const txId = await MempoolApi.broadcastTransaction(mockTxHex);
      
      if (txId) {
        console.log(`Transaction broadcast successful: ${txId}`);
        
        // Start monitoring transaction status
        this.monitorTransactionStatus(txId);
        
        return { success: true, txId };
      } else {
        return { success: false, error: 'Failed to broadcast transaction' };
      }
      
    } catch (error) {
      console.error('Error creating/broadcasting transaction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transaction creation failed' 
      };
    }
  }
  
  /**
   * Create mock transaction hex for development purposes
   */
  private static createMockTransactionHex(paymentRequest: PaymentRequest, feeRate: number): string {
    // This is a mock implementation for development
    // In a real implementation, you would use bitcoinjs-lib to create proper transaction hex
    const mockData = {
      recipient: paymentRequest.recipientAddress,
      amount: paymentRequest.amount,
      feeRate,
      timestamp: Date.now()
    };
    
    // Create a mock hex string based on the payment data
    const mockHex = Array.from(new TextEncoder().encode(JSON.stringify(mockData)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    console.log('Created mock transaction hex:', mockHex.substring(0, 32) + '...');
    
    return mockHex;
  }

  /**
   * Clear old payment statuses (cleanup utility)
   */
  static clearOldPaymentStatuses(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    Array.from(this.paymentStatuses.entries()).forEach(([txId, status]) => {
      if (status.timestamp < cutoffTime) {
        this.paymentStatuses.delete(txId);
      }
    });
    
    console.log(`Cleared old payment statuses older than ${olderThanHours} hours`);
  }
}