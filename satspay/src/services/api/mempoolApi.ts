export interface FeeEstimates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface TransactionStatus {
  confirmed: boolean;
  in_mempool: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

// Mempool API service for fee estimation and transaction broadcasting
export class MempoolApi {
  private static readonly BASE_URL = 'https://mempool.space/api';
  private static readonly TESTNET_URL = 'https://mempool.space/testnet/api';
  private static readonly LOCAL_URL = 'http://localhost:3001/api'; // For local development
  
  private static isLocalDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  private static getBaseUrl(): string {
    if (this.isLocalDevelopment()) {
      return this.LOCAL_URL;
    }
    // Use testnet for development, mainnet for production
    return process.env.NODE_ENV === 'production' ? this.BASE_URL : this.TESTNET_URL;
  }
  
  /**
   * Get current fee estimates from Mempool API
   */
  static async getFeeEstimates(): Promise<FeeEstimates | null> {
    try {
      console.log('Getting fee estimates from Mempool API...');
      
      if (this.isLocalDevelopment()) {
        // Return mock fee estimates for local development
        return {
          fastestFee: 20,
          halfHourFee: 15,
          hourFee: 10,
          economyFee: 5,
          minimumFee: 1,
        };
      }
      
      const response = await fetch(`${this.getBaseUrl()}/v1/fees/recommended`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const feeEstimates = await response.json();
      console.log('Fee estimates received:', feeEstimates);
      
      return feeEstimates;
    } catch (error) {
      console.error('Error fetching fee estimates:', error);
      
      // Return fallback fee estimates
      return {
        fastestFee: 20,
        halfHourFee: 15,
        hourFee: 10,
        economyFee: 5,
        minimumFee: 1,
      };
    }
  }
  
  /**
   * Broadcast a transaction to the Bitcoin network
   */
  static async broadcastTransaction(txHex: string): Promise<string | null> {
    try {
      console.log(`Broadcasting transaction via Mempool API...`);
      
      if (this.isLocalDevelopment()) {
        // Mock successful broadcast for local development
        console.log('Mock broadcast successful (local development)');
        return 'mock_tx_id_' + Date.now();
      }
      
      const response = await fetch(`${this.getBaseUrl()}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: txHex,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Broadcast failed: ${response.status} - ${errorText}`);
      }
      
      const txId = await response.text();
      console.log(`Transaction broadcast successful: ${txId}`);
      
      return txId;
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      return null;
    }
  }
  
  /**
   * Get transaction status from Mempool API
   */
  static async getTransactionStatus(txId: string): Promise<TransactionStatus | null> {
    try {
      console.log(`Getting transaction status from Mempool API: ${txId}`);
      
      if (this.isLocalDevelopment()) {
        // Return mock status for local development
        return {
          confirmed: Math.random() > 0.5, // Random confirmation status
          in_mempool: true,
          block_height: Math.random() > 0.5 ? 800000 : undefined,
        };
      }
      
      const response = await fetch(`${this.getBaseUrl()}/tx/${txId}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const status = await response.json();
      console.log(`Transaction status for ${txId}:`, status);
      
      return {
        confirmed: status.confirmed || false,
        in_mempool: !status.confirmed,
        block_height: status.block_height,
        block_hash: status.block_hash,
        block_time: status.block_time,
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return null;
    }
  }
  
  /**
   * Get address balance from Mempool API
   */
  static async getAddressBalance(address: string): Promise<{ confirmed: number; unconfirmed: number } | null> {
    try {
      console.log(`Getting balance for address: ${address}`);
      
      if (this.isLocalDevelopment()) {
        // Return mock balance for local development
        return {
          confirmed: Math.floor(Math.random() * 100000000), // Random balance in satoshis
          unconfirmed: Math.floor(Math.random() * 10000000),
        };
      }
      
      const response = await fetch(`${this.getBaseUrl()}/address/${address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const addressInfo = await response.json();
      
      return {
        confirmed: addressInfo.chain_stats?.funded_txo_sum || 0,
        unconfirmed: addressInfo.mempool_stats?.funded_txo_sum || 0,
      };
    } catch (error) {
      console.error('Error getting address balance:', error);
      return null;
    }
  }
  
  /**
   * Get UTXOs for an address from Mempool API
   */
  static async getAddressUTXOs(address: string): Promise<any[] | null> {
    try {
      console.log(`Getting UTXOs for address: ${address}`);
      
      if (this.isLocalDevelopment()) {
        // Return mock UTXOs for local development
        return [
          {
            txid: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            vout: 0,
            value: 100000000,
            status: { confirmed: true },
          },
          {
            txid: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            vout: 1,
            value: 50000000,
            status: { confirmed: true },
          },
        ];
      }
      
      const response = await fetch(`${this.getBaseUrl()}/address/${address}/utxo`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const utxos = await response.json();
      console.log(`Found ${utxos.length} UTXOs for address ${address}`);
      
      return utxos;
    } catch (error) {
      console.error('Error getting address UTXOs:', error);
      return null;
    }
  }
}