import React from 'react';
import { Transaction } from '../../types/transaction';
import {
  getTransactionStatusColor,
  getTransactionStatusBgColor
} from '../../utils/transactionUtils';

interface TransactionStatusBadgeProps {
  status: Transaction['status'];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = false
}) => {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'autopay':
        return '🔄';
      default:
        return '';
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 font-medium rounded-full ${getSizeClasses(size)} ${getTransactionStatusBgColor(status)} ${getTransactionStatusColor(status)}`}
    >
      {showIcon && (
        <span className="text-xs">
          {getStatusIcon(status)}
        </span>
      )}
      <span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </span>
  );
};

export default TransactionStatusBadge;