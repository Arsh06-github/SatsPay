import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, TransactionFilters } from '../types/transaction';
import TransactionService from '../services/bitcoin/transactionService';

interface TransactionState {
  // State
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters | null;
  stats: {
    totalSent: number;
    totalReceived: number;
    pendingCount: number;
    completedCount: number;
    failedCount: number;
    autopayCount: number;
  } | null;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: TransactionFilters) => void;
  setStats: (stats: TransactionState['stats']) => void;

  // Async actions
  fetchTransactions: (filters: TransactionFilters) => Promise<void>;
  fetchTransactionById: (transactionId: string) => Promise<void>;
  createTransaction: (request: any) => Promise<Transaction>;
  updateTransaction: (transactionId: string, updates: any) => Promise<Transaction>;
  fetchTransactionStats: (userId: string) => Promise<void>;
  fetchPendingTransactions: (userId: string) => Promise<void>;
  fetchAutopayTransactions: (userId: string) => Promise<void>;
  markTransactionCompleted: (transactionId: string, txHash: string) => Promise<void>;
  markTransactionFailed: (transactionId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  clearTransactions: () => void;
  reset: () => void;
}

const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  filters: null,
  stats: null,
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Synchronous actions
      setTransactions: (transactions) => set({ transactions }),
      setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => set({ filters }),
      setStats: (stats) => set({ stats }),

      // Async actions
      fetchTransactions: async (filters) => {
        set({ loading: true, error: null });
        try {
          const result = await TransactionService.getTransactions(filters);
          set({ 
            transactions: result.transactions, 
            filters,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchTransactionById: async (transactionId) => {
        set({ loading: true, error: null });
        try {
          const transaction = await TransactionService.getTransactionById(transactionId);
          set({ 
            currentTransaction: transaction,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction';
          set({ error: errorMessage, loading: false });
        }
      },

      createTransaction: async (request) => {
        set({ loading: true, error: null });
        try {
          const transaction = await TransactionService.createTransaction(request);
          
          // Add to current transactions list
          const currentTransactions = get().transactions;
          set({ 
            transactions: [transaction, ...currentTransactions],
            loading: false 
          });
          
          return transaction;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateTransaction: async (transactionId, updates) => {
        set({ loading: true, error: null });
        try {
          const updatedTransaction = await TransactionService.updateTransaction(transactionId, updates);
          
          // Update in current transactions list
          const currentTransactions = get().transactions;
          const updatedTransactions = currentTransactions.map(tx => 
            tx.id === transactionId ? updatedTransaction : tx
          );
          
          set({ 
            transactions: updatedTransactions,
            currentTransaction: get().currentTransaction?.id === transactionId 
              ? updatedTransaction 
              : get().currentTransaction,
            loading: false 
          });
          
          return updatedTransaction;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchTransactionStats: async (userId) => {
        try {
          const stats = await TransactionService.getTransactionStats(userId);
          set({ stats });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction stats';
          set({ error: errorMessage });
        }
      },

      fetchPendingTransactions: async (userId) => {
        set({ loading: true, error: null });
        try {
          const transactions = await TransactionService.getPendingTransactions(userId);
          set({ 
            transactions,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending transactions';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchAutopayTransactions: async (userId) => {
        set({ loading: true, error: null });
        try {
          const transactions = await TransactionService.getAutopayTransactions(userId);
          set({ 
            transactions,
            loading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch autopay transactions';
          set({ error: errorMessage, loading: false });
        }
      },

      markTransactionCompleted: async (transactionId, txHash) => {
        try {
          await get().updateTransaction(transactionId, {
            status: 'completed',
            tx_hash: txHash
          });
        } catch (error) {
          // Error is already handled in updateTransaction
          throw error;
        }
      },

      markTransactionFailed: async (transactionId) => {
        try {
          await get().updateTransaction(transactionId, {
            status: 'failed'
          });
        } catch (error) {
          // Error is already handled in updateTransaction
          throw error;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      clearTransactions: () => set({ transactions: [], currentTransaction: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'transaction-store',
      partialize: (state) => ({
        // Only persist non-sensitive data
        filters: state.filters,
        stats: state.stats,
      }),
    }
  )
);

export default useTransactionStore;