import { BITCOIN_UNITS } from './constants';

// Bitcoin amount formatters
export const formatBitcoin = (satoshis: number, unit: 'BTC' | 'mBTC' | 'sats' = 'BTC'): string => {
  switch (unit) {
    case 'BTC':
      return (satoshis / BITCOIN_UNITS.BTC).toFixed(8);
    case 'mBTC':
      return (satoshis / BITCOIN_UNITS.MBTC).toFixed(5);
    case 'sats':
      return satoshis.toString();
    default:
      return (satoshis / BITCOIN_UNITS.BTC).toFixed(8);
  }
};

export const parseBitcoin = (amount: string, unit: 'BTC' | 'mBTC' | 'sats' = 'BTC'): number => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 0;
  
  switch (unit) {
    case 'BTC':
      return Math.round(numAmount * BITCOIN_UNITS.BTC);
    case 'mBTC':
      return Math.round(numAmount * BITCOIN_UNITS.MBTC);
    case 'sats':
      return Math.round(numAmount);
    default:
      return Math.round(numAmount * BITCOIN_UNITS.BTC);
  }
};

// Date formatters
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};

// Address formatters
export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Transaction hash formatter
export const formatTxHash = (txHash: string): string => {
  return truncateAddress(txHash, 8, 8);
};

// Currency formatter
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Number formatter with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};