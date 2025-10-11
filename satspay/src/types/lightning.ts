export interface LightningInvoice {
  paymentRequest: string;
  paymentHash: string;
  amount: number; // in satoshis
  description?: string;
  expiry?: number;
  timestamp: number;
  settled: boolean;
}

export interface LightningPayment {
  id: string;
  paymentHash: string;
  paymentRequest: string;
  amount: number; // in satoshis
  fee: number; // in satoshis
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: number;
  settledAt?: number;
  failureReason?: string;
}

export interface LightningBalance {
  balance: number; // in satoshis
  pendingOpenBalance: number;
  pendingCloseBalance: number;
  spendableBalance: number;
}

export interface WebLNProvider {
  isEnabled: boolean;
  enable(): Promise<void>;
  getInfo(): Promise<{
    node: {
      alias: string;
      pubkey: string;
      color?: string;
    };
    methods: string[];
  }>;
  sendPayment(paymentRequest: string): Promise<{
    preimage: string;
    paymentHash: string;
    route?: any;
  }>;
  makeInvoice(args: {
    amount?: number;
    defaultAmount?: number;
    minimumAmount?: number;
    maximumAmount?: number;
    defaultMemo?: string;
  }): Promise<{
    paymentRequest: string;
    rHash: string;
  }>;
  signMessage(message: string): Promise<{
    message: string;
    signature: string;
  }>;
  verifyMessage(signature: string, message: string): Promise<{
    valid: boolean;
    pubkey: string;
  }>;
}

export interface AlbyConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
}

export interface LightningConnectionState {
  isConnected: boolean;
  provider?: 'webln' | 'alby' | 'lnd';
  nodeInfo?: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  balance?: LightningBalance;
  lastConnected?: number;
}

export interface DecodedInvoice {
  paymentRequest: string;
  paymentHash: string;
  destination: string;
  amount: number; // in satoshis
  timestamp: number;
  expiry: number;
  description?: string;
  descriptionHash?: string;
  fallbackAddress?: string;
  routeHints?: any[];
}

export interface LightningErrorData {
  code: string;
  message: string;
  details?: any;
}

export class LightningError extends Error {
  public code: string;
  public details?: any;

  constructor(data: LightningErrorData) {
    super(data.message);
    this.name = 'LightningError';
    this.code = data.code;
    this.details = data.details;
  }
}