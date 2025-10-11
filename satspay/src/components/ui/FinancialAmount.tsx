import React from 'react';
import { formatBitcoinAmount, getAmountSize } from '../../styles/theme';

interface FinancialAmountProps {
  amount: number;
  currency?: 'BTC' | 'sats' | 'USD';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  precision?: number;
  showCurrency?: boolean;
  className?: string;
  positive?: boolean;
  negative?: boolean;
}

const FinancialAmount: React.FC<FinancialAmountProps> = ({
  amount,
  currency = 'BTC',
  size = 'auto',
  precision = 8,
  showCurrency = true,
  className = '',
  positive = false,
  negative = false,
}) => {
  const sizeClasses = {
    sm: 'text-sm font-mono font-medium tracking-tight',
    md: 'text-lg font-mono font-semibold tracking-tight',
    lg: 'text-2xl font-mono font-bold tracking-tight',
    xl: 'text-4xl font-mono font-black tracking-tight',
    auto: getAmountSize(Math.abs(amount)),
  };

  const colorClasses = positive 
    ? 'text-success-600' 
    : negative 
    ? 'text-error-600' 
    : 'text-secondary-900';

  const formatAmount = () => {
    if (currency === 'sats') {
      return Math.round(amount * 100000000).toLocaleString();
    }
    return formatBitcoinAmount(amount, precision);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'BTC':
        return '₿';
      case 'sats':
        return 'sats';
      case 'USD':
        return '$';
      default:
        return currency;
    }
  };

  const sign = positive ? '+' : negative ? '-' : '';

  return (
    <span className={`${sizeClasses[size]} ${colorClasses} ${className} text-crisp`}>
      {sign}
      {showCurrency && currency !== 'sats' && (
        <span className="mr-1">{getCurrencySymbol()}</span>
      )}
      {formatAmount()}
      {showCurrency && currency === 'sats' && (
        <span className="ml-1 text-sm font-normal">{getCurrencySymbol()}</span>
      )}
    </span>
  );
};

export default FinancialAmount;