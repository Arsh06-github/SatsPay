import React from 'react';
import { Transaction } from '../../types/transaction';
import {
  formatTransactionAmount,
  getTransactionStatusColor,
  getTransactionStatusBgColor,
  getRelativeTime,
  getTransactionDescription,
  getTransactionIcon
} from '../../utils/transactionUtils';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  showDate?: boolean;
  compact?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading = false,
  onTransactionClick,
  showDate = true,
  compact = false
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex items-center space-x-3 ${compact ? 'p-3' : 'p-4'} rounded-lg bg-secondary-50 animate-pulse`}>
            <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
              <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-secondary-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-secondary-600">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          onClick={() => onTransactionClick?.(transaction)}
          className={`flex items-center space-x-3 ${compact ? 'p-3' : 'p-4'} rounded-lg bg-secondary-50 hover:bg-secondary-100 ${onTransactionClick ? 'cursor-pointer' : ''} transition-colors`}
        >
          {/* Transaction Icon */}
          <div className={compact ? 'text-lg' : 'text-2xl'}>
            {getTransactionIcon(transaction)}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className={`font-medium text-secondary-900 truncate ${compact ? 'text-sm' : ''}`}>
                {getTransactionDescription(transaction)}
              </p>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionStatusBgColor(transaction.status)} ${getTransactionStatusColor(transaction.status)}`}
              >
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
              {transaction.status === 'autopay' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                  Auto
                </span>
              )}
            </div>
            {showDate && (
              <p className={`text-secondary-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                {getRelativeTime(transaction.created_at)}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className={`font-semibold ${transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'} ${compact ? 'text-sm' : ''}`}>
              {formatTransactionAmount(transaction)}
            </p>
            {transaction.tx_hash && !compact && (
              <p className="text-xs text-secondary-500 truncate max-w-20">
                {transaction.tx_hash.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;