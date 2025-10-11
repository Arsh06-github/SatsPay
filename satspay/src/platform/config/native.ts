// React Native-specific configuration
import { SHARED_CONFIG } from './shared';
import type { NativeConfig } from '../types/config';

export const NATIVE_CONFIG: NativeConfig = {
  ...SHARED_CONFIG,
  
  // Native-specific settings
  PLATFORM: 'native' as const,
  
  // Native-specific features
  QR_SCANNER_ENABLED: true,
  CAMERA_ENABLED: true,
  BIOMETRICS_ENABLED: true,
  HAPTIC_FEEDBACK_ENABLED: true,
  
  // Native-specific storage
  STORAGE_TYPE: 'AsyncStorage' as const,
  MAX_STORAGE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Native-specific UI
  SAFE_AREA_ENABLED: true,
  STATUS_BAR_STYLE: 'dark-content' as const,
  
  // Native-specific features
  FEATURES: {
    BACKGROUND_SYNC: true,
    LOCAL_NOTIFICATIONS: true,
    DEEP_LINKING: true,
    SHARE_EXTENSION: true,
    WIDGET_SUPPORT: true,
    KEYCHAIN_ACCESS: true,
  },
  
  // Native-specific security
  SECURITY: {
    KEYCHAIN_ENABLED: true,
    BIOMETRIC_AUTHENTICATION: true,
    APP_LOCK: true,
    SCREENSHOT_PROTECTION: true,
    ROOT_DETECTION: true,
  },
  
  // Native-specific performance
  PERFORMANCE: {
    HERMES_ENABLED: true,
    FLIPPER_ENABLED: process.env.NODE_ENV === 'development',
    MEMORY_OPTIMIZATION: true,
    BATTERY_OPTIMIZATION: true,
  },
  
  // Platform-specific packages
  REQUIRED_PACKAGES: {
    ios: [
      '@react-native-async-storage/async-storage',
      'react-native-haptic-feedback',
      '@react-native-clipboard/clipboard',
      'react-native-biometrics',
      'react-native-keychain',
      'react-native-camera',
      '@react-native-community/netinfo',
    ],
    android: [
      '@react-native-async-storage/async-storage',
      'react-native-haptic-feedback',
      '@react-native-clipboard/clipboard',
      'react-native-biometrics',
      'react-native-keychain',
      'react-native-camera',
      '@react-native-community/netinfo',
    ],
  },
};