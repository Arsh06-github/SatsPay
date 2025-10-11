// Platform-specific types and interfaces

export type Platform = 'web' | 'ios' | 'android';

export interface PlatformInfo {
  platform: Platform;
  isWeb: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export interface PlatformDimensions {
  width: number;
  height: number;
  scale: number;
}

export interface PlatformStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface PlatformHaptics {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
}

export interface PlatformClipboard {
  getString: () => Promise<string>;
  setString: (text: string) => Promise<void>;
}

export interface PlatformCamera {
  requestPermissions: () => Promise<boolean>;
  scanQRCode: () => Promise<string | null>;
}

export interface PlatformBiometrics {
  isAvailable: () => Promise<boolean>;
  authenticate: (reason: string) => Promise<boolean>;
}

export interface PlatformNotifications {
  requestPermissions: () => Promise<boolean>;
  scheduleLocal: (title: string, body: string, delay?: number) => Promise<void>;
  cancelAll: () => Promise<void>;
}

export interface PlatformServices {
  storage: PlatformStorage;
  haptics: PlatformHaptics;
  clipboard: PlatformClipboard;
  camera: PlatformCamera;
  biometrics: PlatformBiometrics;
  notifications: PlatformNotifications;
}