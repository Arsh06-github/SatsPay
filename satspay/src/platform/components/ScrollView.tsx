// Cross-platform ScrollView component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformScrollViewProps {
  children: React.ReactNode;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  style?: any;
  contentContainerStyle?: any;
  testID?: string;
}

export const CrossPlatformScrollView: React.FC<CrossPlatformScrollViewProps> = ({
  children,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  style,
  contentContainerStyle,
  testID,
}) => {
  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML div with overflow
    const scrollbarStyle = {
      scrollbarWidth: showsVerticalScrollIndicator || showsHorizontalScrollIndicator ? 'thin' : 'none',
      msOverflowStyle: showsVerticalScrollIndicator || showsHorizontalScrollIndicator ? 'auto' : 'none',
    };

    const hideScrollbarStyle = (!showsVerticalScrollIndicator || !showsHorizontalScrollIndicator) ? {
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    } : {};

    return (
      <div
        style={{
          overflow: horizontal ? 'auto' : 'auto',
          overflowX: horizontal ? 'auto' : 'hidden',
          overflowY: horizontal ? 'hidden' : 'auto',
          ...scrollbarStyle,
          ...style,
        }}
        data-testid={testID}
      >
        <div
          style={{
            display: horizontal ? 'flex' : 'block',
            flexDirection: horizontal ? 'row' : 'column',
            ...contentContainerStyle,
          }}
        >
          {children}
        </div>
      </div>
    );
  } else {
    // React Native implementation would use ScrollView
    return (
      <div
        style={{
          overflow: 'auto',
          ...style,
        }}
        data-testid={testID}
      >
        <div style={contentContainerStyle}>
          {children}
        </div>
      </div>
    );
  }
};