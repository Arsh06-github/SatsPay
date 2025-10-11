import React, { useEffect, Suspense } from 'react';
import { useAuthStore } from './stores/authStore';
import { ErrorBoundary, setupGlobalErrorHandling } from './components/error/ErrorBoundary';
import { PerformanceMonitor, useRenderTime, usePerformanceWarnings } from './utils/performance';
import { OptimizedPageTransition } from './components/animations/OptimizedAnimations';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { initializeX402Services } from './services/x402';

// Lazy load main components for better performance
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const AuthContainer = React.lazy(() => import('./components/auth/AuthContainer'));

// Performance monitoring component
const PerformanceMonitorDisplay: React.FC = () => {
  const warnings = usePerformanceWarnings();
  
  if (process.env.NODE_ENV !== 'development' || warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-warning-100 border border-warning-300 rounded-lg p-3 max-w-sm">
      <h4 className="font-semibold text-warning-800 mb-2">Performance Warnings</h4>
      <ul className="text-sm text-warning-700 space-y-1">
        {warnings.map((warning, index) => (
          <li key={index}>• {warning}</li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  
  // Monitor render performance
  useRenderTime('App');

  // Initialize global error handling
  useEffect(() => {
    setupGlobalErrorHandling();
    
    // Initialize performance monitoring
    const monitor = PerformanceMonitor.getInstance();
    monitor.start();
    
    return () => {
      monitor.stop();
    };
  }, []);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth().catch(error => {
      console.error('Failed to initialize authentication:', error);
    });
  }, [initializeAuth]);

  // Initialize x402 services when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeX402Services().catch(error => {
        console.error('Failed to initialize x402 services:', error);
      });
    }
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <div className="App optimize-animations">
        {/* Performance monitoring in development */}
        <PerformanceMonitorDisplay />
        
        <OptimizedPageTransition type="fade">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }>
            {isAuthenticated ? <Dashboard /> : <AuthContainer />}
          </Suspense>
        </OptimizedPageTransition>
      </div>
    </ErrorBoundary>
  );
}

export default App;
