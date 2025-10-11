export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed' | 'autopay';
  tx_hash?: string;
  autopay_rule_id?: string;
  payment_type?: 'bitcoin' | 'lightning'; // Add payment type
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  user_id: string;
  wallet_id?: string | null;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed' | 'autopay';
  tx_hash?: string | null;
  autopay_rule_id?: string | null;
  payment_type?: 'bitcoin' | 'lightning'; // Add payment type
}

export interface UpdateTransactionRequest {
  status?: 'pending' | 'completed' | 'failed' | 'autopay';
  tx_hash?: string;
}

export interface BalanceInfo {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

export interface TransactionFilters {
  user_id: string;
  type?: 'sent' | 'received';
  status?: 'pending' | 'completed' | 'failed' | 'autopay';
  wallet_id?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentRequest {
  recipientAddress: string;
  amount: number;
  description?: string;
  walletId: string;
}

export interface TransactionFee {
  slow: number;
  medium: number;
  fast: number;
}