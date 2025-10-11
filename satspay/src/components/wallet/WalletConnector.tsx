import React, { useState } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import QRCode from '../ui/QRCode';

interface WalletConnectorProps {
  walletId: string;
  walletName: string;
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({
  walletId,
  walletName,
  isOpen,
  onClose,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'instructions' | 'connecting' | 'success' | 'error'>('instructions');
  const [errorMessage, setErrorMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  const { connectWallet } = useWalletStore();

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStep('connecting');
    
    try {
      const success = await connectWallet(walletId);
      
      if (success) {
        setConnectionStep('success');
        setTimeout(() => {
          onClose();
          resetState();
        }, 2000);
      } else {
        setConnectionStep('error');
        setErrorMessage('Failed to connect to wallet. Please try again.');
      }
    } catch (error) {
      setConnectionStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  const resetState = () => {
    setConnectionStep('instructions');
    setErrorMessage('');
    setIsConnecting(false);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const getConnectionInstructions = (walletId: string) => {
    const instructions: { [key: string]: string[] } = {
      bluewallet: [
        'Open BlueWallet on your mobile device',
        'Navigate to Settings > Network',
        'Scan the QR code below or use the deep link',
        'Confirm the connection on your device'
      ],
      sparrow: [
        'Ensure Sparrow Wallet is installed and running',
        'Check that the browser extension is enabled',
        'Click Connect to establish the connection',
        'Approve the connection request in Sparrow'
      ],
      phoenix: [
        'Open Phoenix Wallet on your device',
        'Go to Settings > Connections',
        'Scan the QR code below or use the deep link',
        'Confirm the connection request'
      ],
      munn: [
        'Open Munn Wallet on your mobile device',
        'Navigate to Settings > Connections',
        'Scan the QR code below',
        'Approve the connection request'
      ],
      zengo: [
        'Open ZenGo Wallet on your mobile device',
        'Go to Settings > Connect to dApp',
        'Scan the QR code below',
        'Confirm the connection'
      ],
      default: [
        'Ensure your wallet application is running',
        'Check that any required browser extensions are enabled',
        'Click Connect to initiate the connection process',
        'Follow any prompts in your wallet application'
      ]
    };

    return instructions[walletId] || instructions.default;
  };

  const generateConnectionQRCode = (walletId: string): string => {
    // Generate a connection URL/deep link for the wallet
    // In a real implementation, this would be a proper deep link or connection URL
    const baseUrl = window.location.origin;
    const connectionData = {
      walletId,
      timestamp: Date.now(),
      origin: baseUrl,
      action: 'connect'
    };
    
    // For mobile wallets, create deep links
    const deepLinks: { [key: string]: string } = {
      bluewallet: `bluewallet://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      phoenix: `phoenix://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      munn: `munn://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      zengo: `zengo://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      breez: `breez://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      eclair: `eclair://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`,
      klever: `klever://connect?data=${encodeURIComponent(JSON.stringify(connectionData))}`
    };

    return deepLinks[walletId] || `${baseUrl}/connect/${walletId}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
  };

  const isMobileWallet = (walletId: string): boolean => {
    const mobileWallets = ['bluewallet', 'phoenix', 'munn', 'zengo', 'breez', 'eclair', 'klever'];
    return mobileWallets.includes(walletId);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Connect ${walletName}`}>
      <div className="space-y-6">
        {connectionStep === 'instructions' && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Connection Instructions
              </h3>
              <ol className="space-y-2">
                {getConnectionInstructions(walletId).map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-secondary-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* QR Code for Mobile Wallets */}
            {isMobileWallet(walletId) && (
              <div className="border-t border-secondary-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-900">Connection QR Code</h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowQRCode(!showQRCode)}
                  >
                    {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>
                </div>
                
                {showQRCode && (
                  <div className="flex flex-col items-center space-y-3">
                    <QRCode 
                      value={generateConnectionQRCode(walletId)} 
                      size={200}
                      className="border border-secondary-200 rounded-lg p-2"
                    />
                    <p className="text-sm text-secondary-600 text-center">
                      Scan this QR code with {walletName} to connect
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const deepLink = generateConnectionQRCode(walletId);
                        window.open(deepLink, '_blank');
                      }}
                      className="text-sm"
                    >
                      Open in {walletName}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                Connect Wallet
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {connectionStep === 'connecting' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Connecting to {walletName}...
            </h3>
            <p className="text-secondary-600">
              Please check your wallet application for any connection prompts.
            </p>
          </div>
        )}

        {connectionStep === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-success-900 mb-2">
              Successfully Connected!
            </h3>
            <p className="text-success-700">
              {walletName} is now connected and ready to use.
            </p>
          </div>
        )}

        {connectionStep === 'error' && (
          <>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-error-900 mb-2">
                Connection Failed
              </h3>
              <p className="text-error-700 mb-4">
                {errorMessage}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WalletConnector;