export interface Wallet {
  id: string;
  name: string;
  type: 'mobile' | 'web' | 'cross-platform';
  logo: string;
  isConnected: boolean;
  balance?: number;
  address?: string;
}

export interface WalletConnectionState {
  connectedWallets: {
    [walletId: string]: {
      isConnected: boolean;
      connectionData: any;
      lastConnected: number;
    };
  };
}

export interface WalletConnectionData {
  address?: string;
  publicKey?: string;
  network?: string;
  [key: string]: any;
}