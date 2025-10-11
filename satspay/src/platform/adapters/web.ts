// Web platform adapter
import { 
  PlatformServices, 
  PlatformStorage, 
  PlatformHaptics, 
  PlatformClipboard,
  PlatformCamera,
  PlatformBiometrics,
  PlatformNotifications
} from '../types';

/**
 * Web storage adapter using localStorage
 */
const webStorage: PlatformStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Web storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Web storage setItem error:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Web storage removeItem error:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Web storage clear error:', error);
      throw error;
    }
  },
};

/**
 * Web haptics adapter (visual feedback only)
 */
const webHaptics: PlatformHaptics = {
  light: () => {
    // Web doesn't have haptic feedback, but we can trigger visual feedback
    document.body.style.transform = 'scale(0.999)';
    setTimeout(() => {
      document.body.style.transform = 'scale(1)';
    }, 50);
  },

  medium: () => {
    document.body.style.transform = 'scale(0.998)';
    setTimeout(() => {
      document.body.style.transform = 'scale(1)';
    }, 100);
  },

  heavy: () => {
    document.body.style.transform = 'scale(0.997)';
    setTimeout(() => {
      document.body.style.transform = 'scale(1)';
    }, 150);
  },

  success: () => webHaptics.light(),
  warning: () => webHaptics.medium(),
  error: () => webHaptics.heavy(),
};

/**
 * Web clipboard adapter
 */
const webClipboard: PlatformClipboard = {
  async getString(): Promise<string> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      }
      return '';
    } catch (error) {
      console.error('Web clipboard getString error:', error);
      return '';
    }
  },

  async setString(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Web clipboard setString error:', error);
      throw error;
    }
  },
};

/**
 * Web camera adapter (using getUserMedia)
 */
const webCamera: PlatformCamera = {
  async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Web camera permission error:', error);
      return false;
    }
  },

  async scanQRCode(): Promise<string | null> {
    // This would integrate with a web QR scanner library
    // For now, return null as placeholder
    console.log('Web QR scanning not implemented yet');
    return null;
  },
};

/**
 * Web biometrics adapter (using WebAuthn when available)
 */
const webBiometrics: PlatformBiometrics = {
  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 
           'credentials' in navigator && 
           'create' in navigator.credentials;
  },

  async authenticate(reason: string): Promise<boolean> {
    try {
      if (!await webBiometrics.isAvailable()) {
        return false;
      }
      
      // This would implement WebAuthn authentication
      // For now, return false as placeholder
      console.log('Web biometric authentication not implemented yet:', reason);
      return false;
    } catch (error) {
      console.error('Web biometric authentication error:', error);
      return false;
    }
  },
};

/**
 * Web notifications adapter
 */
const webNotifications: PlatformNotifications = {
  async requestPermissions(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Web notification permission error:', error);
      return false;
    }
  },

  async scheduleLocal(title: string, body: string, delay: number = 0): Promise<void> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        if (delay > 0) {
          setTimeout(() => {
            new Notification(title, { body });
          }, delay);
        } else {
          new Notification(title, { body });
        }
      }
    } catch (error) {
      console.error('Web notification schedule error:', error);
      throw error;
    }
  },

  async cancelAll(): Promise<void> {
    // Web notifications don't have a built-in cancel all method
    // This would need to be tracked manually if needed
    console.log('Web notification cancelAll not implemented');
  },
};

/**
 * Creates web platform services
 */
export function createWebServices(): PlatformServices {
  return {
    storage: webStorage,
    haptics: webHaptics,
    clipboard: webClipboard,
    camera: webCamera,
    biometrics: webBiometrics,
    notifications: webNotifications,
  };
}