import React, { useState } from 'react';
import { Wallet } from '../../types/wallet';
import Card3D from '../animations/Card3D';
import HapticFeedback from '../animations/HapticFeedback';
import QRCode from '../ui/QRCode';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import FinancialAmount from '../ui/FinancialAmount';
import { 
  handleImageError, 
  getWalletMetadata, 
  getWalletTypeIcon, 
  getWalletTypeColor 
} from '../../utils/walletLogos';

interface WalletCardProps {
  wallet: Wallet;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onConnect,
  onDisconnect,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await onDisconnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const walletMetadata = getWalletMetadata(wallet.id);

  return (
    <Card3D intensity="subtle" className="transform-gpu">
      <HapticFeedback>
        <div className={`card-professional p-6 transition-all duration-300 ${
          wallet.isConnected 
            ? 'border-success-300 bg-gradient-to-br from-success-50 to-white shadow-professional-lg' 
            : 'border-professional-hover hover:shadow-professional-lg'
        }`}>
          {/* Professional Wallet Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={wallet.logo} 
                  alt={wallet.name} 
                  className="w-12 h-12 rounded-xl object-cover shadow-professional transform-gpu"
                  onError={(e) => handleImageError(e, wallet.id, wallet.name)}
                />
                {wallet.isConnected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white flex items-center justify-center shadow-professional">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-secondary-900 text-base text-crisp">{walletMetadata.name}</h3>
                <p className="text-xs text-secondary-600 mb-2 text-crisp">{walletMetadata.description}</p>
                <Badge 
                  variant={wallet.isConnected ? 'success' : 'pending'}
                  size="sm"
                  icon={getWalletTypeIcon(walletMetadata.type)}
                  className={getWalletTypeColor(walletMetadata.type)}
                >
                  {walletMetadata.type.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Professional Features Display */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {walletMetadata.features.slice(0, 3).map((feature, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Professional Connection Status & Balance */}
          {wallet.isConnected && (
            <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-success-200 shadow-professional">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="success" size="sm" icon="🟢">
                  Connected
                </Badge>
                {wallet.balance !== undefined && (
                  <FinancialAmount 
                    amount={wallet.balance} 
                    size="md" 
                    className="text-success-700"
                  />
                )}
              </div>
              {wallet.address && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-secondary-600">Wallet Address:</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="text-xs"
                    >
                      {showQRCode ? '🙈 Hide QR' : '👁️ Show QR'}
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-secondary-700 bg-secondary-50 p-2 rounded-lg truncate">
                    {wallet.address}
                  </p>
                  {showQRCode && (
                    <div className="mt-4 flex justify-center p-3 bg-white rounded-lg shadow-professional">
                      <QRCode value={wallet.address} size={140} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Professional Action Button */}
          <Button
            onClick={wallet.isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            loading={isConnecting}
            variant={wallet.isConnected ? 'error' : 'primary'}
            size="lg"
            className="w-full"
          >
            {wallet.isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </Button>

          {/* Professional Status Footer */}
          {wallet.isConnected && (
            <div className="mt-4 pt-4 border-t border-success-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-success-600">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Ready for secure transactions</span>
              </div>
            </div>
          )}
        </div>
      </HapticFeedback>
    </Card3D>
  );
};

export default WalletCard;