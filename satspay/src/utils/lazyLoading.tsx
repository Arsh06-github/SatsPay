// Lazy loading utilities for code splitting and performance optimization
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Generic lazy loading wrapper with error boundary
interface LazyWrapperProps {
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyWrapperProps = {}
): LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFunc);
  
  const WrappedComponent = (props: React.ComponentProps<T>) => {
    const { fallback: Fallback = LoadingSpinner, errorFallback: ErrorFallback } = options;
    
    return (
      <ErrorBoundary ErrorFallback={ErrorFallback}>
        <Suspense fallback={<Fallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
  
  return WrappedComponent as LazyExoticComponent<T>;
}

// Error boundary for lazy loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  ErrorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { ErrorFallback } = this.props;
      
      if (ErrorFallback && this.state.error) {
        return <ErrorFallback error={this.state.error} retry={this.retry} />;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-error-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-secondary-600 mb-4">
            Failed to load this component. Please try again.
          </p>
          <button
            onClick={this.retry}
            className="btn-professional bg-primary-600 hover:bg-primary-700 text-white px-4 py-2"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preload utility for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const componentImport = importFunc();
  return componentImport;
};

// Lazy loaded dashboard sections
export const LazyHome = createLazyComponent(
  () => import('../components/dashboard/sections/Home'),
  { fallback: () => <div className="animate-pulse bg-secondary-200 h-64 rounded-lg" /> }
);

export const LazyPay = createLazyComponent(
  () => import('../components/dashboard/sections/Pay'),
  { fallback: () => <div className="animate-pulse bg-secondary-200 h-64 rounded-lg" /> }
);

export const LazyTransactions = createLazyComponent(
  () => import('../components/dashboard/sections/Transactions'),
  { fallback: () => <div className="animate-pulse bg-secondary-200 h-64 rounded-lg" /> }
);

export const LazyX402 = createLazyComponent(
  () => import('../components/dashboard/sections/X402'),
  { fallback: () => <div className="animate-pulse bg-secondary-200 h-64 rounded-lg" /> }
);

// Lazy loaded authentication components
export const LazySignIn = createLazyComponent(
  () => import('../components/auth/SignIn')
);

export const LazySignUp = createLazyComponent(
  () => import('../components/auth/SignUp')
);

// Lazy loaded wallet components
export const LazyWalletList = createLazyComponent(
  () => import('../components/wallet/WalletList')
);

export const LazyWalletConnector = createLazyComponent(
  () => import('../components/wallet/WalletConnector')
);

// Lazy loaded transaction components
export const LazyTransactionList = createLazyComponent(
  () => import('../components/transactions/TransactionList')
);

export const LazyTransactionDetailModal = createLazyComponent(
  () => import('../components/transactions/TransactionDetailModal')
);

// Route-based code splitting
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return createLazyComponent(importFunc, {
    fallback: () => (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    ),
    errorFallback: ({ error, retry }) => (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="text-error-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Page Failed to Load
        </h2>
        <p className="text-secondary-600 mb-6 max-w-md">
          We encountered an error while loading this page. This might be due to a network issue or a temporary problem.
        </p>
        <div className="space-x-4">
          <button
            onClick={retry}
            className="btn-professional bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-professional bg-secondary-600 hover:bg-secondary-700 text-white px-6 py-3"
          >
            Reload Page
          </button>
        </div>
      </div>
    ),
  });
};

// Intersection Observer based lazy loading for images and components
export const useLazyLoad = (threshold = 0.1, rootMargin = '50px') => {
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { isVisible, elementRef };
};

// Lazy image component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className = '',
  ...props
}) => {
  const { isVisible, elementRef } = useLazyLoad();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={`relative ${className}`}>
      {!isVisible && (
        <div className="animate-pulse bg-secondary-200 w-full h-full rounded" />
      )}
      
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
      
      {hasError && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className={className}
          {...props}
        />
      )}
      
      {hasError && !placeholder && (
        <div className="flex items-center justify-center bg-secondary-100 text-secondary-400 w-full h-full rounded">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};