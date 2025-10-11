import React from 'react';
import { getWalletLogo, handleImageError } from '../../utils/walletLogos';

interface WalletIconProps {
  walletId: string;
  walletName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  connected?: boolean;
}

const WalletIcon: React.FC<WalletIconProps> = ({
  walletId,
  walletName,
  size = 'md',
  className = '',
  showBorder = true,
  connected = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const borderClasses = showBorder ? 'border border-secondary-200 shadow-professional' : '';
  const connectedClasses = connected ? 'ring-2 ring-success-500 ring-offset-2' : '';

  return (
    <div className={`relative ${className}`}>
      <img
        src={getWalletLogo(walletId)}
        alt={walletName}
        className={`
          ${sizeClasses[size]} 
          rounded-xl object-cover transform-gpu transition-all duration-300
          ${borderClasses} 
          ${connectedClasses}
        `}
        onError={(e) => handleImageError(e, walletId, walletName)}
      />
      {connected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white shadow-professional flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default WalletIcon;