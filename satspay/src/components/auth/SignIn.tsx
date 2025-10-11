import React, { useState } from 'react';
import { AuthCredentials } from '../../types/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SignInProps {
  onSignIn: (credentials: AuthCredentials) => Promise<void>;
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp }) => {
  const [credentials, setCredentials] = useState<AuthCredentials>({
    email: '',
    pin: '',
  });
  const [errors, setErrors] = useState<Partial<AuthCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthCredentials> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // PIN validation
    if (!credentials.pin) {
      newErrors.pin = 'PIN is required';
    } else if (credentials.pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(credentials.pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AuthCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    
    try {
      await onSignIn(credentials);
    } catch (error) {
      console.error('Sign in error:', error);
      setGeneralError('Invalid email or PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">
          Welcome back to SatsPay
        </h2>
        <p className="text-secondary-600">
          Sign in to access your Bitcoin wallet
        </p>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md">
          <p className="text-error-700 text-sm">{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={credentials.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

        <Input
          label="4-Digit PIN"
          type="password"
          value={credentials.pin}
          onChange={(e) => handleInputChange('pin', e.target.value)}
          error={errors.pin}
          placeholder="Enter your 4-digit PIN"
          maxLength={4}
          pattern="\d{4}"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;