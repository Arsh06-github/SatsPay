import { Transaction } from '../types/transaction';

/**
 * Format Bitcoin amount for display
 */
export const formatBitcoinAmount = (amount: number): string => {
  return `${amount.toFixed(8)} BTC`;
};

/**
 * Format transaction amount with proper sign and payment type
 */
export const formatTransactionAmount = (transaction: Transaction): string => {
  const sign = transaction.type === 'sent' ? '-' : '+';
  const isLightning = transaction.payment_type === 'lightning';
  
  if (isLightning) {
    // For Lightning, show in satoshis if amount is small
    const sats = Math.floor(transaction.amount * 100000000);
    if (sats < 100000) {
      return `${sign}${sats.toLocaleString()} sats`;
    }
  }
  
  return `${sign}${formatBitcoinAmount(transaction.amount)}`;
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status: Transaction['status']): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    case 'autopay':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Get transaction status background color
 */
export const getTransactionStatusBgColor = (status: Transaction['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100';
    case 'pending':
      return 'bg-yellow-100';
    case 'failed':
      return 'bg-red-100';
    case 'autopay':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
};

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: Transaction['type']): string => {
  return type === 'sent' ? 'text-red-600' : 'text-green-600';
};

/**
 * Format transaction date
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time for transaction
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatTransactionDate(dateString);
  }
};

/**
 * Truncate Bitcoin address for display
 */
export const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Get transaction description
 */
export const getTransactionDescription = (transaction: Transaction): string => {
  const isLightning = transaction.payment_type === 'lightning';
  const networkType = isLightning ? 'Lightning' : 'Bitcoin';
  
  if (transaction.status === 'autopay') {
    return `Automatic ${networkType.toLowerCase()} payment`;
  }
  
  if (transaction.type === 'sent') {
    if (isLightning) {
      return transaction.recipient && transaction.recipient !== 'Lightning Network'
        ? `Lightning sent to ${truncateAddress(transaction.recipient)}`
        : 'Lightning payment sent';
    } else {
      return transaction.recipient 
        ? `Sent to ${truncateAddress(transaction.recipient)}`
        : 'Bitcoin sent';
    }
  } else {
    if (isLightning) {
      return transaction.sender && transaction.sender !== 'Lightning Network'
        ? `Lightning received from ${transaction.sender}`
        : 'Lightning payment received';
    } else {
      return transaction.sender 
        ? `Received from ${truncateAddress(transaction.sender)}`
        : 'Bitcoin received';
    }
  }
};

/**
 * Check if transaction is recent (within last 24 hours)
 */
export const isRecentTransaction = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
};

/**
 * Group transactions by date
 */
export const groupTransactionsByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.created_at);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Calculate total amount for transactions
 */
export const calculateTotalAmount = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    if (transaction.status === 'completed') {
      return total + transaction.amount;
    }
    return total;
  }, 0);
};

/**
 * Get transaction icon based on type, status, and payment type
 */
export const getTransactionIcon = (transaction: Transaction): string => {
  const isLightning = transaction.payment_type === 'lightning';
  
  if (transaction.status === 'autopay') {
    return isLightning ? '⚡🔄' : '🔄'; // Automatic
  }
  
  if (transaction.status === 'pending') {
    return isLightning ? '⚡⏳' : '⏳'; // Pending
  }
  
  if (transaction.status === 'failed') {
    return '❌'; // Failed
  }
  
  if (isLightning) {
    return transaction.type === 'sent' ? '⚡📤' : '⚡📥'; // Lightning Sent/Received
  }
  
  return transaction.type === 'sent' ? '📤' : '📥'; // Bitcoin Sent/Received
};

/**
 * Validate Bitcoin address format (basic validation)
 */
export const isValidBitcoinAddress = (address: string): boolean => {
  // Basic Bitcoin address validation (simplified)
  const legacyPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const segwitPattern = /^bc1[a-z0-9]{39,59}$/;
  const testnetPattern = /^(tb1|[2mn])[a-zA-Z0-9]{25,62}$/;
  
  return legacyPattern.test(address) || 
         segwitPattern.test(address) || 
         testnetPattern.test(address);
};

/**
 * Sort transactions by date (newest first)
 */
export const sortTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

/**
 * Get transaction summary for a list of transactions
 */
export const getTransactionSummary = (transactions: Transaction[]) => {
  const summary = transactions.reduce((acc, transaction) => {
    acc.total++;
    
    if (transaction.status === 'completed') {
      if (transaction.type === 'sent') {
        acc.totalSent += transaction.amount;
        acc.sentCount++;
      } else {
        acc.totalReceived += transaction.amount;
        acc.receivedCount++;
      }
    }
    
    acc.statusCounts[transaction.status] = (acc.statusCounts[transaction.status] || 0) + 1;
    
    return acc;
  }, {
    total: 0,
    totalSent: 0,
    totalReceived: 0,
    sentCount: 0,
    receivedCount: 0,
    statusCounts: {} as Record<Transaction['status'], number>
  });
  
  return {
    ...summary,
    netAmount: summary.totalReceived - summary.totalSent
  };
};