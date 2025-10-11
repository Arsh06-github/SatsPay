import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSessionManager } from '../../hooks/useAuthGuard';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes authentication and manages sessions
 * Should wrap the entire app to ensure auth state is properly managed
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initializeAuth } = useAuthStore();
  
  // Initialize session management
  useSessionManager();

  useEffect(() => {
    // Initialize authentication on app startup
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

export default AuthProvider;