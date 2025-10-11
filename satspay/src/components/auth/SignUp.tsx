import React, { useState } from 'react';
import { SignUpData, SignUpFormErrors } from '../../types/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SignUpProps {
  onSignUp: (data: SignUpData) => Promise<void>;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    age: 0,
    pin: '',
    confirmPin: '',
  });
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: SignUpFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Age validation
    if (!formData.age || formData.age < 18) {
      newErrors.age = 'You must be at least 18 years old';
    } else if (formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    // PIN validation
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (formData.pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }

    // Confirm PIN validation
    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignUpData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof SignUpFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSignUp(formData);
    } catch (error) {
      console.error('Sign up error:', error);
      // Handle sign up error (could be shown via a toast or error state)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">
          Create your SatsPay account
        </h2>
        <p className="text-secondary-600">
          Join the future of Bitcoin payments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          placeholder="Enter your full name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

        <Input
          label="Age"
          type="number"
          value={formData.age || ''}
          onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
          error={errors.age}
          placeholder="Enter your age"
          min="18"
          max="120"
          required
        />

        <Input
          label="4-Digit PIN"
          type="password"
          value={formData.pin}
          onChange={(e) => handleInputChange('pin', e.target.value)}
          error={errors.pin}
          placeholder="Create a 4-digit PIN"
          maxLength={4}
          pattern="\d{4}"
          required
        />

        <Input
          label="Confirm PIN"
          type="password"
          value={formData.confirmPin}
          onChange={(e) => handleInputChange('confirmPin', e.target.value)}
          error={errors.confirmPin}
          placeholder="Confirm your 4-digit PIN"
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;