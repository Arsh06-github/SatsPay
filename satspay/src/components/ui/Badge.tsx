import React from 'react';
import { getStatusColor } from '../../styles/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'pending' | 'autopay' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
  icon,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full text-crisp';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  const variantClasses = getStatusColor(variant);
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;