// Web-specific configuration
import { SHARED_CONFIG } from './shared';
import type { WebConfig } from '../types/config';

export const WEB_CONFIG: WebConfig = {
  ...SHARED_CONFIG,
  
  // Web-specific settings
  PLATFORM: 'web' as const,
  
  // Web-specific API endpoints
  QR_SCANNER_ENABLED: false, // Limited QR scanning on web
  CAMERA_ENABLED: true,
  BIOMETRICS_ENABLED: false, // Limited biometrics on web
  HAPTIC_FEEDBACK_ENABLED: false, // No haptic feedback on web
  
  // Web-specific storage
  STORAGE_TYPE: 'localStorage' as const,
  MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Web-specific UI
  RESPONSIVE_BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  
  // Web-specific features
  FEATURES: {
    PWA_ENABLED: true,
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: true,
    CLIPBOARD_ACCESS: true,
    FILE_DOWNLOAD: true,
    PRINT_SUPPORT: true,
  },
  
  // Web-specific security
  SECURITY: {
    CSP_ENABLED: true,
    HTTPS_REQUIRED: process.env.NODE_ENV === 'production',
    SECURE_COOKIES: process.env.NODE_ENV === 'production',
  },
  
  // Web-specific performance
  PERFORMANCE: {
    LAZY_LOADING: true,
    CODE_SPLITTING: true,
    SERVICE_WORKER: true,
    CACHING_STRATEGY: 'cache-first',
  },
};