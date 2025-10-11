/**
 * Wallet Status Override
 * Forces wallet status to always show "Connected" across all sections
 */

const WalletStatusOverride = {
  init() {
    console.log('🔗 Wallet Status Override initialized (DISABLED)');
    
    // Override disabled - wallet status will show actual connection state
    console.log('🔗 Wallet status override is disabled. Status will reflect actual wallet connections.');
  },

  forceConnectedStatus() {
    console.log('🔗 Forcing wallet status to Connected...');
    
    // Force AppState
    if (window.AppState) {
      window.AppState.walletConnected = true;
    }

    // Update all wallet status elements
    this.updateAllStatusElements();
    
    // Hide wallet connection check sections (show main content instead)
    this.hideWalletCheckSections();
  },

  updateAllStatusElements() {
    // Main wallet status in home section
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
      statusIndicator.className = 'status-indicator connected';
      statusIndicator.setAttribute('aria-label', 'Wallet connected');
    }

    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = 'Connected';
    }

    // Payment section wallet status
    const paymentWalletName = document.getElementById('payment-wallet-name');
    if (paymentWalletName) {
      paymentWalletName.textContent = 'Blue Wallet';
    }

    const paymentConnectionStatus = document.getElementById('payment-connection-status');
    if (paymentConnectionStatus) {
      paymentConnectionStatus.classList.add('connected');
      const paymentStatusText = paymentConnectionStatus.querySelector('.status-text');
      if (paymentStatusText) {
        paymentStatusText.textContent = 'Connected';
      }
    }

    // Autopay section wallet status
    const autopayWalletName = document.getElementById('autopay-wallet-name');
    if (autopayWalletName) {
      autopayWalletName.textContent = 'Blue Wallet';
    }

    const autopayConnectionStatus = document.getElementById('autopay-connection-status');
    if (autopayConnectionStatus) {
      autopayConnectionStatus.classList.add('connected');
      const autopayStatusText = autopayConnectionStatus.querySelector('.status-text');
      if (autopayStatusText) {
        autopayStatusText.textContent = 'Connected';
      }
    }

    console.log('✅ All wallet status elements updated to Connected');
  },

  hideWalletCheckSections() {
    // Hide wallet check section in Pay
    const walletCheckSection = document.getElementById('wallet-check-section');
    if (walletCheckSection) {
      walletCheckSection.style.display = 'none';
    }

    // Hide wallet check section in Autopay
    const autopayWalletCheckSection = document.getElementById('autopay-wallet-check-section');
    if (autopayWalletCheckSection) {
      autopayWalletCheckSection.style.display = 'none';
    }

    // Show main payment form if it exists
    const paymentForm = document.getElementById('payment-form-section');
    if (paymentForm) {
      paymentForm.style.display = 'block';
      paymentForm.classList.remove('hidden');
    }

    // Show main autopay interface if it exists
    const autopayInterface = document.getElementById('autopay-interface-section');
    if (autopayInterface) {
      autopayInterface.style.display = 'block';
      autopayInterface.classList.remove('hidden');
    }

    console.log('✅ Wallet check sections hidden, main interfaces shown');
  },

  setupStatusOverride() {
    // Override WalletConnectionManager methods if they exist
    if (window.WalletConnectionManager) {
      // Store original methods
      const originalUpdateWalletStatus = window.WalletConnectionManager.updateWalletStatus;
      const originalIsWalletConnected = window.WalletConnectionManager.isWalletConnected;

      // Override updateWalletStatus to always show connected
      window.WalletConnectionManager.updateWalletStatus = () => {
        this.updateAllStatusElements();
      };

      // Override isWalletConnected to always return true
      window.WalletConnectionManager.isWalletConnected = () => {
        return true;
      };

      console.log('✅ WalletConnectionManager methods overridden');
    }

    // Set up periodic status enforcement
    setInterval(() => {
      this.updateAllStatusElements();
    }, 3000);

    console.log('✅ Wallet status override setup completed');
  },

  // Method to simulate a connected wallet
  simulateConnectedWallet() {
    if (window.WalletConnectionManager) {
      // Create a fake connected wallet
      window.WalletConnectionManager.connectedWallet = {
        id: 'blue',
        name: 'Blue Wallet',
        description: 'Lightning & Bitcoin wallet (Simulated)',
        connected: true,
        connectedAt: Date.now(),
        walletId: 'wallet_' + Date.now().toString(36),
        address: 'bc1q' + Math.random().toString(36).substr(2, 25),
        publicKey: '02' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''),
        network: 'mainnet',
        balance: { btc: 0.012, usd: 500.00 },
        isExtension: false
      };

      // Update AppState
      if (window.AppState) {
        window.AppState.walletConnected = true;
      }

      console.log('✅ Simulated connected wallet created');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WalletStatusOverride.init();
});

// Add console command for manual override
window.forceWalletStatus = () => {
  WalletStatusOverride.forceConnectedStatus();
};

// Add console command for simulating connected wallet
window.simulateWallet = () => {
  WalletStatusOverride.simulateConnectedWallet();
};

console.log('🔗 Wallet Status Override loaded. Commands: forceWalletStatus(), simulateWallet()');

// Export for use in other modules
window.WalletStatusOverride = WalletStatusOverride;