// Optimized animation components for 60fps performance
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Performance-optimized animation utilities
export const useRAF = (callback: () => void, deps: React.DependencyList) => {
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    const tick = () => {
      callback();
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, deps);
};

// Optimized 3D card with hardware acceleration
interface OptimizedCard3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowEffect?: boolean;
}

export const OptimizedCard3D: React.FC<OptimizedCard3DProps> = ({
  children,
  className = '',
  intensity = 10,
  glowEffect = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * intensity;
    const rotateY = ((centerX - x) / centerX) * intensity;
    
    // Use transform3d for hardware acceleration
    card.style.transform = `translate3d(0, 0, 0) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, [intensity]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    
    setIsHovered(false);
    // Smooth return to original position
    cardRef.current.style.transform = 'translate3d(0, 0, 0) perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`
        transition-transform duration-300 ease-out
        ${isHovered ? 'scale-105' : 'scale-100'}
        ${glowEffect ? 'animate-glow' : ''}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Optimized haptic feedback with reduced DOM manipulation
interface OptimizedHapticFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'scale' | 'pulse' | 'ripple';
  disabled?: boolean;
}

export const OptimizedHapticFeedback: React.FC<OptimizedHapticFeedbackProps> = ({
  children,
  onClick,
  className = '',
  type = 'scale',
  disabled = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    // Optimized ripple effect using CSS animations
    if (type === 'ripple' && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      // Use CSS custom properties for better performance
      elementRef.current.style.setProperty('--ripple-x', `${x}px`);
      elementRef.current.style.setProperty('--ripple-y', `${y}px`);
      elementRef.current.style.setProperty('--ripple-size', `${size}px`);
      elementRef.current.classList.add('ripple-active');
      
      setTimeout(() => {
        elementRef.current?.classList.remove('ripple-active');
      }, 600);
    }
    
    onClick?.();
  }, [disabled, onClick, type]);

  const getTransformStyle = () => {
    if (disabled) return {};
    
    switch (type) {
      case 'scale':
        return {
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          transition: 'transform 0.1s ease-out',
        };
      case 'pulse':
        return {
          transform: isPressed ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.2s ease-out',
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={elementRef}
      className={`
        cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${type === 'ripple' ? 'relative overflow-hidden' : ''}
        ${className}
      `}
      style={{
        ...getTransformStyle(),
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

// Optimized page transition with Intersection Observer
interface OptimizedPageTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  threshold?: number;
  rootMargin?: string;
}

export const OptimizedPageTransition: React.FC<OptimizedPageTransitionProps> = ({
  children,
  className = '',
  type = 'fade',
  threshold = 0.1,
  rootMargin = '0px',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const getAnimationStyle = () => {
    const baseStyle = {
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
    };

    if (!isVisible) {
      switch (type) {
        case 'slide-up':
          return {
            ...baseStyle,
            transform: 'translate3d(0, 40px, 0)',
            opacity: 0,
          };
        case 'slide-down':
          return {
            ...baseStyle,
            transform: 'translate3d(0, -40px, 0)',
            opacity: 0,
          };
        case 'scale':
          return {
            ...baseStyle,
            transform: 'translate3d(0, 0, 0) scale(0.9)',
            opacity: 0,
          };
        case 'fade':
        default:
          return {
            ...baseStyle,
            opacity: 0,
          };
      }
    }

    return {
      ...baseStyle,
      transform: 'translate3d(0, 0, 0) scale(1)',
      opacity: 1,
    };
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={getAnimationStyle()}
    >
      {children}
    </div>
  );
};

// Optimized floating animation with reduced CPU usage
interface OptimizedFloatingProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  speed?: number;
}

export const OptimizedFloating: React.FC<OptimizedFloatingProps> = ({
  children,
  className = '',
  intensity = 10,
  speed = 2000,
}) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDuration: `${speed}ms`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        '--float-intensity': `${intensity}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return { fps };
};