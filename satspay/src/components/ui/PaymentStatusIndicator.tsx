import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PaymentStatusIndicatorProps {
  status: 'pending' | 'completed' | 'failed' | 'processing';
  message?: string;
  txId?: string;
  className?: string;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  status,
  message,
  txId,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          bgColor: 'bg-primary-50',
          borderColor: 'border-primary-200',
          textColor: 'text-primary-700',
          icon: <LoadingSpinner size="sm" color="text-primary-500" />,
        };
      case 'completed':
        return {
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          textColor: 'text-success-700',
          icon: (
            <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'failed':
        return {
          bgColor: 'bg-error-50',
          borderColor: 'border-error-200',
          textColor: 'text-error-700',
          icon: (
            <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'pending':
      default:
        return {
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          textColor: 'text-warning-700',
          icon: (
            <svg className="w-5 h-5 text-warning-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-4 rounded-md ${config.bgColor} border ${config.borderColor} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {message || `Payment ${status}`}
          </p>
          {txId && (
            <div className="mt-2">
              <p className="text-xs text-secondary-600 font-mono break-all">
                Transaction ID: {txId}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(txId)}
                className="mt-1 text-xs text-primary-600 hover:text-primary-800 underline"
              >
                Copy Transaction ID
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusIndicator;