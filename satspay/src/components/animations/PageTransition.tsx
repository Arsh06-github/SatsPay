import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  duration?: 'fast' | 'normal' | 'slow';
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  type = 'fade',
  duration = 'normal',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getAnimationClass = () => {
    const durationClass = {
      fast: 'duration-200',
      normal: 'duration-300',
      slow: 'duration-500',
    }[duration];

    const baseClasses = `transition-all ease-out ${durationClass}`;

    if (!isVisible) {
      switch (type) {
        case 'slide-up':
          return `${baseClasses} transform translate-y-4 opacity-0`;
        case 'slide-down':
          return `${baseClasses} transform -translate-y-4 opacity-0`;
        case 'scale':
          return `${baseClasses} transform scale-95 opacity-0`;
        case 'fade':
        default:
          return `${baseClasses} opacity-0`;
      }
    }

    return `${baseClasses} transform translate-y-0 scale-100 opacity-100`;
  };

  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;