/**
 * Extension Wallet Test
 * Tests that Leather and Xverse wallets always show as connected
 */

const ExtensionWalletTest = {
  init() {
    console.log('🔌 Extension Wallet Test initialized');
    
    // Wait for wallet manager to load
    setTimeout(() => {
      this.runExtensionWalletTests();
    }, 3000);
  },

  async runExtensionWalletTests() {
    console.log('🔌 Running extension wallet tests...');
    
    // Test 1: Verify Leather and Xverse show as available
    this.testWalletAvailability();
    
    // Test 2: Test Leather wallet connection
    await this.testLeatherConnection();
    
    // Test 3: Test Xverse wallet connection
    await this.testXverseConnection();
    
    console.log('🔌 Extension wallet tests completed');
  },

  testWalletAvailability() {
    console.log('🔌 Testing wallet availability...');
    
    if (!window.WalletConnectionManager) {
      console.log('❌ WalletConnectionManager not available');
      return;
    }

    const wallets = window.WalletConnectionManager.availableWallets;
    const issues = [];

    if (!wallets.leather || !wallets.leather.installed) {
      issues.push('Leather wallet should be marked as installed');
    }

    if (!wallets.xverse || !wallets.xverse.installed) {
      issues.push('Xverse wallet should be marked as installed');
    }

    if (!wallets.blue || !wallets.blue.installed) {
      issues.push('Blue wallet should be marked as installed');
    }

    if (issues.length === 0) {
      console.log('✅ Wallet availability test PASSED - All wallets marked as available');
    } else {
      console.log('❌ Wallet availability test FAILED:', issues);
    }

    return issues.length === 0;
  },

  async testLeatherConnection() {
    console.log('🔌 Testing Leather wallet connection...');
    
    try {
      if (!window.WalletConnectionManager) {
        console.log('❌ WalletConnectionManager not available');
        return false;
      }

      // Disconnect any existing wallet first
      if (window.WalletConnectionManager.connectedWallet) {
        await window.WalletConnectionManager.disconnectWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Attempt to connect to Leather
      await window.WalletConnectionManager.connectWallet('leather');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if connection was successful
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      const statusText = document.getElementById('status-text');

      const issues = [];

      if (!connectedWallet) {
        issues.push('No wallet connected after Leather connection attempt');
      } else if (connectedWallet.id !== 'leather') {
        issues.push(`Expected Leather wallet, got ${connectedWallet.id}`);
      }

      if (!statusText || statusText.textContent !== 'Connected') {
        issues.push(`Status should be "Connected", got "${statusText?.textContent}"`);
      }

      if (issues.length === 0) {
        console.log('✅ Leather connection test PASSED');
        console.log(`   Connected wallet: ${connectedWallet.name}`);
        console.log(`   Address: ${connectedWallet.address}`);
      } else {
        console.log('❌ Leather connection test FAILED:', issues);
      }

      return issues.length === 0;

    } catch (error) {
      console.log('❌ Error during Leather connection test:', error);
      return false;
    }
  },

  async testXverseConnection() {
    console.log('🔌 Testing Xverse wallet connection...');
    
    try {
      if (!window.WalletConnectionManager) {
        console.log('❌ WalletConnectionManager not available');
        return false;
      }

      // Disconnect any existing wallet first
      if (window.WalletConnectionManager.connectedWallet) {
        await window.WalletConnectionManager.disconnectWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Attempt to connect to Xverse
      await window.WalletConnectionManager.connectWallet('xverse');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if connection was successful
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      const statusText = document.getElementById('status-text');

      const issues = [];

      if (!connectedWallet) {
        issues.push('No wallet connected after Xverse connection attempt');
      } else if (connectedWallet.id !== 'xverse') {
        issues.push(`Expected Xverse wallet, got ${connectedWallet.id}`);
      }

      if (!statusText || statusText.textContent !== 'Connected') {
        issues.push(`Status should be "Connected", got "${statusText?.textContent}"`);
      }

      if (issues.length === 0) {
        console.log('✅ Xverse connection test PASSED');
        console.log(`   Connected wallet: ${connectedWallet.name}`);
        console.log(`   Address: ${connectedWallet.address}`);
      } else {
        console.log('❌ Xverse connection test FAILED:', issues);
      }

      return issues.length === 0;

    } catch (error) {
      console.log('❌ Error during Xverse connection test:', error);
      return false;
    }
  },

  // Manual test functions for console use
  async testLeatherManual() {
    console.log('🔌 Manual Leather test...');
    if (window.WalletConnectionManager) {
      await window.WalletConnectionManager.connectWallet('leather');
    }
  },

  async testXverseManual() {
    console.log('🔌 Manual Xverse test...');
    if (window.WalletConnectionManager) {
      await window.WalletConnectionManager.connectWallet('xverse');
    }
  },

  async testBlueManual() {
    console.log('🔌 Manual Blue Wallet test...');
    if (window.WalletConnectionManager) {
      await window.WalletConnectionManager.connectWallet('blue');
    }
  },

  checkWalletButtons() {
    console.log('🔌 Checking wallet button states...');
    
    const walletButtons = document.querySelectorAll('.wallet-connect-btn');
    walletButtons.forEach(button => {
      const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
      const buttonText = button.querySelector('.connect-text')?.textContent || button.textContent;
      const buttonClasses = Array.from(button.classList);
      
      console.log(`${walletType}: "${buttonText.trim()}" - Classes: ${buttonClasses.join(', ')}`);
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ExtensionWalletTest.init();
});

// Add console commands for manual testing
window.testLeather = () => ExtensionWalletTest.testLeatherManual();
window.testXverse = () => ExtensionWalletTest.testXverseManual();
window.testBlue = () => ExtensionWalletTest.testBlueManual();
window.checkWalletButtons = () => ExtensionWalletTest.checkWalletButtons();

console.log('🔌 Extension Wallet Test loaded. Commands: testLeather(), testXverse(), testBlue(), checkWalletButtons()');

// Export for use in other modules
window.ExtensionWalletTest = ExtensionWalletTest;