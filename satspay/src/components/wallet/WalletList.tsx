import React, { useEffect } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import WalletCard from './WalletCard';
import LoadingSpinner from '../ui/LoadingSpinner';

const WalletList: React.FC = () => {
  const { 
    wallets, 
    connectedWallets, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    initializeWallets 
  } = useWalletStore();

  useEffect(() => {
    // Initialize wallets on component mount
    initializeWallets();
  }, [initializeWallets]);

  const handleConnect = async (walletId: string) => {
    const success = await connectWallet(walletId);
    if (!success) {
      // Error handling is done in the store, but we could show a toast here
      console.error(`Failed to connect to ${walletId}`);
    }
  };

  const handleDisconnect = async (walletId: string) => {
    await disconnectWallet(walletId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-3 text-secondary-600">Connecting to wallet...</span>
      </div>
    );
  }

  // Group wallets by type for better organization
  const mobileWallets = wallets.filter(w => w.type === 'mobile');
  const webWallets = wallets.filter(w => w.type === 'web');
  const crossPlatformWallets = wallets.filter(w => w.type === 'cross-platform');

  return (
    <div className="space-y-8">
      {/* Connected Wallets Summary */}
      {connectedWallets.length > 0 && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <h3 className="font-semibold text-success-800 mb-2">
            Connected Wallets ({connectedWallets.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {connectedWallets.map(wallet => (
              <span 
                key={wallet.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800"
              >
                {wallet.name}
                {wallet.balance && (
                  <span className="ml-2 text-success-600">
                    {wallet.balance.toFixed(8)} BTC
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Wallets */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
          Mobile Wallets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mobileWallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onConnect={() => handleConnect(wallet.id)}
              onDisconnect={() => handleDisconnect(wallet.id)}
            />
          ))}
        </div>
      </div>

      {/* Web Wallets */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
          Web Wallets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {webWallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onConnect={() => handleConnect(wallet.id)}
              onDisconnect={() => handleDisconnect(wallet.id)}
            />
          ))}
        </div>
      </div>

      {/* Cross-Platform Wallets */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
          Cross-Platform Wallets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {crossPlatformWallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onConnect={() => handleConnect(wallet.id)}
              onDisconnect={() => handleDisconnect(wallet.id)}
            />
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <h4 className="font-medium text-secondary-900 mb-2">How to connect wallets:</h4>
        <ul className="text-sm text-secondary-600 space-y-1">
          <li>• <strong>Mobile wallets:</strong> Use QR codes or deep links to connect</li>
          <li>• <strong>Web wallets:</strong> Connect through browser extensions or web interfaces</li>
          <li>• <strong>Cross-platform:</strong> Available on multiple devices and platforms</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletList;