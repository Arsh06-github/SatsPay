// Application constants
export const APP_NAME = 'SatsPay';
export const APP_VERSION = '0.1.0';

// Bitcoin network constants
export const BITCOIN_NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  REGTEST: 'regtest',
} as const;

// Wallet types
export const WALLET_TYPES = {
  MOBILE: 'mobile',
  WEB: 'web',
  CROSS_PLATFORM: 'cross-platform',
} as const;

// Transaction statuses
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  AUTOPAY: 'autopay',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  WALLET: 'wallet-storage',
  TRANSACTION: 'transaction-storage',
  X402: 'x402-storage',
  ENCRYPTED_CREDENTIALS: 'encrypted-credentials',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  MEMPOOL: 'https://mempool.space/api',
  SUPABASE_LOCAL: 'http://localhost:54321',
  NIGIRI_FAUCET: 'http://localhost:3001',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Bitcoin units
export const BITCOIN_UNITS = {
  BTC: 100000000, // 1 BTC = 100,000,000 satoshis
  MBTC: 100000,   // 1 mBTC = 100,000 satoshis
  SATS: 1,        // 1 satoshi = 1 satoshi
} as const;