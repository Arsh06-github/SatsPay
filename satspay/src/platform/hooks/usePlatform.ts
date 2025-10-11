// Cross-platform hook for platform-specific functionality
import { useEffect, useState } from 'react';
import { PLATFORM_INFO, PLATFORM_SERVICES } from '../adapters/platform';
import { WEB_CONFIG } from '../config/web';
import { NATIVE_CONFIG } from '../config/native';
import type { PlatformConfig } from '../types/config';

export interface PlatformFeatures {
  qrScanner: boolean;
  camera: boolean;
  biometrics: boolean;
  hapticFeedback: boolean;
  clipboard: boolean;
  notifications: boolean;
  backgroundSync: boolean;
  deepLinking: boolean;
}

export interface PlatformCapabilities {
  isOnline: boolean;
  biometricsAvailable: boolean;
  cameraPermission: boolean;
  notificationPermission: boolean;
}

/**
 * Hook for accessing platform-specific functionality
 */
export function usePlatform() {
  const [capabilities, setCapabilities] = useState<PlatformCapabilities>({
    isOnline: true,
    biometricsAvailable: false,
    cameraPermission: false,
    notificationPermission: false,
  });

  const config: PlatformConfig = PLATFORM_INFO.isWeb ? WEB_CONFIG : NATIVE_CONFIG;

  const features: PlatformFeatures = {
    qrScanner: config.QR_SCANNER_ENABLED,
    camera: config.CAMERA_ENABLED,
    biometrics: config.BIOMETRICS_ENABLED,
    hapticFeedback: config.HAPTIC_FEEDBACK_ENABLED,
    clipboard: PLATFORM_INFO.isWeb 
      ? (config.FEATURES as any).CLIPBOARD_ACCESS ?? true
      : true,
    notifications: PLATFORM_INFO.isWeb
      ? (config.FEATURES as any).PUSH_NOTIFICATIONS ?? false
      : (config.FEATURES as any).LOCAL_NOTIFICATIONS ?? false,
    backgroundSync: PLATFORM_INFO.isWeb
      ? false
      : (config.FEATURES as any).BACKGROUND_SYNC ?? false,
    deepLinking: PLATFORM_INFO.isWeb
      ? false
      : (config.FEATURES as any).DEEP_LINKING ?? false,
  };

  // Check platform capabilities on mount
  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const [
          biometricsAvailable,
          cameraPermission,
          notificationPermission
        ] = await Promise.all([
          PLATFORM_SERVICES.biometrics.isAvailable(),
          features.camera ? PLATFORM_SERVICES.camera.requestPermissions() : Promise.resolve(false),
          features.notifications ? PLATFORM_SERVICES.notifications.requestPermissions() : Promise.resolve(false),
        ]);

        setCapabilities({
          isOnline: navigator.onLine ?? true,
          biometricsAvailable,
          cameraPermission,
          notificationPermission,
        });
      } catch (error) {
        console.error('Error checking platform capabilities:', error);
      }
    };

    checkCapabilities();

    // Listen for online/offline events on web
    if (PLATFORM_INFO.isWeb) {
      const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
      const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return {
    platform: PLATFORM_INFO,
    config,
    features,
    capabilities,
    services: PLATFORM_SERVICES,
  };
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const { features, services } = usePlatform();

  return {
    light: () => features.hapticFeedback && services.haptics.light(),
    medium: () => features.hapticFeedback && services.haptics.medium(),
    heavy: () => features.hapticFeedback && services.haptics.heavy(),
    success: () => features.hapticFeedback && services.haptics.success(),
    warning: () => features.hapticFeedback && services.haptics.warning(),
    error: () => features.hapticFeedback && services.haptics.error(),
  };
}

/**
 * Hook for clipboard functionality
 */
export function useClipboard() {
  const { features, services } = usePlatform();

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!features.clipboard) {
      console.warn('Clipboard not available on this platform');
      return false;
    }

    try {
      await services.clipboard.setString(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  const readFromClipboard = async (): Promise<string | null> => {
    if (!features.clipboard) {
      console.warn('Clipboard not available on this platform');
      return null;
    }

    try {
      return await services.clipboard.getString();
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return null;
    }
  };

  return {
    copy: copyToClipboard,
    read: readFromClipboard,
    isAvailable: features.clipboard,
  };
}

/**
 * Hook for biometric authentication
 */
export function useBiometrics() {
  const { features, capabilities, services } = usePlatform();

  const authenticate = async (reason?: string): Promise<boolean> => {
    if (!features.biometrics || !capabilities.biometricsAvailable) {
      console.warn('Biometrics not available on this platform');
      return false;
    }

    try {
      return await services.biometrics.authenticate(reason || 'Authenticate to continue');
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return {
    authenticate,
    isAvailable: features.biometrics && capabilities.biometricsAvailable,
  };
}

/**
 * Hook for camera functionality
 */
export function useCamera() {
  const { features, capabilities, services } = usePlatform();

  const scanQRCode = async (): Promise<string | null> => {
    if (!features.qrScanner || !capabilities.cameraPermission) {
      console.warn('QR scanner not available on this platform');
      return null;
    }

    try {
      return await services.camera.scanQRCode();
    } catch (error) {
      console.error('QR code scanning failed:', error);
      return null;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!features.camera) {
      return false;
    }

    try {
      return await services.camera.requestPermissions();
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  };

  return {
    scanQRCode,
    requestPermissions,
    isAvailable: features.camera,
    hasPermission: capabilities.cameraPermission,
  };
}