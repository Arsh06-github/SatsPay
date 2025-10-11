// Cross-platform TouchableOpacity component
import React, { useState } from 'react';
import { PLATFORM_INFO, PLATFORM_SERVICES } from '../adapters/platform';

interface CrossPlatformTouchableOpacityProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  activeOpacity?: number;
  style?: any;
  testID?: string;
}

export const CrossPlatformTouchableOpacity: React.FC<CrossPlatformTouchableOpacityProps> = ({
  children,
  onPress,
  disabled = false,
  activeOpacity = 0.7,
  style,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      PLATFORM_SERVICES.haptics.light();
      onPress();
    }
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML div with mouse events
    return (
      <div
        onClick={handlePress}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : isPressed ? activeOpacity : 1,
          transition: 'opacity 0.2s ease',
          ...style,
        }}
        data-testid={testID}
      >
        {children}
      </div>
    );
  } else {
    // React Native implementation would use TouchableOpacity
    return (
      <div
        onClick={handlePress}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        data-testid={testID}
      >
        {children}
      </div>
    );
  }
};