import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWalletLogo } from '../utils/walletLogos';
import { LightningConnectionState, LightningBalance } from '../types/lightning';

interface Wallet {
  id: string;
  name: string;
  type: 'mobile' | 'web' | 'cross-platform';
  logo: string;
  isConnected: boolean;
  balance?: number;
  address?: string;
  lightningBalance?: number; // Lightning balance in satoshis
}

interface WalletState {
  wallets: Wallet[];
  connectedWallets: Wallet[];
  isLoading: boolean;
  lightningState: LightningConnectionState;
  connectWallet: (walletId: string) => Promise<boolean>;
  disconnectWallet: (walletId: string) => Promise<void>;
  updateWalletBalance: (walletId: string, balance: number) => void;
  updateLightningBalance: (walletId: string, lightningBalance: number) => void;
  connectLightning: () => Promise<boolean>;
  disconnectLightning: () => Promise<void>;
  initializeWallets: () => void;
}

// Predefined wallet list based on requirements
const AVAILABLE_WALLETS: Wallet[] = [
  // Mobile wallets
  { id: 'bluewallet', name: 'BlueWallet', type: 'mobile', logo: getWalletLogo('bluewallet'), isConnected: false },
  { id: 'munn', name: 'Munn', type: 'mobile', logo: getWalletLogo('munn'), isConnected: false },
  { id: 'phoenix', name: 'Phoenix', type: 'mobile', logo: getWalletLogo('phoenix'), isConnected: false },
  { id: 'zengo', name: 'Zengo', type: 'mobile', logo: getWalletLogo('zengo'), isConnected: false },
  { id: 'breez', name: 'Breez', type: 'mobile', logo: getWalletLogo('breez'), isConnected: false },
  { id: 'eclair', name: 'Éclair', type: 'mobile', logo: getWalletLogo('eclair'), isConnected: false },
  { id: 'klever', name: 'Klever', type: 'mobile', logo: getWalletLogo('klever'), isConnected: false },
  
  // Web wallets
  { id: 'sparrow', name: 'Sparrow', type: 'web', logo: getWalletLogo('sparrow'), isConnected: false },
  { id: 'electrum', name: 'Electrum Web', type: 'web', logo: getWalletLogo('electrum'), isConnected: false },
  
  // Cross-platform wallets
  { id: 'casa', name: 'Casa', type: 'cross-platform', logo: getWalletLogo('casa'), isConnected: false },
  { id: 'blockstream', name: 'Blockstream Green', type: 'cross-platform', logo: getWalletLogo('blockstream'), isConnected: false },
  { id: 'unstoppable', name: 'Unstoppable', type: 'cross-platform', logo: getWalletLogo('unstoppable'), isConnected: false },
];

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: AVAILABLE_WALLETS,
      connectedWallets: [],
      isLoading: false,
      lightningState: { isConnected: false },
      
      connectWallet: async (walletId: string) => {
        set({ isLoading: true });
        try {
          // Import wallet service dynamically to avoid circular dependencies
          const { WalletService } = await import('../services/bitcoin/walletService');
          
          const result = await WalletService.connectWallet(walletId);
          
          if (result.success) {
            const { wallets } = get();
            const balance = await WalletService.getBalance(walletId);
            const address = await WalletService.getWalletAddress(walletId);
            
            const updatedWallets = wallets.map(wallet =>
              wallet.id === walletId 
                ? { ...wallet, isConnected: true, balance, address: address || undefined }
                : wallet
            );
            
            const connectedWallets = updatedWallets.filter(w => w.isConnected);
            
            set({ 
              wallets: updatedWallets, 
              connectedWallets,
              isLoading: false 
            });
            
            return true;
          } else {
            console.error('Wallet connection failed:', result.error);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Wallet connection error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      disconnectWallet: async (walletId: string) => {
        set({ isLoading: true });
        try {
          // Import wallet service dynamically to avoid circular dependencies
          const { WalletService } = await import('../services/bitcoin/walletService');
          
          await WalletService.disconnectWallet(walletId);
          
          const { wallets } = get();
          const updatedWallets = wallets.map(wallet =>
            wallet.id === walletId ? { ...wallet, isConnected: false, balance: undefined, address: undefined } : wallet
          );
          
          const connectedWallets = updatedWallets.filter(w => w.isConnected);
          
          set({ 
            wallets: updatedWallets, 
            connectedWallets,
            isLoading: false 
          });
        } catch (error) {
          console.error('Wallet disconnection error:', error);
          set({ isLoading: false });
        }
      },
      
      updateWalletBalance: (walletId: string, balance: number) => {
        const { wallets } = get();
        const updatedWallets = wallets.map(wallet =>
          wallet.id === walletId ? { ...wallet, balance } : wallet
        );
        
        const connectedWallets = updatedWallets.filter(w => w.isConnected);
        
        set({ wallets: updatedWallets, connectedWallets });
      },

      updateLightningBalance: (walletId: string, lightningBalance: number) => {
        const { wallets } = get();
        const updatedWallets = wallets.map(wallet =>
          wallet.id === walletId ? { ...wallet, lightningBalance } : wallet
        );
        
        const connectedWallets = updatedWallets.filter(w => w.isConnected);
        
        set({ wallets: updatedWallets, connectedWallets });
      },

      connectLightning: async () => {
        set({ isLoading: true });
        try {
          const { AlbyService } = await import('../services/lightning');
          const success = await AlbyService.initializeAlby();
          
          if (success) {
            const connectionState = AlbyService.getConnectionState();
            set({ 
              lightningState: connectionState,
              isLoading: false 
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Lightning connection failed:', error);
          set({ isLoading: false });
          return false;
        }
      },

      disconnectLightning: async () => {
        try {
          const { AlbyService } = await import('../services/lightning');
          await AlbyService.disconnect();
          set({ lightningState: { isConnected: false } });
        } catch (error) {
          console.error('Lightning disconnection failed:', error);
        }
      },
      
      initializeWallets: () => {
        set({ wallets: AVAILABLE_WALLETS });
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ 
        wallets: state.wallets,
        connectedWallets: state.connectedWallets,
        lightningState: state.lightningState
      }),
    }
  )
);