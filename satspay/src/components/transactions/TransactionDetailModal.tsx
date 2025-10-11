import React from 'react';
import Card3D from '../animations/Card3D';
import { Transaction } from '../../types/transaction';
import {
  formatTransactionAmount,
  getTransactionStatusColor,
  getTransactionStatusBgColor,
  formatTransactionDate
} from '../../utils/transactionUtils';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  if (!isOpen || !transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card3D intensity="strong" className="transform-gpu">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Transaction Details
            </h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-100 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 font-medium">Status:</span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getTransactionStatusBgColor(transaction.status)} ${getTransactionStatusColor(transaction.status)}`}
              >
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 font-medium">Type:</span>
              <span className={`font-medium ${transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 font-medium">Amount:</span>
              <span className={`font-semibold text-lg ${transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                {formatTransactionAmount(transaction)}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 font-medium">Date:</span>
              <span className="text-secondary-900">
                {formatTransactionDate(transaction.created_at)}
              </span>
            </div>

            {/* Addresses */}
            {transaction.sender && (
              <div>
                <span className="text-secondary-600 font-medium block mb-2">From:</span>
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <span className="text-sm font-mono break-all text-secondary-800">
                    {transaction.sender}
                  </span>
                </div>
              </div>
            )}

            {transaction.recipient && (
              <div>
                <span className="text-secondary-600 font-medium block mb-2">To:</span>
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <span className="text-sm font-mono break-all text-secondary-800">
                    {transaction.recipient}
                  </span>
                </div>
              </div>
            )}

            {/* Transaction Hash */}
            {transaction.tx_hash && (
              <div>
                <span className="text-secondary-600 font-medium block mb-2">Transaction Hash:</span>
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <span className="text-sm font-mono break-all text-secondary-800">
                    {transaction.tx_hash}
                  </span>
                </div>
              </div>
            )}

            {/* Autopay Info */}
            {transaction.status === 'autopay' && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600 text-lg">🔄</span>
                  <span className="font-medium text-blue-900">Automatic Payment</span>
                </div>
                <p className="text-sm text-blue-700">
                  This transaction was automatically triggered by an x402 autopay rule.
                </p>
                {transaction.autopay_rule_id && (
                  <p className="text-xs text-blue-600 mt-2 font-mono">
                    Rule ID: {transaction.autopay_rule_id.slice(0, 8)}...
                  </p>
                )}
              </div>
            )}

            {/* Pending Info */}
            {transaction.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600 text-lg">⏳</span>
                  <span className="font-medium text-yellow-900">Transaction Pending</span>
                </div>
                <p className="text-sm text-yellow-700">
                  This transaction is being processed and will be confirmed shortly.
                </p>
              </div>
            )}

            {/* Failed Info */}
            {transaction.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600 text-lg">❌</span>
                  <span className="font-medium text-red-900">Transaction Failed</span>
                </div>
                <p className="text-sm text-red-700">
                  This transaction could not be completed. Please try again or contact support.
                </p>
              </div>
            )}

            {/* Completed Info */}
            {transaction.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-green-600 text-lg">✅</span>
                  <span className="font-medium text-green-900">Transaction Completed</span>
                </div>
                <p className="text-sm text-green-700">
                  This transaction has been successfully confirmed on the Bitcoin network.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-secondary-200 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
            >
              Close
            </button>
            {transaction.tx_hash && (
              <button
                onClick={() => {
                  // Open blockchain explorer (placeholder)
                  window.open(`https://blockstream.info/tx/${transaction.tx_hash}`, '_blank');
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                View on Explorer
              </button>
            )}
          </div>
        </div>
      </Card3D>
    </div>
  );
};

export default TransactionDetailModal;