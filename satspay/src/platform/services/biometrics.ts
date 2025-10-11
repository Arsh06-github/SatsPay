// Cross-platform biometrics service
import { PLATFORM_SERVICES } from '../adapters/platform';

/**
 * Cross-platform biometrics service
 */
export class CrossPlatformBiometrics {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      return await PLATFORM_SERVICES.biometrics.isAvailable();
    } catch (error) {
      console.error('Biometrics availability check error:', error);
      return false;
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(reason: string = 'Please authenticate to continue'): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        console.warn('Biometric authentication not available');
        return false;
      }

      return await PLATFORM_SERVICES.biometrics.authenticate(reason);
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  /**
   * Authenticate for wallet access
   */
  static async authenticateForWallet(): Promise<boolean> {
    return this.authenticate('Authenticate to access your wallet');
  }

  /**
   * Authenticate for transaction
   */
  static async authenticateForTransaction(amount?: number): Promise<boolean> {
    const reason = amount 
      ? `Authenticate to send ${amount} BTC`
      : 'Authenticate to complete transaction';
    
    return this.authenticate(reason);
  }

  /**
   * Authenticate for sensitive settings
   */
  static async authenticateForSettings(): Promise<boolean> {
    return this.authenticate('Authenticate to access sensitive settings');
  }

  /**
   * Get biometric type (if available)
   */
  static async getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | 'voice' | 'unknown' | null> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return null;
      }

      // This would need platform-specific implementation to detect biometric type
      // For now, return 'unknown' as placeholder
      return 'unknown';
    } catch (error) {
      console.error('Biometric type detection error:', error);
      return null;
    }
  }

  /**
   * Check if biometric authentication is enrolled
   */
  static async isEnrolled(): Promise<boolean> {
    try {
      // This would check if user has enrolled biometrics
      // For now, assume enrolled if available
      return await this.isAvailable();
    } catch (error) {
      console.error('Biometric enrollment check error:', error);
      return false;
    }
  }
}