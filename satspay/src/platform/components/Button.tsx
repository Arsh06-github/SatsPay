// Cross-platform Button component
import React from 'react';
import { PLATFORM_INFO, PLATFORM_SERVICES } from '../adapters/platform';

interface CrossPlatformButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  testID?: string;
}

export const CrossPlatformButton: React.FC<CrossPlatformButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      // Trigger haptic feedback
      PLATFORM_SERVICES.haptics.light();
      onPress();
    }
  };

  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML button
    const baseClasses = 'btn-professional text-crisp font-semibold inline-flex items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-professional',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500 shadow-professional',
      success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 shadow-professional',
      warning: 'bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500 shadow-professional',
      error: 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500 shadow-professional',
      outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[2.25rem]',
      md: 'px-4 py-2.5 text-base min-h-[2.75rem]',
      lg: 'px-6 py-3 text-lg min-h-[3.25rem]',
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100';
    const loadingClasses = 'cursor-wait';
    
    return (
      <button
        className={`
          ${baseClasses} 
          ${variantClasses[variant]} 
          ${sizeClasses[size]} 
          ${(disabled || loading) ? disabledClasses : ''} 
          ${loading ? loadingClasses : ''} 
        `}
        onClick={handlePress}
        disabled={disabled || loading}
        data-testid={testID}
        style={style}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {title}
      </button>
    );
  } else {
    // React Native implementation
    // This would use React Native components
    return (
      <div
        onClick={handlePress}
        style={{
          padding: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
          backgroundColor: variant === 'primary' ? '#3B82F6' : '#6B7280',
          borderRadius: 8,
          opacity: disabled || loading ? 0.5 : 1,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        data-testid={testID}
      >
        {loading && <div style={{ marginRight: 8 }}>⏳</div>}
        <span style={{ color: 'white', fontWeight: '600' }}>{title}</span>
      </div>
    );
  }
};