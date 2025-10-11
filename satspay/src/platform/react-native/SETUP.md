# React Native Setup Guide

This guide explains how to set up the React Native version of SatsPay using the cross-platform compatibility layer.

## Prerequisites

- Node.js 16 or higher
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

## Initial Setup

### 1. Create React Native Project

```bash
npx react-native init SatsPayMobile --template react-native-template-typescript
cd SatsPayMobile
```

### 2. Install Dependencies

Copy the dependencies from `package.json.template` and install:

```bash
npm install
# or
yarn install
```

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Copy Platform Files

Copy the entire `src/platform` directory from the web project to the React Native project:

```bash
cp -r ../satspay/src/platform ./src/
```

### 5. Copy Shared Business Logic

Copy shared services, stores, types, and utilities:

```bash
cp -r ../satspay/src/services ./src/
cp -r ../satspay/src/stores ./src/
cp -r ../satspay/src/types ./src/
cp -r ../satspay/src/utils ./src/
```

## Platform-Specific Configuration

### Android Configuration

1. **Permissions** - Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

2. **ProGuard** - Add to `android/app/proguard-rules.pro`:

```
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class bitcoinjs.** { *; }
```

### iOS Configuration

1. **Permissions** - Add to `ios/SatsPayMobile/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to scan QR codes</string>
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure authentication</string>
<key>NSLocalNetworkUsageDescription</key>
<string>This app needs network access for Bitcoin transactions</string>
```

2. **Capabilities** - Enable in Xcode:
   - Face ID
   - Keychain Sharing
   - Background Modes (if needed)

## Component Migration

### 1. Replace Web Components

Replace web-specific components with cross-platform equivalents:

```typescript
// Before (web-specific)
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// After (cross-platform)
import { CrossPlatformButton, CrossPlatformInput } from '../platform/components';
```

### 2. Update Styling

Replace Tailwind CSS classes with React Native styles:

```typescript
// Before (web)
<div className="bg-white p-4 rounded-lg shadow-lg">

// After (React Native)
<View style={{
  backgroundColor: 'white',
  padding: 16,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
}}>
```

### 3. Update Navigation

Replace React Router with React Navigation:

```typescript
// Install React Navigation
npm install @react-navigation/native @react-navigation/stack

// Update navigation structure
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
```

## Service Integration

### 1. Update Storage Service

The `CrossPlatformStorage` service automatically uses AsyncStorage on React Native:

```typescript
import { CrossPlatformStorage } from '../platform/services/storage';

// Works on both web and React Native
await CrossPlatformStorage.setItem('key', 'value');
```

### 2. Update Crypto Service

The `CrossPlatformCrypto` service needs React Native crypto libraries:

```bash
npm install react-native-crypto react-native-randombytes
```

### 3. Update Network Service

The `CrossPlatformNetwork` service works with React Native's fetch API.

## Testing

### 1. Unit Tests

```bash
npm test
```

### 2. Android Testing

```bash
npm run android
```

### 3. iOS Testing

```bash
npm run ios
```

## Build for Production

### Android

```bash
npm run build:android
```

### iOS

```bash
npm run build:ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **Android build issues**: Clean with `cd android && ./gradlew clean`
3. **iOS build issues**: Clean build folder in Xcode
4. **Dependency conflicts**: Check React Native compatibility

### Platform-Specific Debugging

1. **Android**: Use `adb logcat` for logs
2. **iOS**: Use Xcode console for logs
3. **Both**: Use Flipper for debugging

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native Async Storage](https://react-native-async-storage.github.io/async-storage/)
- [React Native Biometrics](https://github.com/SelfLender/react-native-biometrics)

## Next Steps

1. Implement platform-specific UI components
2. Add native Bitcoin wallet integrations
3. Implement push notifications
4. Add deep linking support
5. Optimize performance for mobile devices