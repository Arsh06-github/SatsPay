// Cross-platform Text component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: any;
  testID?: string;
}

export const CrossPlatformText: React.FC<CrossPlatformTextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  style,
  testID,
}) => {
  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML elements with Tailwind classes
    const getVariantClasses = () => {
      switch (variant) {
        case 'h1': return 'text-4xl font-bold';
        case 'h2': return 'text-3xl font-bold';
        case 'h3': return 'text-2xl font-semibold';
        case 'h4': return 'text-xl font-semibold';
        case 'caption': return 'text-sm';
        case 'label': return 'text-sm font-medium';
        case 'body':
        default: return 'text-base';
      }
    };

    const getColorClasses = () => {
      switch (color) {
        case 'primary': return 'text-primary-700';
        case 'secondary': return 'text-secondary-700';
        case 'success': return 'text-success-600';
        case 'warning': return 'text-warning-600';
        case 'error': return 'text-error-600';
        case 'muted': return 'text-secondary-500';
        default: return 'text-secondary-700';
      }
    };

    const getWeightClasses = () => {
      switch (weight) {
        case 'medium': return 'font-medium';
        case 'semibold': return 'font-semibold';
        case 'bold': return 'font-bold';
        case 'normal':
        default: return 'font-normal';
      }
    };

    const getAlignClasses = () => {
      switch (align) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        case 'left':
        default: return 'text-left';
      }
    };

    const Element = variant.startsWith('h') ? variant as keyof React.JSX.IntrinsicElements : 'span';

    return (
      <Element
        className={`
          ${getVariantClasses()}
          ${getColorClasses()}
          ${getWeightClasses()}
          ${getAlignClasses()}
        `}
        style={style}
        data-testid={testID}
      >
        {children}
      </Element>
    );
  } else {
    // React Native implementation
    const getFontSize = () => {
      switch (variant) {
        case 'h1': return 36;
        case 'h2': return 30;
        case 'h3': return 24;
        case 'h4': return 20;
        case 'caption': return 14;
        case 'label': return 14;
        case 'body':
        default: return 16;
      }
    };

    const getColor = () => {
      switch (color) {
        case 'primary': return '#1D4ED8';
        case 'secondary': return '#374151';
        case 'success': return '#059669';
        case 'warning': return '#D97706';
        case 'error': return '#DC2626';
        case 'muted': return '#6B7280';
        default: return '#374151';
      }
    };

    const getFontWeight = () => {
      switch (weight) {
        case 'medium': return '500';
        case 'semibold': return '600';
        case 'bold': return '700';
        case 'normal':
        default: return '400';
      }
    };

    return (
      <span
        style={{
          fontSize: getFontSize(),
          color: getColor(),
          fontWeight: getFontWeight(),
          textAlign: align,
          ...style,
        }}
        data-testid={testID}
      >
        {children}
      </span>
    );
  }
};