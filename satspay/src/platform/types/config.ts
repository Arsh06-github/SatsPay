// Platform configuration types
export interface WebFeatures {
  PWA_ENABLED: boolean;
  OFFLINE_MODE: boolean;
  PUSH_NOTIFICATIONS: boolean;
  CLIPBOARD_ACCESS: boolean;
  FILE_DOWNLOAD: boolean;
  PRINT_SUPPORT: boolean;
}

export interface NativeFeatures {
  BACKGROUND_SYNC: boolean;
  LOCAL_NOTIFICATIONS: boolean;
  DEEP_LINKING: boolean;
  SHARE_EXTENSION: boolean;
  WIDGET_SUPPORT: boolean;
  KEYCHAIN_ACCESS: boolean;
}

export interface BaseConfig {
  PLATFORM: 'web' | 'native';
  QR_SCANNER_ENABLED: boolean;
  CAMERA_ENABLED: boolean;
  BIOMETRICS_ENABLED: boolean;
  HAPTIC_FEEDBACK_ENABLED: boolean;
  STORAGE_TYPE: 'localStorage' | 'AsyncStorage';
  MAX_STORAGE_SIZE: number;
}

export interface WebConfig extends BaseConfig {
  PLATFORM: 'web';
  FEATURES: WebFeatures;
  RESPONSIVE_BREAKPOINTS: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  SECURITY: {
    CSP_ENABLED: boolean;
    HTTPS_REQUIRED: boolean;
    SECURE_COOKIES: boolean;
  };
  PERFORMANCE: {
    LAZY_LOADING: boolean;
    CODE_SPLITTING: boolean;
    SERVICE_WORKER: boolean;
    CACHING_STRATEGY: string;
  };
}

export interface NativeConfig extends BaseConfig {
  PLATFORM: 'native';
  FEATURES: NativeFeatures;
  SAFE_AREA_ENABLED: boolean;
  STATUS_BAR_STYLE: 'dark-content' | 'light-content';
  SECURITY: {
    KEYCHAIN_ENABLED: boolean;
    BIOMETRIC_AUTHENTICATION: boolean;
    APP_LOCK: boolean;
    SCREENSHOT_PROTECTION: boolean;
    ROOT_DETECTION: boolean;
  };
  PERFORMANCE: {
    HERMES_ENABLED: boolean;
    FLIPPER_ENABLED: boolean;
    MEMORY_OPTIMIZATION: boolean;
    BATTERY_OPTIMIZATION: boolean;
  };
  REQUIRED_PACKAGES: {
    ios: string[];
    android: string[];
  };
}

export type PlatformConfig = WebConfig | NativeConfig;