import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook for protecting routes that require authentication
 * @param redirectToAuth - Whether to redirect to auth page if not authenticated
 * @returns Authentication status and user data
 */
export const useAuthGuard = (redirectToAuth: boolean = true) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    checkSession, 
    initializeAuth 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth on component mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Check session validity periodically
    const interval = setInterval(() => {
      checkSession();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthorized: isAuthenticated && checkSession(),
  };
};

/**
 * Hook for session management
 * Automatically refreshes session on user activity
 */
export const useSessionManager = () => {
  const { refreshSession, checkSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh session on user activity
    const handleUserActivity = () => {
      if (checkSession()) {
        refreshSession();
      }
    };

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated, refreshSession, checkSession]);

  return {
    refreshSession,
    checkSession,
  };
};