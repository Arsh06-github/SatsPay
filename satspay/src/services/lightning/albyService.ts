// import { webln } from '@getalby/sdk'; // Not needed for WebLN standard
import { 
  WebLNProvider, 
  LightningBalance, 
  LightningPayment, 
  LightningInvoice,
  LightningConnectionState,
  LightningError 
} from '../../types/lightning';

declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

export class AlbyService {
  private static provider: WebLNProvider | null = null;
  private static connectionState: LightningConnectionState = {
    isConnected: false
  };

  /**
   * Initialize Alby SDK and WebLN provider
   */
  static async initializeAlby(): Promise<boolean> {
    try {
      // Check if WebLN is available in the browser
      if (typeof window !== 'undefined' && window.webln) {
        this.provider = window.webln;
        
        // Enable WebLN provider
        await this.provider.enable();
        
        // Get node information
        const info = await this.provider.getInfo();
        
        this.connectionState = {
          isConnected: true,
          provider: 'webln',
          nodeInfo: info.node,
          lastConnected: Date.now()
        };
        
        console.log('WebLN provider initialized successfully:', info);
        return true;
      }
      
      // Fallback to Alby SDK if WebLN is not available
      console.log('WebLN not available, using Alby SDK fallback');
      
      // Initialize Alby SDK (for future implementation)
      // This would be used for mobile or non-WebLN environments
      this.connectionState = {
        isConnected: false,
        provider: 'alby'
      };
      
      return false;
    } catch (error) {
      console.error('Failed to initialize Alby/WebLN:', error);
      this.connectionState = { isConnected: false };
      return false;
    }
  }

  /**
   * Check if Lightning Network is available and connected
   */
  static isConnected(): boolean {
    return this.connectionState.isConnected && this.provider !== null;
  }

  /**
   * Get current connection state
   */
  static getConnectionState(): LightningConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Create a Lightning invoice
   */
  static async createInvoice(
    amount: number, 
    description: string = '',
    expiry?: number
  ): Promise<LightningInvoice | null> {
    if (!this.isConnected() || !this.provider) {
      throw new LightningError({
        code: 'NOT_CONNECTED',
        message: 'Lightning provider not connected'
      });
    }

    try {
      const invoice = await this.provider.makeInvoice({
        amount,
        defaultMemo: description
      });

      return {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.rHash,
        amount,
        description,
        expiry: expiry || 3600, // Default 1 hour
        timestamp: Date.now(),
        settled: false
      };
    } catch (error) {
      console.error('Failed to create Lightning invoice:', error);
      throw new LightningError({
        code: 'INVOICE_CREATION_FAILED',
        message: 'Failed to create Lightning invoice',
        details: error
      });
    }
  }

  /**
   * Pay a Lightning invoice
   */
  static async payInvoice(paymentRequest: string): Promise<LightningPayment> {
    if (!this.isConnected() || !this.provider) {
      throw new LightningError({
        code: 'NOT_CONNECTED',
        message: 'Lightning provider not connected'
      });
    }

    try {
      const payment = await this.provider.sendPayment(paymentRequest);
      
      return {
        id: payment.paymentHash,
        paymentHash: payment.paymentHash,
        paymentRequest,
        amount: 0, // Amount will be decoded from invoice
        fee: 0, // Fee information may not be available immediately
        status: 'succeeded',
        createdAt: Date.now(),
        settledAt: Date.now()
      };
    } catch (error) {
      console.error('Failed to pay Lightning invoice:', error);
      
      const failedPayment: LightningPayment = {
        id: `failed_${Date.now()}`,
        paymentHash: '',
        paymentRequest,
        amount: 0,
        fee: 0,
        status: 'failed',
        createdAt: Date.now(),
        failureReason: error instanceof Error ? error.message : 'Unknown error'
      };
      
      return failedPayment;
    }
  }

  /**
   * Get Lightning balance (if supported by provider)
   */
  static async getBalance(): Promise<LightningBalance | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      // WebLN doesn't provide balance information by default
      // This would need to be implemented with specific wallet APIs
      console.log('Balance information not available through WebLN standard');
      return null;
    } catch (error) {
      console.error('Failed to get Lightning balance:', error);
      return null;
    }
  }

  /**
   * Sign a message with the Lightning node
   */
  static async signMessage(message: string): Promise<{ signature: string; message: string } | null> {
    if (!this.isConnected() || !this.provider) {
      throw new LightningError({
        code: 'NOT_CONNECTED',
        message: 'Lightning provider not connected'
      });
    }

    try {
      const result = await this.provider.signMessage(message);
      return result;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }

  /**
   * Verify a signed message
   */
  static async verifyMessage(
    signature: string, 
    message: string
  ): Promise<{ valid: boolean; pubkey: string } | null> {
    if (!this.isConnected() || !this.provider) {
      throw new LightningError({
        code: 'NOT_CONNECTED',
        message: 'Lightning provider not connected'
      });
    }

    try {
      const result = await this.provider.verifyMessage(signature, message);
      return result;
    } catch (error) {
      console.error('Failed to verify message:', error);
      return null;
    }
  }

  /**
   * Disconnect from Lightning provider
   */
  static async disconnect(): Promise<void> {
    this.provider = null;
    this.connectionState = { isConnected: false };
    console.log('Disconnected from Lightning provider');
  }

  /**
   * Get node information
   */
  static async getNodeInfo() {
    if (!this.isConnected() || !this.provider) {
      return null;
    }

    try {
      const info = await this.provider.getInfo();
      return info;
    } catch (error) {
      console.error('Failed to get node info:', error);
      return null;
    }
  }
}