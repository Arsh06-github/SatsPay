import { supabase } from '../api/supabaseClient';
import { MempoolApi } from '../api/mempoolApi';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionFilters 
} from '../../types/transaction';

export class TransactionService {
  /**
   * Create a new transaction record
   */
  static async createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: request.user_id,
          wallet_id: request.wallet_id || null,
          type: request.type,
          amount: request.amount,
          recipient: request.recipient || null,
          sender: request.sender || null,
          status: request.status,
          tx_hash: request.tx_hash || null,
          autopay_rule_id: request.autopay_rule_id || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Transaction creation failed:', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
   */
  static async updateTransaction(
    transactionId: string, 
    updates: UpdateTransactionRequest
  ): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Transaction update failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Transaction not found
        }
        console.error('Error fetching transaction:', error);
        throw new Error(`Failed to fetch transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Transaction fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get transactions with filtering and pagination
   */
  static async getTransactions(filters: TransactionFilters): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', filters.user_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.wallet_id) {
        query = query.eq('wallet_id', filters.wallet_id);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return {
        transactions: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Transactions fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get transactions by status
   */
  static async getTransactionsByStatus(
    userId: string, 
    status: Transaction['status']
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by status:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Transactions by status fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get transactions by type (sent/received)
   */
  static async getTransactionsByType(
    userId: string, 
    type: Transaction['type']
  ): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by type:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Transactions by type fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get autopay transactions
   */
  static async getAutopayTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'autopay')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching autopay transactions:', error);
        throw new Error(`Failed to fetch autopay transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Autopay transactions fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get pending transactions
   */
  static async getPendingTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending transactions:', error);
        throw new Error(`Failed to fetch pending transactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Pending transactions fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics for a user
   */
  static async getTransactionStats(userId: string): Promise<{
    totalSent: number;
    totalReceived: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
    autopayCount: number;
  }> {
    try {
      // Get all transactions for the user
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching transaction stats:', error);
        throw new Error(`Failed to fetch transaction stats: ${error.message}`);
      }

      const transactions = data || [];

      // Calculate statistics
      const stats = transactions.reduce((acc, transaction) => {
        // Amount totals
        if (transaction.type === 'sent' && transaction.status === 'completed') {
          acc.totalSent += transaction.amount;
        } else if (transaction.type === 'received' && transaction.status === 'completed') {
          acc.totalReceived += transaction.amount;
        }

        // Status counts
        switch (transaction.status) {
          case 'pending':
            acc.pendingCount++;
            break;
          case 'completed':
            acc.completedCount++;
            break;
          case 'failed':
            acc.failedCount++;
            break;
          case 'autopay':
            acc.autopayCount++;
            break;
        }

        return acc;
      }, {
        totalSent: 0,
        totalReceived: 0,
        pendingCount: 0,
        completedCount: 0,
        failedCount: 0,
        autopayCount: 0
      });

      return stats;
    } catch (error) {
      console.error('Transaction stats fetch failed:', error);
      throw error;
    }
  }

  /**
   * Delete a transaction (admin function)
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }
    } catch (error) {
      console.error('Transaction deletion failed:', error);
      throw error;
    }
  }

  /**
   * Mark transaction as completed with transaction hash
   */
  static async markTransactionCompleted(
    transactionId: string, 
    txHash: string
  ): Promise<Transaction> {
    return this.updateTransaction(transactionId, {
      status: 'completed',
      tx_hash: txHash
    });
  }

  /**
   * Mark transaction as failed
   */
  static async markTransactionFailed(transactionId: string): Promise<Transaction> {
    return this.updateTransaction(transactionId, {
      status: 'failed'
    });
  }

  /**
   * Create autopay transaction
   */
  static async createAutopayTransaction(
    userId: string,
    walletId: string,
    amount: number,
    recipient: string,
    sender: string,
    autopayRuleId: string
  ): Promise<Transaction> {
    return this.createTransaction({
      user_id: userId,
      wallet_id: walletId,
      type: 'sent',
      amount,
      recipient,
      sender,
      status: 'autopay',
      autopay_rule_id: autopayRuleId
    });
  }

  /**
   * Convert satoshis to BTC
   */
  static satoshisToBTC(satoshis: number): number {
    return satoshis / 100000000;
  }

  /**
   * Convert BTC to satoshis
   */
  static btcToSatoshis(btc: number): number {
    return Math.round(btc * 100000000);
  }

  /**
   * Get transaction status from blockchain via Mempool API
   */
  static async getTransactionStatus(txId: string): Promise<'pending' | 'completed' | 'failed'> {
    try {
      const status = await MempoolApi.getTransactionStatus(txId);
      
      if (!status) {
        return 'failed';
      }
      
      if (status.confirmed) {
        return 'completed';
      } else if (status.in_mempool) {
        return 'pending';
      } else {
        return 'failed';
      }
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'failed';
    }
  }
}

export default TransactionService;