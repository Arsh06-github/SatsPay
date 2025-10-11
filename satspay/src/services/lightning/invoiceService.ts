import { DecodedInvoice, LightningError } from '../../types/lightning';

export class InvoiceService {
  /**
   * Decode a Lightning invoice (BOLT11)
   */
  static async decodeInvoice(paymentRequest: string): Promise<DecodedInvoice | null> {
    try {
      // Basic validation
      if (!this.validateInvoice(paymentRequest)) {
        throw new LightningError({
          code: 'INVALID_INVOICE',
          message: 'Invalid Lightning invoice format'
        });
      }

      // For now, we'll use a basic decoder
      // In a production environment, you'd want to use a proper BOLT11 decoder
      const decoded = this.basicInvoiceDecode(paymentRequest);
      
      if (!decoded) {
        throw new LightningError({
          code: 'DECODE_FAILED',
          message: 'Failed to decode Lightning invoice'
        });
      }

      return decoded;
    } catch (error) {
      console.error('Failed to decode Lightning invoice:', error);
      return null;
    }
  }

  /**
   * Validate Lightning invoice format
   */
  static validateInvoice(paymentRequest: string): boolean {
    try {
      // Basic BOLT11 format validation
      if (!paymentRequest || typeof paymentRequest !== 'string') {
        return false;
      }

      // Lightning invoices start with 'ln' followed by network prefix
      const lnRegex = /^ln(bc|tb|bcrt|sb)[0-9]{1,}[02-9ac-hj-np-z]+$/i;
      
      if (!lnRegex.test(paymentRequest)) {
        return false;
      }

      // Additional basic checks
      if (paymentRequest.length < 50) {
        return false; // Too short to be a valid invoice
      }

      return true;
    } catch (error) {
      console.error('Invoice validation error:', error);
      return false;
    }
  }

  /**
   * Extract amount from Lightning invoice
   */
  static extractAmount(paymentRequest: string): number | null {
    try {
      if (!this.validateInvoice(paymentRequest)) {
        return null;
      }

      // Extract amount from BOLT11 invoice
      // This is a simplified implementation
      const match = paymentRequest.match(/ln[a-z]+(\d+)([munp]?)/i);
      
      if (!match) {
        return null;
      }

      const amount = parseInt(match[1]);
      const unit = match[2];

      // Convert to satoshis based on unit
      switch (unit) {
        case 'm': // milli-bitcoin (0.001 BTC)
          return amount * 100000; // 100,000 sats
        case 'u': // micro-bitcoin (0.000001 BTC)
          return amount * 100; // 100 sats
        case 'n': // nano-bitcoin (0.000000001 BTC)
          return Math.round(amount * 0.1); // 0.1 sats
        case 'p': // pico-bitcoin (0.000000000001 BTC)
          return Math.round(amount * 0.0001); // 0.0001 sats
        default:
          return amount; // Assume satoshis if no unit
      }
    } catch (error) {
      console.error('Failed to extract amount from invoice:', error);
      return null;
    }
  }

  /**
   * Check if invoice is expired
   */
  static isExpired(invoice: DecodedInvoice): boolean {
    try {
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = invoice.timestamp + invoice.expiry;
      return now > expiryTime;
    } catch (error) {
      console.error('Failed to check invoice expiry:', error);
      return true; // Assume expired on error for safety
    }
  }

  /**
   * Get invoice expiry time
   */
  static getExpiryTime(invoice: DecodedInvoice): Date {
    const expiryTimestamp = (invoice.timestamp + invoice.expiry) * 1000;
    return new Date(expiryTimestamp);
  }

  /**
   * Format invoice amount for display
   */
  static formatAmount(amountSats: number): string {
    if (amountSats >= 100000000) {
      // Display in BTC for large amounts
      const btc = amountSats / 100000000;
      return `${btc.toFixed(8)} BTC`;
    } else if (amountSats >= 1000) {
      // Display in thousands of sats
      const kSats = amountSats / 1000;
      return `${kSats.toFixed(1)}k sats`;
    } else {
      // Display in sats
      return `${amountSats} sats`;
    }
  }

  /**
   * Basic invoice decoder (simplified implementation)
   * In production, use a proper BOLT11 library
   */
  private static basicInvoiceDecode(paymentRequest: string): DecodedInvoice | null {
    try {
      // This is a very basic implementation
      // In production, you should use a proper BOLT11 decoder library
      
      const amount = this.extractAmount(paymentRequest);
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Generate a mock payment hash for demo purposes
      const paymentHash = this.generateMockHash(paymentRequest);
      
      return {
        paymentRequest,
        paymentHash,
        destination: 'unknown', // Would be extracted from actual invoice
        amount: amount || 0,
        timestamp,
        expiry: 3600, // Default 1 hour
        description: 'Lightning payment',
        routeHints: []
      };
    } catch (error) {
      console.error('Basic decode failed:', error);
      return null;
    }
  }

  /**
   * Generate a mock hash for demo purposes
   */
  private static generateMockHash(input: string): string {
    // Simple hash generation for demo
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Create a QR code data URL for an invoice
   */
  static createQRCodeData(paymentRequest: string): string {
    // Return the payment request as-is for QR code generation
    // The QR code component will handle the actual encoding
    return paymentRequest.toUpperCase();
  }

  /**
   * Parse invoice description
   */
  static parseDescription(paymentRequest: string): string {
    try {
      // This would extract the description from the actual BOLT11 invoice
      // For now, return a default description
      return 'Lightning Network Payment';
    } catch (error) {
      console.error('Failed to parse description:', error);
      return 'Lightning Payment';
    }
  }
}