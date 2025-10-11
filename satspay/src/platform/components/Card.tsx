// Cross-platform Card component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'financial';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: any;
  testID?: string;
}

export const CrossPlatformCard: React.FC<CrossPlatformCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  testID,
}) => {
  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML div with Tailwind classes
    const baseClasses = 'card-professional text-crisp';
    
    const variantClasses = {
      default: 'bg-white border-secondary-200',
      elevated: 'bg-white border-secondary-200 shadow-professional-lg',
      outlined: 'bg-white border-2 border-secondary-300',
      financial: 'bg-gradient-to-br from-white to-secondary-50 border-primary-200 shadow-professional',
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const hoverClasses = onPress ? 'cursor-pointer hover:shadow-professional-lg hover:border-primary-300 hover:-translate-y-1' : '';
    
    return (
      <div
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${hoverClasses}
        `}
        onClick={onPress}
        style={style}
        data-testid={testID}
      >
        {children}
      </div>
    );
  } else {
    // React Native implementation
    const getPadding = () => {
      switch (padding) {
        case 'none': return 0;
        case 'sm': return 16;
        case 'lg': return 32;
        case 'md':
        default: return 24;
      }
    };

    const getBackgroundColor = () => {
      switch (variant) {
        case 'elevated':
        case 'outlined':
        case 'financial':
          return 'white';
        case 'default':
        default:
          return 'white';
      }
    };

    const getShadow = () => {
      if (variant === 'elevated' || variant === 'financial') {
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      }
      return {};
    };

    const getBorder = () => {
      if (variant === 'outlined') {
        return {
          borderWidth: 2,
          borderColor: '#D1D5DB',
        };
      }
      return {
        borderWidth: 1,
        borderColor: '#E5E7EB',
      };
    };

    return (
      <div
        onClick={onPress}
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          padding: getPadding(),
          cursor: onPress ? 'pointer' : 'default',
          ...getBorder(),
          ...getShadow(),
          ...style,
        }}
        data-testid={testID}
      >
        {children}
      </div>
    );
  }
};