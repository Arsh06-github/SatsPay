// Validation utilities

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// PIN validation
export const isValidPin = (pin: string): boolean => {
  // PIN should be 4-6 digits
  const pinRegex = /^\d{4,6}$/;
  return pinRegex.test(pin);
};

// Bitcoin address validation (basic)
export const isValidBitcoinAddress = (address: string): boolean => {
  // Basic validation for Bitcoin addresses
  // Legacy (P2PKH): starts with 1
  // Script (P2SH): starts with 3
  // Bech32 (P2WPKH/P2WSH): starts with bc1
  const addressRegex = /^[13][a-km-z1-9A-HJ-NP-Z]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  return addressRegex.test(address);
};

// Lightning invoice validation (basic)
export const isValidLightningInvoice = (invoice: string): boolean => {
  // Lightning invoices start with 'lnbc' for mainnet or 'lntb' for testnet
  const invoiceRegex = /^ln(bc|tb)[0-9][a-z0-9]*$/i;
  return invoiceRegex.test(invoice);
};

// Amount validation
export const isValidAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 21000000; // Max 21M BTC
};

// Name validation
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Age validation
export const isValidAge = (age: number): boolean => {
  return age >= 18 && age <= 120;
};

// Wallet ID validation
export const isValidWalletId = (walletId: string): boolean => {
  return walletId.trim().length > 0;
};

// Autopay condition validation
export const isValidAutopayCondition = (condition: string): boolean => {
  // Basic validation - condition should not be empty
  return condition.trim().length > 0;
};

// Form validation helpers
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateSignUpForm = (data: {
  name: string;
  email: string;
  age: number;
  pin: string;
  confirmPin: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidName(data.name)) {
    errors.push('Name must be between 2 and 50 characters');
  }
  
  if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!isValidAge(data.age)) {
    errors.push('Age must be between 18 and 120');
  }
  
  if (!isValidPin(data.pin)) {
    errors.push('PIN must be 4-6 digits');
  }
  
  if (data.pin !== data.confirmPin) {
    errors.push('PINs do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSignInForm = (data: {
  email: string;
  pin: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!isValidPin(data.pin)) {
    errors.push('Please enter a valid PIN');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentForm = (data: {
  recipientAddress: string;
  amount: string;
  walletId: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidBitcoinAddress(data.recipientAddress) && !isValidLightningInvoice(data.recipientAddress)) {
    errors.push('Please enter a valid Bitcoin address or Lightning invoice');
  }
  
  if (!isValidAmount(data.amount)) {
    errors.push('Please enter a valid amount');
  }
  
  if (!isValidWalletId(data.walletId)) {
    errors.push('Please select a wallet');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};