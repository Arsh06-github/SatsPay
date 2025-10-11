// Cross-platform Input component
import React from 'react';
import { PLATFORM_INFO } from '../adapters/platform';

interface CrossPlatformInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  disabled?: boolean;
  style?: any;
  testID?: string;
}

export const CrossPlatformInput: React.FC<CrossPlatformInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  disabled = false,
  style,
  testID,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeText(e.target.value);
  };

  if (PLATFORM_INFO.isWeb) {
    // Web implementation using HTML input
    const inputClasses = `
      input-professional text-crisp
      ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
    `;

    return (
      <div className="space-y-2" style={style}>
        {label && (
          <label className="block text-sm font-semibold text-secondary-700 mb-1">
            {label}
          </label>
        )}
        
        <input
          type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : keyboardType === 'numeric' ? 'number' : 'text'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect ? 'on' : 'off'}
          className={inputClasses}
          data-testid={testID}
        />
        
        {error && (
          <div className="flex items-center mt-1">
            <svg className="w-4 h-4 text-error-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-error-600 font-medium">{error}</p>
          </div>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  } else {
    // React Native implementation
    return (
      <div style={{ marginBottom: 16, ...style }}>
        {label && (
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#374151' }}>
            {label}
          </div>
        )}
        
        <input
          type={secureTextEntry ? 'password' : 'text'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: error ? '#EF4444' : '#D1D5DB',
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: disabled ? '#F3F4F6' : 'white',
            opacity: disabled ? 0.6 : 1,
          }}
          data-testid={testID}
        />
        
        {error && (
          <div style={{ marginTop: 4, color: '#EF4444', fontSize: 14, fontWeight: '500' }}>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div style={{ marginTop: 4, color: '#6B7280', fontSize: 14 }}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
};