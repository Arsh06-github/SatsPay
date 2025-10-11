// Shared configuration across platforms
export const SHARED_CONFIG = {
  // App information
  APP_NAME: 'SatsPay',
  APP_VERSION: '1.0.0',
  
  // API endpoints
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  MEMPOOL_API_URL: process.env.REACT_APP_MEMPOOL_API_URL || 'https://mempool.space/api',
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  
  // Bitcoin network settings
  BITCOIN_NETWORK: process.env.REACT_APP_BITCOIN_NETWORK || 'regtest',
  BITCOIN_RPC_URL: process.env.REACT_APP_BITCOIN_RPC_URL || 'http://localhost:18443',
  
  // Lightning network settings
  LIGHTNING_NETWORK: process.env.REACT_APP_LIGHTNING_NETWORK || 'regtest',
  ALBY_CLIENT_ID: process.env.REACT_APP_ALBY_CLIENT_ID || '',
  
  // Security settings
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  PIN_LENGTH: 4,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Transaction settings
  DEFAULT_FEE_RATE: 1, // sat/vB
  MIN_TRANSACTION_AMOUNT: 0.00001, // 0.00001 BTC
  MAX_TRANSACTION_AMOUNT: 1, // 1 BTC
  TRANSACTION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Autopay settings
  MAX_AUTOPAY_RULES: 10,
  MIN_AUTOPAY_AMOUNT: 0.00001, // 0.00001 BTC
  MAX_AUTOPAY_AMOUNT: 0.1, // 0.1 BTC
  AUTOPAY_CHECK_INTERVAL: 60 * 1000, // 1 minute
  
  // UI settings
  ANIMATION_DURATION: 300, // milliseconds
  HAPTIC_FEEDBACK_ENABLED: true,
  THEME: 'professional',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH: 'satspay_auth',
    CREDENTIALS: 'satspay_encrypted_credentials',
    WALLET_STATE: 'satspay_wallet_state',
    TRANSACTION_CACHE: 'satspay_transaction_cache',
    AUTOPAY_RULES: 'satspay_autopay_rules',
    USER_PREFERENCES: 'satspay_user_preferences',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    WALLET_CONNECTION_ERROR: 'Failed to connect to wallet. Please try again.',
    TRANSACTION_ERROR: 'Transaction failed. Please try again.',
    AUTHENTICATION_ERROR: 'Authentication failed. Please check your credentials.',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
    INVALID_ADDRESS: 'Invalid Bitcoin address.',
    INVALID_AMOUNT: 'Invalid transaction amount.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    WALLET_CONNECTED: 'Wallet connected successfully',
    TRANSACTION_SENT: 'Transaction sent successfully',
    AUTOPAY_CREATED: 'Autopay rule created successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
  },
};