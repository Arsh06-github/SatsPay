/**
 * Wallet Status Test
 * Verifies that wallet status shows disconnected by default and only connected when actually connected
 */

const WalletStatusTest = {
  init() {
    console.log('🔌 Wallet Status Test initialized');
    
    // Wait for components to load
    setTimeout(() => {
      this.runWalletStatusTests();
    }, 2000);
  },

  runWalletStatusTests() {
    console.log('🔌 Running wallet status tests...');
    
    // Test 1: Check initial status is disconnected
    this.testInitialDisconnectedStatus();
    
    // Test 2: Test Blue Wallet connection changes status
    setTimeout(() => {
      this.testBlueWalletConnection();
    }, 3000);
    
    // Test 3: Test disconnection reverts status
    setTimeout(() => {
      this.testWalletDisconnection();
    }, 6000);
  },

  testInitialDisconnectedStatus() {
    console.log('🔌 Testing initial disconnected status...');
    
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    
    const issues = [];
    
    if (!statusText || statusText.textContent !== 'Disconnected') {
      issues.push(`Status text should be "Disconnected", got "${statusText?.textContent}"`);
    }
    
    if (!statusIndicator || statusIndicator.classList.contains('connected')) {
      issues.push('Status indicator should not have "connected" class initially');
    }
    
    if (window.WalletConnectionManager?.connectedWallet) {
      issues.push('WalletConnectionManager should not have a connected wallet initially');
    }
    
    if (issues.length === 0) {
      console.log('✅ Initial disconnected status test PASSED');
    } else {
      console.log('❌ Initial disconnected status test FAILED:', issues);
    }
    
    return issues.length === 0;
  },

  async testBlueWalletConnection() {
    console.log('🔌 Testing Blue Wallet connection...');
    
    try {
      // Connect to Blue Wallet
      if (window.WalletConnectionManager) {
        await window.WalletConnectionManager.connectWallet('blue');
        
        // Wait for UI to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if status changed to connected
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');
        
        const issues = [];
        
        if (!statusText || statusText.textContent !== 'Connected') {
          issues.push(`Status text should be "Connected" after connection, got "${statusText?.textContent}"`);
        }
        
        if (!statusIndicator || !statusIndicator.classList.contains('connected')) {
          issues.push('Status indicator should have "connected" class after connection');
        }
        
        if (!window.WalletConnectionManager.connectedWallet) {
          issues.push('WalletConnectionManager should have a connected wallet after connection');
        }
        
        if (issues.length === 0) {
          console.log('✅ Blue Wallet connection test PASSED');
        } else {
          console.log('❌ Blue Wallet connection test FAILED:', issues);
        }
        
        return issues.length === 0;
      } else {
        console.log('❌ WalletConnectionManager not available for connection test');
        return false;
      }
    } catch (error) {
      console.log('❌ Error during Blue Wallet connection test:', error);
      return false;
    }
  },

  async testWalletDisconnection() {
    console.log('🔌 Testing wallet disconnection...');
    
    try {
      // Disconnect wallet
      if (window.WalletConnectionManager) {
        await window.WalletConnectionManager.disconnectWallet();
        
        // Wait for UI to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if status reverted to disconnected
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');
        
        const issues = [];
        
        if (!statusText || statusText.textContent !== 'Disconnected') {
          issues.push(`Status text should be "Disconnected" after disconnection, got "${statusText?.textContent}"`);
        }
        
        if (statusIndicator && statusIndicator.classList.contains('connected')) {
          issues.push('Status indicator should not have "connected" class after disconnection');
        }
        
        if (window.WalletConnectionManager.connectedWallet) {
          issues.push('WalletConnectionManager should not have a connected wallet after disconnection');
        }
        
        if (issues.length === 0) {
          console.log('✅ Wallet disconnection test PASSED');
        } else {
          console.log('❌ Wallet disconnection test FAILED:', issues);
        }
        
        return issues.length === 0;
      } else {
        console.log('❌ WalletConnectionManager not available for disconnection test');
        return false;
      }
    } catch (error) {
      console.log('❌ Error during wallet disconnection test:', error);
      return false;
    }
  },

  // Manual test functions
  checkCurrentStatus() {
    console.log('🔌 Current Wallet Status:');
    
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    const connectedWallet = window.WalletConnectionManager?.connectedWallet;
    
    console.log(`Status Text: "${statusText?.textContent}"`);
    console.log(`Status Indicator Classes: ${statusIndicator?.className}`);
    console.log(`Connected Wallet:`, connectedWallet);
    console.log(`AppState.walletConnected:`, window.AppState?.walletConnected);
  },

  async testConnect() {
    console.log('🔌 Testing wallet connection...');
    if (window.WalletConnectionManager) {
      await window.WalletConnectionManager.connectWallet('blue');
      setTimeout(() => this.checkCurrentStatus(), 1000);
    }
  },

  async testDisconnect() {
    console.log('🔌 Testing wallet disconnection...');
    if (window.WalletConnectionManager) {
      await window.WalletConnectionManager.disconnectWallet();
      setTimeout(() => this.checkCurrentStatus(), 1000);
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WalletStatusTest.init();
});

// Add console commands for manual testing
window.checkWalletStatus = () => WalletStatusTest.checkCurrentStatus();
window.testWalletConnect = () => WalletStatusTest.testConnect();
window.testWalletDisconnect = () => WalletStatusTest.testDisconnect();

console.log('🔌 Wallet Status Test loaded. Commands: checkWalletStatus(), testWalletConnect(), testWalletDisconnect()');

// Export for use in other modules
window.WalletStatusTest = WalletStatusTest;