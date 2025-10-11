import React from 'react';

interface ShimmerEffectProps {
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  className = '',
  children,
  isLoading = true,
}) => {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <div
      className={`
        bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200
        bg-[length:200%_100%]
        animate-shimmer
        rounded-md
        ${className}
      `}
    >
      {!isLoading && children}
    </div>
  );
};

export default ShimmerEffect;