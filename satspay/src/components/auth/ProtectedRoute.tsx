import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that protects routes requiring authentication
 * Shows loading spinner while checking auth, fallback component if not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthorized, isLoading } = useAuthGuard();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-secondary-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if not authorized
  if (!isAuthorized) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-secondary-600 mb-6">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;