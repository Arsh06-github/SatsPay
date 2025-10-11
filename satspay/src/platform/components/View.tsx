// Cross-platform View component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformViewProps {
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

export const CrossPlatformView: React.FC<CrossPlatformViewProps> = ({
  children,
  style,
  testID,
}) => {
  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML div
    return (
      <div style={style} data-testid={testID}>
        {children}
      </div>
    );
  } else {
    // React Native implementation would use View component
    return (
      <div style={style} data-testid={testID}>
        {children}
      </div>
    );
  }
};