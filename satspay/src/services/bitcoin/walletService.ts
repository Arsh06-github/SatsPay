import { WalletConnectionData } from '../../types/wallet';
import { createWalletConnector, WalletConnector } from './walletConnectors';

// Bitcoin wallet service for managing wallet connections and operations
export class WalletService {
  private static connectedWallets = new Map<string, WalletConnector>();
  
  /**
   * Connect to a specific wallet based on wallet ID
   */
  static async connectWallet(walletId: string): Promise<{ success: boolean; data?: WalletConnectionData; error?: string }> {
    try {
      console.log(`Attempting to connect to ${walletId} wallet...`);
      
      // Check if wallet is already connected
      if (this.connectedWallets.has(walletId)) {
        console.log(`Wallet ${walletId} is already connected`);
        const connector = this.connectedWallets.get(walletId)!;
        const address = await connector.getAddress();
        return { 
          success: true, 
          data: { 
            address, 
            network: 'mainnet', 
            walletType: this.getWalletType(walletId) 
          } 
        };
      }
      
      // Create and connect to wallet
      const connector = createWalletConnector(walletId);
      const result = await connector.connect();
      
      if (result.success) {
        this.connectedWallets.set(walletId, connector);
        console.log(`Successfully connected to ${walletId} wallet`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error connecting to ${walletId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Disconnect from a specific wallet
   */
  static async disconnectWallet(walletId: string): Promise<void> {
    try {
      console.log(`Disconnecting wallet ${walletId}...`);
      
      const connector = this.connectedWallets.get(walletId);
      if (connector) {
        await connector.disconnect();
        this.connectedWallets.delete(walletId);
        console.log(`Successfully disconnected from ${walletId} wallet`);
      }
    } catch (error) {
      console.error(`Error disconnecting wallet ${walletId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get balance for a connected wallet
   */
  static async getBalance(walletId: string): Promise<number> {
    try {
      const connector = this.connectedWallets.get(walletId);
      if (!connector) {
        console.warn(`Wallet ${walletId} is not connected`);
        return 0;
      }
      
      return await connector.getBalance();
    } catch (error) {
      console.error(`Error getting balance for wallet ${walletId}:`, error);
      return 0;
    }
  }
  
  /**
   * Get detailed balance information for a connected wallet
   */
  static async getDetailedBalance(walletId: string): Promise<{ confirmed: number; unconfirmed: number; total: number } | null> {
    try {
      const balance = await this.getBalance(walletId);
      
      // For now, return simple balance structure
      // In a real implementation, this would query the blockchain for confirmed/unconfirmed amounts
      return {
        confirmed: balance,
        unconfirmed: 0,
        total: balance
      };
    } catch (error) {
      console.error(`Error getting detailed balance for wallet ${walletId}:`, error);
      return null;
    }
  }
  
  /**
   * Get wallet address for a connected wallet
   */
  static async getWalletAddress(walletId: string): Promise<string | null> {
    try {
      const connector = this.connectedWallets.get(walletId);
      if (!connector) {
        return null;
      }
      
      return await connector.getAddress();
    } catch (error) {
      console.error(`Error getting address for wallet ${walletId}:`, error);
      return null;
    }
  }
  
  /**
   * Check if a wallet is currently connected
   */
  static isWalletConnected(walletId: string): boolean {
    return this.connectedWallets.has(walletId);
  }
  
  /**
   * Get all connected wallet IDs
   */
  static getConnectedWalletIds(): string[] {
    return Array.from(this.connectedWallets.keys());
  }
  
  /**
   * Get wallet type based on wallet ID
   */
  private static getWalletType(walletId: string): 'mobile' | 'web' | 'cross-platform' {
    const mobileWallets = ['bluewallet', 'munn', 'phoenix', 'zengo', 'breez', 'eclair', 'klever'];
    const webWallets = ['sparrow', 'electrum'];
    const crossPlatformWallets = ['casa', 'blockstream', 'unstoppable'];
    
    if (mobileWallets.includes(walletId)) return 'mobile';
    if (webWallets.includes(walletId)) return 'web';
    if (crossPlatformWallets.includes(walletId)) return 'cross-platform';
    
    return 'mobile'; // default
  }

}