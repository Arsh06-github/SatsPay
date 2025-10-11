/**
 * Bitcoin utility functions for address validation, URI generation, and QR code data
 */

export interface BitcoinPaymentURI {
  address: string;
  amount?: number;
  label?: string;
  message?: string;
}

/**
 * Validate Bitcoin address format
 */
export const isValidBitcoinAddress = (address: string): boolean => {
  // Basic regex patterns for different Bitcoin address formats
  const patterns = [
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy P2PKH and P2SH
    /^bc1[a-z0-9]{39,59}$/, // Bech32 (native segwit)
    /^bc1p[a-z0-9]{58}$/, // Bech32m (taproot)
  ];
  
  return patterns.some(pattern => pattern.test(address));
};

/**
 * Generate Bitcoin payment URI (BIP 21)
 */
export const generateBitcoinURI = (params: BitcoinPaymentURI): string => {
  const { address, amount, label, message } = params;
  
  if (!isValidBitcoinAddress(address)) {
    throw new Error('Invalid Bitcoin address');
  }
  
  let uri = `bitcoin:${address}`;
  const queryParams: string[] = [];
  
  if (amount && amount > 0) {
    queryParams.push(`amount=${amount.toFixed(8)}`);
  }
  
  if (label) {
    queryParams.push(`label=${encodeURIComponent(label)}`);
  }
  
  if (message) {
    queryParams.push(`message=${encodeURIComponent(message)}`);
  }
  
  if (queryParams.length > 0) {
    uri += `?${queryParams.join('&')}`;
  }
  
  return uri;
};

/**
 * Parse Bitcoin URI to extract components
 */
export const parseBitcoinURI = (uri: string): BitcoinPaymentURI | null => {
  try {
    // Handle both bitcoin: and plain address formats
    let address: string;
    let queryString = '';
    
    if (uri.startsWith('bitcoin:')) {
      const parts = uri.substring(8).split('?');
      address = parts[0];
      queryString = parts[1] || '';
    } else if (isValidBitcoinAddress(uri)) {
      address = uri;
    } else {
      return null;
    }
    
    if (!isValidBitcoinAddress(address)) {
      return null;
    }
    
    const result: BitcoinPaymentURI = { address };
    
    // Parse query parameters
    if (queryString) {
      const params = new URLSearchParams(queryString);
      
      const amount = params.get('amount');
      if (amount) {
        const amountNum = parseFloat(amount);
        if (!isNaN(amountNum) && amountNum > 0) {
          result.amount = amountNum;
        }
      }
      
      const label = params.get('label');
      if (label) {
        result.label = decodeURIComponent(label);
      }
      
      const message = params.get('message');
      if (message) {
        result.message = decodeURIComponent(message);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing Bitcoin URI:', error);
    return null;
  }
};

/**
 * Format Bitcoin amount for display
 */
export const formatBitcoinAmount = (amount: number, decimals: number = 8): string => {
  return amount.toFixed(decimals);
};

/**
 * Convert satoshis to BTC
 */
export const satoshisToBTC = (satoshis: number): number => {
  return satoshis / 100000000;
};

/**
 * Convert BTC to satoshis
 */
export const btcToSatoshis = (btc: number): number => {
  return Math.round(btc * 100000000);
};

/**
 * Generate QR code data for Bitcoin payment
 */
export const generatePaymentQRData = (params: BitcoinPaymentURI): string => {
  return generateBitcoinURI(params);
};

/**
 * Validate and normalize Bitcoin amount
 */
export const validateBitcoinAmount = (amount: string | number): { valid: boolean; amount?: number; error?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  // Check dust limit (546 satoshis)
  const satoshis = btcToSatoshis(numAmount);
  if (satoshis < 546) {
    return { valid: false, error: 'Amount too small (below dust limit)' };
  }
  
  // Check maximum reasonable amount (21 million BTC)
  if (numAmount > 21000000) {
    return { valid: false, error: 'Amount too large' };
  }
  
  return { valid: true, amount: numAmount };
};

/**
 * Truncate Bitcoin address for display
 */
export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Get address type from Bitcoin address
 */
export const getAddressType = (address: string): 'legacy' | 'segwit' | 'taproot' | 'unknown' => {
  if (/^[13]/.test(address)) {
    return 'legacy';
  } else if (/^bc1[a-z0-9]{39,59}$/.test(address)) {
    return 'segwit';
  } else if (/^bc1p/.test(address)) {
    return 'taproot';
  } else {
    return 'unknown';
  }
};