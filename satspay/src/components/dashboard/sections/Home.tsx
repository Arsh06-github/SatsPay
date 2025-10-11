import React from 'react';
import Card3D from '../../animations/Card3D';
import WalletList from '../../wallet/WalletList';
import FaucetPanel from './FaucetPanel';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Badge from '../../ui/Badge';
import { useAuthStore } from '../../../stores/authStore';
import { useWalletStore } from '../../../stores/walletStore';

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const { lightningState, connectLightning, disconnectLightning } = useWalletStore();

  return (
    <div className="space-y-8">
      {/* Professional User Profile Information */}
      <Card3D intensity="medium" className="transform-gpu">
        <Card variant="financial" padding="lg" className="hover:shadow-professional-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 text-crisp">
              👤 Profile Information
            </h2>
            <Badge variant="success" icon="✅">
              Verified
            </Badge>
          </div>
          
          {user ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 gradient-financial rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-professional-lg transform-gpu">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary-900 text-crisp">{user.name}</h3>
                  <p className="text-secondary-600 font-medium">{user.email}</p>
                  <Badge variant="info" size="sm" className="mt-2">
                    Professional Account
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-secondary-200">
                <Card padding="md" className="text-center bg-professional-muted">
                  <p className="text-sm font-semibold text-secondary-600 mb-1">Full Name</p>
                  <p className="font-bold text-secondary-900 text-crisp">{user.name}</p>
                </Card>
                <Card padding="md" className="text-center bg-professional-muted">
                  <p className="text-sm font-semibold text-secondary-600 mb-1">Email Address</p>
                  <p className="font-bold text-secondary-900 text-crisp truncate">{user.email}</p>
                </Card>
                <Card padding="md" className="text-center bg-professional-muted">
                  <p className="text-sm font-semibold text-secondary-600 mb-1">Age</p>
                  <p className="font-bold text-secondary-900 text-crisp">{user.age} years</p>
                </Card>
              </div>
              
              <div className="pt-4 border-t border-secondary-200 flex items-center justify-between">
                <p className="text-sm text-secondary-600 font-medium">
                  🗓️ Member since: {user.createdAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary-600 font-medium">No user information available. Please sign in.</p>
            </div>
          )}
        </Card>
      </Card3D>
      
      {/* Professional Lightning Network Status */}
      <Card3D intensity="medium" className="transform-gpu">
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-bitcoin-50 to-warning-50 border-bitcoin-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-bitcoin-900 text-crisp">
              ⚡ Lightning Network
            </h2>
            <Badge 
              variant={lightningState.isConnected ? 'success' : 'warning'} 
              icon={lightningState.isConnected ? '🟢' : '🟡'}
            >
              {lightningState.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-bitcoin-200">
              <div>
                <p className="text-bitcoin-800 font-bold text-lg">
                  {lightningState.isConnected ? 'Network Active' : 'Network Inactive'}
                </p>
                <p className="text-sm text-bitcoin-700 font-medium">
                  {lightningState.isConnected 
                    ? '🚀 Ready for instant, low-fee payments'
                    : '🔌 Connect to enable Lightning payments'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full shadow-professional ${
                  lightningState.isConnected ? 'bg-success-500 animate-pulse' : 'bg-warning-500'
                }`}></div>
                <Badge 
                  variant={lightningState.isConnected ? 'success' : 'warning'} 
                  size="sm"
                >
                  {lightningState.isConnected ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>

            {lightningState.isConnected && lightningState.nodeInfo && (
              <Card padding="md" className="bg-bitcoin-100/50">
                <p className="text-sm text-bitcoin-800 font-semibold mb-2">
                  🏷️ <span className="font-bold">Node:</span> {lightningState.nodeInfo.alias}
                </p>
                <p className="text-xs font-mono text-bitcoin-700 bg-white/60 p-2 rounded-lg">
                  {lightningState.nodeInfo.pubkey.substring(0, 40)}...
                </p>
              </Card>
            )}

            <div className="flex space-x-4">
              {lightningState.isConnected ? (
                <Button
                  onClick={disconnectLightning}
                  variant="warning"
                  size="md"
                >
                  🔌 Disconnect Lightning
                </Button>
              ) : (
                <Button
                  onClick={connectLightning}
                  variant="primary"
                  size="md"
                  className="bg-bitcoin-600 hover:bg-bitcoin-700"
                >
                  ⚡ Connect Lightning Network
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Card3D>

      {/* Professional Wallet Connections */}
      <Card3D intensity="medium" glowEffect className="transform-gpu">
        <Card variant="financial" padding="lg" className="hover:shadow-professional-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 text-crisp">
              💼 Bitcoin Wallet Connections
            </h2>
            <Badge variant="info" icon="🔗">
              Multi-Wallet Support
            </Badge>
          </div>
          
          <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
            <p className="text-secondary-700 font-medium">
              🚀 Connect your Bitcoin wallets to start managing your funds professionally. 
              Support for mobile, web, and cross-platform wallets with enterprise-grade security.
            </p>
          </div>
          
          <WalletList />
        </Card>
      </Card3D>

      {/* Professional Development Faucet Panel */}
      <Card3D intensity="medium" className="transform-gpu">
        <FaucetPanel />
      </Card3D>
    </div>
  );
};

export default Home;