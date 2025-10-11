// Platform detection and service provider
import { PlatformInfo, PlatformServices, Platform } from '../types';
import { createWebServices } from './web';
import { createNativeServices } from './native';

/**
 * Detects the current platform
 */
export function detectPlatform(): PlatformInfo {
  // Check if we're in a React Native environment
  const isReactNative = typeof navigator !== 'undefined' && 
                       navigator.product === 'ReactNative';
  
  if (isReactNative) {
    // In React Native, we can detect iOS vs Android
    const isIOS = typeof navigator !== 'undefined' && 
                  /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return {
      platform: isIOS ? 'ios' : 'android',
      isWeb: false,
      isMobile: true,
      isIOS,
      isAndroid: !isIOS,
    };
  }
  
  // Web environment
  return {
    platform: 'web',
    isWeb: true,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
  };
}

/**
 * Creates platform-specific services
 */
export function createPlatformServices(): PlatformServices {
  const platformInfo = detectPlatform();
  
  if (platformInfo.isWeb) {
    return createWebServices();
  } else {
    return createNativeServices(platformInfo.platform as 'ios' | 'android');
  }
}

// Global platform info
export const PLATFORM_INFO = detectPlatform();

// Global platform services
export const PLATFORM_SERVICES = createPlatformServices();