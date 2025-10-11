// Cross-platform SafeAreaView component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformSafeAreaViewProps {
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

export const CrossPlatformSafeAreaView: React.FC<CrossPlatformSafeAreaViewProps> = ({
  children,
  style,
  testID,
}) => {
  if (PLATFORM_INFO.isWeb) {
    // Web implementation - no safe area needed, just a regular div
    return (
      <div style={style} data-testid={testID}>
        {children}
      </div>
    );
  } else {
    // React Native implementation would use SafeAreaView
    // For now, we'll simulate safe area with padding
    return (
      <div
        style={{
          paddingTop: PLATFORM_INFO.isIOS ? 44 : 24, // Status bar height
          paddingBottom: PLATFORM_INFO.isIOS ? 34 : 0, // Home indicator height
          ...style,
        }}
        data-testid={testID}
      >
        {children}
      </div>
    );
  }
};