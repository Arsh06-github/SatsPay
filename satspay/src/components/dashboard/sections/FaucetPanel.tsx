import React, { useState, useEffect } from 'react';
import { FaucetService, FaucetInfo } from '../../../services/bitcoin/faucetService';
import { useAuthStore } from '../../../stores/authStore';
import { useWalletStore } from '../../../stores/walletStore';

interface FaucetPanelProps {
  className?: string;
}

export const FaucetPanel: React.FC<FaucetPanelProps> = ({ className = '' }) => {
  const [faucetInfo, setFaucetInfo] = useState<FaucetInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0.02);
  const [targetAddress, setTargetAddress] = useState<string>('');
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(false);

  const { user } = useAuthStore();
  const { connectedWallets } = useWalletStore();

  // Check if faucet is available
  const isAvailable = FaucetService.isAvailable();

  useEffect(() => {
    if (isAvailable) {
      loadFaucetInfo();
      checkHealth();
    }
  }, [isAvailable]);

  const loadFaucetInfo = async () => {
    try {
      const info = await FaucetService.getFaucetInfo();
      setFaucetInfo(info);
    } catch (error) {
      console.error('Failed to load faucet info:', error);
    }
  };

  const checkHealth = async () => {
    const healthy = await FaucetService.isHealthy();
    setIsHealthy(healthy);
  };

  const handleGenerateAddress = async () => {
    setIsLoading(true);
    try {
      const address = await FaucetService.generateTestAddress();
      if (address) {
        setTargetAddress(address);
      }
    } catch (error) {
      console.error('Failed to generate address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestBitcoin = async () => {
    if (!targetAddress || !user) {
      return;
    }

    setIsLoading(true);
    try {
      // Get the first connected wallet ID if available
      const walletId = connectedWallets.length > 0 ? connectedWallets[0].id : undefined;
      
      const result = await FaucetService.requestTestBitcoinWithHistory(
        selectedAmount,
        targetAddress,
        user.id,
        walletId
      );

      if (result?.faucetTx) {
        setLastTransaction(result.faucetTx.txid);
        // Refresh faucet info to show updated balance
        await loadFaucetInfo();
        // Clear the address field
        setTargetAddress('');
      }
    } catch (error) {
      console.error('Failed to request Bitcoin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if faucet is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🚰 Bitcoin Faucet
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isHealthy ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {!isHealthy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Faucet service is not available. Make sure the Bitcoin network is running.
          </p>
        </div>
      )}

      {faucetInfo && (
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Faucet Balance:</span>
              <div className="font-mono font-semibold">
                {faucetInfo.balance.toFixed(8)} BTC
              </div>
            </div>
            <div>
              <span className="text-gray-600">Block Height:</span>
              <div className="font-mono font-semibold">
                {faucetInfo.blockCount}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (BTC)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FaucetService.getAvailableAmounts().map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectedAmount === amount
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {amount} BTC
              </button>
            ))}
          </div>
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bitcoin Address
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="Enter Bitcoin address or generate one"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleGenerateAddress}
              disabled={isLoading || !isHealthy}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Request Button */}
        <button
          onClick={handleRequestBitcoin}
          disabled={isLoading || !targetAddress || !isHealthy}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : `Request ${selectedAmount} BTC`}
        </button>

        {/* Last Transaction */}
        {lastTransaction && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              ✅ Success! Transaction ID:
            </p>
            <p className="text-xs font-mono text-green-700 break-all mt-1">
              {lastTransaction}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 This faucet is only available in development mode with regtest network.
          Transactions are automatically confirmed.
        </p>
      </div>
    </div>
  );
};

export default FaucetPanel;