import React from 'react';

interface FloatingBitcoinProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

const FloatingBitcoin: React.FC<FloatingBitcoinProps> = ({
  size = 'md',
  className = '',
  delay = 0,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-xl',
  }[size];

  return (
    <div
      className={`
        ${sizeClasses}
        bg-gradient-to-br from-bitcoin-400 to-bitcoin-600
        rounded-full
        flex items-center justify-center
        text-white font-bold
        shadow-lg
        animate-float
        ${className}
      `}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      ₿
    </div>
  );
};

export default FloatingBitcoin;