/**
 * Wallet Debug Helper
 * Helps debug wallet extension detection and connection
 */

const WalletDebug = {
  init() {
    this.createDebugPanel();
    this.updateDebugInfo();
    
    // Update debug info every 2 seconds
    setInterval(() => {
      this.updateDebugInfo();
    }, 2000);
    
    console.log('WalletDebug initialized');
  },

  createDebugPanel() {
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'wallet-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      border: 1px solid #333;
      display: none;
    `;
    
    debugPanel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #4ade80;">
        🔍 Wallet Extension Debug
      </div>
      <div id="debug-content">Loading...</div>
      <button id="toggle-debug" style="margin-top: 10px; padding: 5px 10px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Hide Debug
      </button>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Toggle functionality
    document.getElementById('toggle-debug').addEventListener('click', () => {
      const content = document.getElementById('debug-content');
      const button = document.getElementById('toggle-debug');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = 'Hide Debug';
      } else {
        content.style.display = 'none';
        button.textContent = 'Show Debug';
      }
    });

    // Add console commands for developers
    window.showWalletDebug = () => {
      const panel = document.getElementById('wallet-debug-panel');
      if (panel) {
        panel.style.display = 'block';
        console.log('🔍 Wallet debug panel shown. Use hideWalletDebug() to hide it.');
      }
    };

    window.hideWalletDebug = () => {
      const panel = document.getElementById('wallet-debug-panel');
      if (panel) {
        panel.style.display = 'none';
        console.log('🔍 Wallet debug panel hidden. Use showWalletDebug() to show it.');
      }
    };

    // Log console commands availability
    console.log('🔍 Wallet Debug Panel: Hidden by default. Use showWalletDebug() or hideWalletDebug() in console to control visibility.');
  },

  updateDebugInfo() {
    const info = this.gatherWalletInfo();
    
    // Always log debug information to console for developers
    console.group('🔍 Wallet Debug Info - ' + new Date().toLocaleTimeString());
    console.log('Window Objects:', info.windowObjects);
    console.log('Detection Status:', info.detected);
    console.log('Connection Status:', info.connection);
    console.groupEnd();

    // Update visual panel only if it exists
    const debugContent = document.getElementById('debug-content');
    if (!debugContent) return;
    
    debugContent.innerHTML = `
      <div style="margin-bottom: 8px;">
        <strong style="color: #fbbf24;">Window Objects:</strong><br>
        LeatherProvider: ${info.windowObjects.LeatherProvider ? '✅' : '❌'}<br>
        btc: ${info.windowObjects.btc ? '✅' : '❌'}<br>
        StacksProvider: ${info.windowObjects.StacksProvider ? '✅' : '❌'}<br>
        XverseProviders: ${info.windowObjects.XverseProviders ? '✅' : '❌'}<br>
        BitcoinProvider: ${info.windowObjects.BitcoinProvider ? '✅' : '❌'}<br>
        sats: ${info.windowObjects.sats ? '✅' : '❌'}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #34d399;">Detection Status:</strong><br>
        Leather: ${info.detected.leather ? '✅ Detected' : '❌ Not Found'}<br>
        Xverse: ${info.detected.xverse ? '✅ Detected' : '❌ Not Found'}<br>
        Blue: ${info.detected.blue ? '✅ Available' : '❌ Unavailable'}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #60a5fa;">Connection Status:</strong><br>
        Connected: ${info.connection.connected ? '✅ Yes' : '❌ No'}<br>
        Wallet: ${info.connection.walletName || 'None'}<br>
        Type: ${info.connection.walletType || 'None'}
      </div>
      
      <div style="font-size: 10px; color: #9ca3af; margin-top: 8px;">
        Last updated: ${new Date().toLocaleTimeString()}
      </div>
    `;
  },

  gatherWalletInfo() {
    return {
      windowObjects: {
        LeatherProvider: !!window.LeatherProvider,
        btc: !!window.btc,
        StacksProvider: !!window.StacksProvider,
        XverseProviders: !!window.XverseProviders,
        BitcoinProvider: !!window.BitcoinProvider,
        sats: !!window.sats
      },
      detected: {
        leather: window.WalletConnectionManager?.availableWallets?.leather?.installed || false,
        xverse: window.WalletConnectionManager?.availableWallets?.xverse?.installed || false,
        blue: window.WalletConnectionManager?.availableWallets?.blue?.installed || false
      },
      connection: {
        connected: window.WalletConnectionManager?.connectedWallet ? true : false,
        walletName: window.WalletConnectionManager?.connectedWallet?.name || null,
        walletType: window.WalletConnectionManager?.connectedWallet?.id || null
      }
    };
  },

  logExtensionMethods() {
    console.group('🔍 Available Wallet Extension Methods');
    
    if (window.LeatherProvider) {
      console.log('LeatherProvider methods:', Object.getOwnPropertyNames(window.LeatherProvider));
    }
    
    if (window.btc) {
      console.log('btc methods:', Object.getOwnPropertyNames(window.btc));
    }
    
    if (window.XverseProviders) {
      console.log('XverseProviders:', window.XverseProviders);
      if (window.XverseProviders.BitcoinProvider) {
        console.log('XverseProviders.BitcoinProvider methods:', Object.getOwnPropertyNames(window.XverseProviders.BitcoinProvider));
      }
    }
    
    if (window.BitcoinProvider) {
      console.log('BitcoinProvider methods:', Object.getOwnPropertyNames(window.BitcoinProvider));
    }
    
    console.groupEnd();
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  WalletDebug.init();
  
  // Log available methods after a short delay
  setTimeout(() => {
    WalletDebug.logExtensionMethods();
  }, 1000);
});

// Export for use in other modules
window.WalletDebug = WalletDebug;