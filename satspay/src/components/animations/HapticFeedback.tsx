import React, { useState } from 'react';

interface HapticFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'bounce' | 'scale' | 'pulse' | 'ripple';
  disabled?: boolean;
}

const HapticFeedback: React.FC<HapticFeedbackProps> = ({
  children,
  onClick,
  className = '',
  type = 'scale',
  disabled = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    setIsAnimating(true);
    
    // Create ripple effect for ripple type
    if (type === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
      `;
      
      e.currentTarget.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 200);
    
    if (onClick) {
      onClick();
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-out';
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }

    const hoverClasses = 'hover:shadow-lg cursor-pointer';
    
    if (isAnimating) {
      switch (type) {
        case 'bounce':
          return `${baseClasses} ${hoverClasses} animate-bounce-subtle`;
        case 'pulse':
          return `${baseClasses} ${hoverClasses} animate-pulse`;
        case 'ripple':
          return `${baseClasses} ${hoverClasses} relative overflow-hidden transform active:scale-95`;
        case 'scale':
        default:
          return `${baseClasses} ${hoverClasses} transform active:scale-95`;
      }
    }

    return `${baseClasses} ${hoverClasses} transform hover:scale-105`;
  };

  return (
    <div
      className={`${getAnimationClasses()} ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default HapticFeedback;