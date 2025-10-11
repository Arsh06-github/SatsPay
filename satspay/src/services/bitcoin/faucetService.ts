// Local Bitcoin faucet service for testing
export interface FaucetInfo {
  balance: number;
  blockCount: number;
  network: string;
  availableAmounts: number[];
}

export interface FaucetTransaction {
  txid: string;
  amount: number;
  address: string;
  confirmed: boolean;
}

export interface FaucetResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class FaucetService {
  private static readonly FAUCET_API_URL = process.env.REACT_APP_FAUCET_API_URL || 'http://localhost:3001';
  private static readonly AVAILABLE_AMOUNTS = [0.02, 0.035, 0.05, 0.1];

  /**
   * Check if faucet is available (development environment only)
   */
  static isAvailable(): boolean {
    return process.env.REACT_APP_ENABLE_FAUCET === 'true' && 
           process.env.REACT_APP_ENABLE_REGTEST === 'true';
  }

  /**
   * Get faucet information including balance and available amounts
   */
  static async getFaucetInfo(): Promise<FaucetInfo | null> {
    if (!this.isAvailable()) {
      console.warn('Faucet is not available in this environment');
      return null;
    }

    try {
      const response = await fetch(`${this.FAUCET_API_URL}/api/faucet/info`);
      const result: FaucetResponse<FaucetInfo> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('Failed to get faucet info:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching faucet info:', error);
      return null;
    }
  }

  /**
   * Request test Bitcoin from the faucet
   * @param amount Amount to request (must be one of the available amounts)
   * @param address Bitcoin address to send to
   * @returns Transaction ID if successful, null otherwise
   */
  static async requestTestBitcoin(amount: number, address: string): Promise<FaucetTransaction | null> {
    if (!this.isAvailable()) {
      console.warn('Faucet is not available in this environment');
      return null;
    }

    // Validate amount
    if (!this.AVAILABLE_AMOUNTS.includes(amount)) {
      console.error(`Invalid amount: ${amount}. Available amounts: ${this.AVAILABLE_AMOUNTS.join(', ')}`);
      return null;
    }

    // Validate address format (basic check)
    if (!address || address.length < 26 || address.length > 62) {
      console.error('Invalid Bitcoin address format');
      return null;
    }

    try {
      const response = await fetch(`${this.FAUCET_API_URL}/api/faucet/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          amount
        })
      });

      const result: FaucetResponse<FaucetTransaction> = await response.json();
      
      if (result.success && result.data) {
        console.log(`Successfully sent ${amount} BTC to ${address}. TXID: ${result.data.txid}`);
        return result.data;
      } else {
        console.error('Failed to send test Bitcoin:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error requesting test Bitcoin:', error);
      return null;
    }
  }

  /**
   * Generate a new Bitcoin address for testing
   */
  static async generateTestAddress(): Promise<string | null> {
    if (!this.isAvailable()) {
      console.warn('Faucet is not available in this environment');
      return null;
    }

    try {
      const response = await fetch(`${this.FAUCET_API_URL}/api/faucet/generate-address`);
      const result: FaucetResponse<{ address: string }> = await response.json();
      
      if (result.success && result.data) {
        return result.data.address;
      } else {
        console.error('Failed to generate test address:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error generating test address:', error);
      return null;
    }
  }

  /**
   * Get faucet balance (convenience method)
   */
  static async getFaucetBalance(): Promise<number> {
    const info = await this.getFaucetInfo();
    return info?.balance || 0;
  }

  /**
   * Get available amounts for faucet requests
   */
  static getAvailableAmounts(): number[] {
    return [...this.AVAILABLE_AMOUNTS];
  }

  /**
   * Check if faucet API is healthy
   */
  static async isHealthy(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const response = await fetch(`${this.FAUCET_API_URL}/health`);
      const result = await response.json();
      return result.status === 'ok';
    } catch (error) {
      console.error('Faucet health check failed:', error);
      return false;
    }
  }

  /**
   * Request test Bitcoin and record transaction in history
   * @param amount Amount to request
   * @param address Bitcoin address to send to
   * @param userId User ID for transaction history
   * @param walletId Optional wallet ID
   * @returns Transaction record if successful
   */
  static async requestTestBitcoinWithHistory(
    amount: number, 
    address: string, 
    userId: string, 
    walletId?: string
  ): Promise<{ faucetTx: FaucetTransaction; dbTx: any } | null> {
    // First request the Bitcoin from faucet
    const faucetTx = await this.requestTestBitcoin(amount, address);
    if (!faucetTx) {
      return null;
    }

    try {
      // Import transaction service dynamically to avoid circular dependencies
      const { TransactionService } = await import('./transactionService');
      
      // Record the transaction in the database
      const dbTx = await TransactionService.createTransaction({
        user_id: userId,
        wallet_id: walletId || null,
        type: 'received',
        amount: amount,
        sender: 'Bitcoin Faucet',
        recipient: address,
        status: faucetTx.confirmed ? 'completed' : 'pending',
        tx_hash: faucetTx.txid
      });

      console.log(`Faucet transaction recorded in history: ${dbTx.id}`);
      
      return { faucetTx, dbTx };
    } catch (error) {
      console.error('Failed to record faucet transaction in history:', error);
      // Return the faucet transaction even if DB recording fails
      return { faucetTx, dbTx: null };
    }
  }

  /**
   * Get faucet transaction history for a user
   */
  static async getFaucetTransactionHistory(userId: string): Promise<any[]> {
    try {
      // Import transaction service dynamically to avoid circular dependencies
      const { TransactionService } = await import('./transactionService');
      
      const { transactions } = await TransactionService.getTransactions({
        user_id: userId,
        type: 'received'
      });

      // Filter for faucet transactions (sender is 'Bitcoin Faucet')
      return transactions.filter(tx => tx.sender === 'Bitcoin Faucet');
    } catch (error) {
      console.error('Failed to get faucet transaction history:', error);
      return [];
    }
  }
}