// Cross-platform crypto service
import { PLATFORM_INFO } from '../adapters/platform';

/**
 * Cross-platform crypto service that works on both web and React Native
 */
export class CrossPlatformCrypto {
  /**
   * Generate random bytes
   */
  static generateRandomBytes(length: number): Uint8Array {
    if (PLATFORM_INFO.isWeb) {
      // Web implementation using crypto.getRandomValues
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return array;
    } else {
      // React Native implementation would use react-native-crypto
      // For now, use a simple fallback
      const array = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  }

  /**
   * Generate random hex string
   */
  static generateRandomHex(length: number): string {
    const bytes = this.generateRandomBytes(Math.ceil(length / 2));
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }

  /**
   * Hash data using SHA-256
   */
  static async sha256(data: string): Promise<string> {
    if (PLATFORM_INFO.isWeb) {
      // Web implementation using SubtleCrypto
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // React Native implementation would use react-native-crypto
      // For now, use a simple fallback (not cryptographically secure)
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    }
  }

  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(data: string, key: string): Promise<{ encrypted: string; iv: string } | null> {
    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using SubtleCrypto
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
        const dataBuffer = encoder.encode(data);
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          dataBuffer
        );
        
        return {
          encrypted: Array.from(new Uint8Array(encrypted))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join(''),
          iv: Array.from(iv)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('')
        };
      } else {
        // React Native implementation would use react-native-crypto
        // For now, return null as placeholder
        console.log('Native encryption not implemented');
        return null;
      }
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(encryptedHex: string, key: string, ivHex: string): Promise<string | null> {
    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using SubtleCrypto
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
        
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );
        
        const encrypted = new Uint8Array(
          encryptedHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        const iv = new Uint8Array(
          ivHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          cryptoKey,
          encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
      } else {
        // React Native implementation would use react-native-crypto
        // For now, return null as placeholder
        console.log('Native decryption not implemented');
        return null;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Generate PBKDF2 key from password
   */
  static async deriveKey(password: string, salt: string, iterations: number = 100000): Promise<string | null> {
    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using SubtleCrypto
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);
        
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          passwordBuffer,
          { name: 'PBKDF2' },
          false,
          ['deriveBits']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations,
            hash: 'SHA-256'
          },
          keyMaterial,
          256
        );
        
        return Array.from(new Uint8Array(derivedBits))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
      } else {
        // React Native implementation would use react-native-crypto
        // For now, return null as placeholder
        console.log('Native key derivation not implemented');
        return null;
      }
    } catch (error) {
      console.error('Key derivation error:', error);
      return null;
    }
  }
}