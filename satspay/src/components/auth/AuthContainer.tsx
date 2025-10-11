import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthCredentials, SignUpData } from '../../types/auth';
import AuthLayout from './AuthLayout';
import SignIn from './SignIn';
import SignUp from './SignUp';

type AuthMode = 'signin' | 'signup';

const AuthContainer: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const { signIn, signUp, error, clearError } = useAuthStore();

  const handleSignIn = async (credentials: AuthCredentials) => {
    clearError();
    const success = await signIn(credentials);
    if (!success) {
      throw new Error('Sign in failed');
    }
  };

  const handleSignUp = async (signUpData: SignUpData) => {
    clearError();
    const success = await signUp(signUpData);
    if (!success) {
      throw new Error('Sign up failed');
    }
  };

  const switchToSignUp = () => {
    clearError();
    setMode('signup');
  };

  const switchToSignIn = () => {
    clearError();
    setMode('signin');
  };

  return (
    <AuthLayout>
      {mode === 'signin' ? (
        <SignIn 
          onSignIn={handleSignIn}
          onSwitchToSignUp={switchToSignUp}
        />
      ) : (
        <SignUp 
          onSignUp={handleSignUp}
          onSwitchToSignIn={switchToSignIn}
        />
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-md">
          <p className="text-error-700 text-sm text-center">{error}</p>
        </div>
      )}
    </AuthLayout>
  );
};

export default AuthContainer;