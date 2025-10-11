/**
 * Wallet Connection Flow Integration Test
 * Verifies complete wallet connection flow with proper UI feedback
 */

const WalletIntegrationTest = {
  testResults: [],
  
  init() {
    console.log('🧪 Wallet Integration Test initialized');
    this.createTestInterface();
  },

  createTestInterface() {
    // Create test interface
    const testInterface = document.createElement('div');
    testInterface.id = 'wallet-integration-test';
    testInterface.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10001;
      max-width: 400px;
      border: 1px solid #333;
      display: none;
    `;
    
    testInterface.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 15px; color: #4ade80;">
        🧪 Wallet Integration Tests
      </div>
      <div id="test-results" style="margin-bottom: 15px; max-height: 200px; overflow-y: auto;"></div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="run-all-tests" style="padding: 5px 10px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Run All Tests
        </button>
        <button id="test-button-states" style="padding: 5px 10px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Button States
        </button>
        <button id="test-debug-panel" style="padding: 5px 10px; background: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Debug Panel
        </button>
        <button id="test-connection-flow" style="padding: 5px 10px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Connection Flow
        </button>
        <button id="hide-test-interface" style="padding: 5px 10px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Hide
        </button>
      </div>
    `;
    
    document.body.appendChild(testInterface);
    
    // Bind events
    document.getElementById('run-all-tests').addEventListener('click', () => this.runAllTests());
    document.getElementById('test-button-states').addEventListener('click', () => this.testButtonStates());
    document.getElementById('test-debug-panel').addEventListener('click', () => this.testDebugPanel());
    document.getElementById('test-connection-flow').addEventListener('click', () => this.testConnectionFlow());
    document.getElementById('hide-test-interface').addEventListener('click', () => {
      testInterface.style.display = 'none';
    });

    // Add console commands
    window.showWalletIntegrationTest = () => {
      testInterface.style.display = 'block';
      console.log('🧪 Wallet integration test interface shown. Use hideWalletIntegrationTest() to hide it.');
    };

    window.hideWalletIntegrationTest = () => {
      testInterface.style.display = 'none';
      console.log('🧪 Wallet integration test interface hidden. Use showWalletIntegrationTest() to show it.');
    };

    console.log('🧪 Wallet Integration Test interface created. Use showWalletIntegrationTest() to show it.');
  },

  async runAllTests() {
    this.clearResults();
    this.logResult('🧪 Starting comprehensive wallet integration tests...', 'info');
    
    await this.testButtonStates();
    await this.testDebugPanel();
    await this.testConnectionFlow();
    
    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const failed = this.testResults.filter(r => r.status === 'fail').length;
    
    this.logResult(`\n📊 Test Summary: ${passed} passed, ${failed} failed`, failed === 0 ? 'pass' : 'fail');
  },

  async testButtonStates() {
    this.logResult('\n🔘 Testing wallet button states...', 'info');
    
    // Test 1: Check if button state classes exist in CSS
    const testResult1 = this.testButtonStateClasses();
    this.logResult(`Button state CSS classes: ${testResult1.message}`, testResult1.status);
    
    // Test 2: Check button text updates for different states
    const testResult2 = await this.testButtonTextUpdates();
    this.logResult(`Button text updates: ${testResult2.message}`, testResult2.status);
    
    // Test 3: Check button styling changes
    const testResult3 = this.testButtonStyling();
    this.logResult(`Button styling changes: ${testResult3.message}`, testResult3.status);
    
    // Test 4: Check wallet installation status display
    const testResult4 = this.testInstallationStatus();
    this.logResult(`Installation status display: ${testResult4.message}`, testResult4.status);
  },

  testButtonStateClasses() {
    try {
      // Check if required CSS classes exist
      const styleSheets = Array.from(document.styleSheets);
      let hasWarningClass = false;
      let hasSuccessClass = false;
      let hasPrimaryClass = false;
      
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of rules) {
            if (rule.selectorText) {
              if (rule.selectorText.includes('.wallet-connect-btn.warning')) hasWarningClass = true;
              if (rule.selectorText.includes('.wallet-connect-btn.success')) hasSuccessClass = true;
              if (rule.selectorText.includes('.wallet-connect-btn.primary')) hasPrimaryClass = true;
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }
      
      if (hasWarningClass && hasSuccessClass && hasPrimaryClass) {
        return { status: 'pass', message: 'All required CSS classes found' };
      } else {
        const missing = [];
        if (!hasWarningClass) missing.push('warning');
        if (!hasSuccessClass) missing.push('success');
        if (!hasPrimaryClass) missing.push('primary');
        return { status: 'fail', message: `Missing CSS classes: ${missing.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error checking CSS classes: ${error.message}` };
    }
  },

  async testButtonTextUpdates() {
    try {
      const walletButtons = document.querySelectorAll('.wallet-connect-btn');
      if (walletButtons.length === 0) {
        return { status: 'fail', message: 'No wallet buttons found' };
      }
      
      let allButtonsCorrect = true;
      const buttonStates = [];
      
      // Check each wallet button
      walletButtons.forEach(button => {
        const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        
        if (!wallet) {
          allButtonsCorrect = false;
          buttonStates.push(`${walletType}: wallet config not found`);
          return;
        }
        
        const connectText = button.querySelector('.connect-text');
        const disconnectText = button.querySelector('.disconnect-text');
        const buttonText = connectText?.textContent || button.textContent;
        
        // Determine expected state
        let expectedText = 'Connect';
        if (wallet.isExtension && !wallet.installed) {
          expectedText = 'Install Extension';
        } else if (window.WalletConnectionManager?.connectedWallet?.id === walletType) {
          expectedText = 'Connected';
        }
        
        if (buttonText.trim() !== expectedText) {
          allButtonsCorrect = false;
          buttonStates.push(`${walletType}: expected "${expectedText}", got "${buttonText.trim()}"`);
        } else {
          buttonStates.push(`${walletType}: ✓ "${buttonText.trim()}"`);
        }
      });
      
      if (allButtonsCorrect) {
        return { status: 'pass', message: `All button texts correct: ${buttonStates.join(', ')}` };
      } else {
        return { status: 'fail', message: `Button text issues: ${buttonStates.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing button text: ${error.message}` };
    }
  },

  testButtonStyling() {
    try {
      const walletButtons = document.querySelectorAll('.wallet-connect-btn');
      if (walletButtons.length === 0) {
        return { status: 'fail', message: 'No wallet buttons found' };
      }
      
      let allStylingCorrect = true;
      const stylingStates = [];
      
      walletButtons.forEach(button => {
        const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        
        if (!wallet) return;
        
        // Check for expected CSS classes
        let expectedClass = 'primary';
        if (wallet.isExtension && !wallet.installed) {
          expectedClass = 'warning';
        } else if (window.WalletConnectionManager?.connectedWallet?.id === walletType) {
          expectedClass = 'success';
        }
        
        if (button.classList.contains(expectedClass)) {
          stylingStates.push(`${walletType}: ✓ ${expectedClass}`);
        } else {
          allStylingCorrect = false;
          const actualClasses = Array.from(button.classList).filter(c => ['warning', 'success', 'primary'].includes(c));
          stylingStates.push(`${walletType}: expected "${expectedClass}", has "${actualClasses.join(', ') || 'none'}"`);
        }
      });
      
      if (allStylingCorrect) {
        return { status: 'pass', message: `All button styling correct: ${stylingStates.join(', ')}` };
      } else {
        return { status: 'fail', message: `Button styling issues: ${stylingStates.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing button styling: ${error.message}` };
    }
  },

  testInstallationStatus() {
    try {
      const walletItems = document.querySelectorAll('[data-wallet]');
      if (walletItems.length === 0) {
        return { status: 'fail', message: 'No wallet items found' };
      }
      
      let allStatusCorrect = true;
      const statusStates = [];
      
      walletItems.forEach(item => {
        const walletType = item.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        const description = item.querySelector('.wallet-description');
        
        if (!wallet || !description) return;
        
        if (wallet.isExtension && !wallet.installed) {
          if (description.textContent.includes('Not Installed')) {
            statusStates.push(`${walletType}: ✓ shows not installed`);
          } else {
            allStatusCorrect = false;
            statusStates.push(`${walletType}: should show "Not Installed"`);
          }
        } else {
          if (!description.textContent.includes('Not Installed')) {
            statusStates.push(`${walletType}: ✓ shows available`);
          } else {
            allStatusCorrect = false;
            statusStates.push(`${walletType}: should not show "Not Installed"`);
          }
        }
      });
      
      if (allStatusCorrect) {
        return { status: 'pass', message: `All installation status correct: ${statusStates.join(', ')}` };
      } else {
        return { status: 'fail', message: `Installation status issues: ${statusStates.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing installation status: ${error.message}` };
    }
  },

  async testDebugPanel() {
    this.logResult('\n🔍 Testing debug panel visibility...', 'info');
    
    // Test 1: Check if debug panel is hidden by default
    const testResult1 = this.testDebugPanelHidden();
    this.logResult(`Debug panel hidden by default: ${testResult1.message}`, testResult1.status);
    
    // Test 2: Check console commands exist
    const testResult2 = this.testDebugConsoleCommands();
    this.logResult(`Debug console commands: ${testResult2.message}`, testResult2.status);
    
    // Test 3: Check debug panel functionality
    const testResult3 = await this.testDebugPanelFunctionality();
    this.logResult(`Debug panel functionality: ${testResult3.message}`, testResult3.status);
  },

  testDebugPanelHidden() {
    try {
      const debugPanel = document.getElementById('wallet-debug-panel');
      if (!debugPanel) {
        return { status: 'fail', message: 'Debug panel not found' };
      }
      
      const isHidden = debugPanel.style.display === 'none' || 
                      getComputedStyle(debugPanel).display === 'none';
      
      if (isHidden) {
        return { status: 'pass', message: 'Debug panel is properly hidden' };
      } else {
        return { status: 'fail', message: 'Debug panel is visible (should be hidden)' };
      }
    } catch (error) {
      return { status: 'fail', message: `Error checking debug panel: ${error.message}` };
    }
  },

  testDebugConsoleCommands() {
    try {
      const hasShowCommand = typeof window.showWalletDebug === 'function';
      const hasHideCommand = typeof window.hideWalletDebug === 'function';
      
      if (hasShowCommand && hasHideCommand) {
        return { status: 'pass', message: 'Console commands available' };
      } else {
        const missing = [];
        if (!hasShowCommand) missing.push('showWalletDebug');
        if (!hasHideCommand) missing.push('hideWalletDebug');
        return { status: 'fail', message: `Missing commands: ${missing.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error checking console commands: ${error.message}` };
    }
  },

  async testDebugPanelFunctionality() {
    try {
      const debugPanel = document.getElementById('wallet-debug-panel');
      if (!debugPanel) {
        return { status: 'fail', message: 'Debug panel not found' };
      }
      
      // Test show command
      window.showWalletDebug();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const isVisible = debugPanel.style.display !== 'none' && 
                       getComputedStyle(debugPanel).display !== 'none';
      
      if (!isVisible) {
        return { status: 'fail', message: 'Debug panel did not show when commanded' };
      }
      
      // Test hide command
      window.hideWalletDebug();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const isHidden = debugPanel.style.display === 'none' || 
                      getComputedStyle(debugPanel).display === 'none';
      
      if (isHidden) {
        return { status: 'pass', message: 'Debug panel show/hide commands work correctly' };
      } else {
        return { status: 'fail', message: 'Debug panel did not hide when commanded' };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing debug panel functionality: ${error.message}` };
    }
  },

  async testConnectionFlow() {
    this.logResult('\n🔗 Testing wallet connection flow...', 'info');
    
    // Test 1: Check wallet manager initialization
    const testResult1 = this.testWalletManagerInit();
    this.logResult(`Wallet manager initialization: ${testResult1.message}`, testResult1.status);
    
    // Test 2: Check wallet detection
    const testResult2 = this.testWalletDetection();
    this.logResult(`Wallet detection: ${testResult2.message}`, testResult2.status);
    
    // Test 3: Test Blue Wallet connection (simulated)
    const testResult3 = await this.testBlueWalletConnection();
    this.logResult(`Blue Wallet connection: ${testResult3.message}`, testResult3.status);
    
    // Test 4: Check UI updates after connection
    const testResult4 = this.testUIUpdatesAfterConnection();
    this.logResult(`UI updates after connection: ${testResult4.message}`, testResult4.status);
    
    // Test 5: Test disconnection
    const testResult5 = await this.testWalletDisconnection();
    this.logResult(`Wallet disconnection: ${testResult5.message}`, testResult5.status);
  },

  testWalletManagerInit() {
    try {
      if (!window.WalletConnectionManager) {
        return { status: 'fail', message: 'WalletConnectionManager not found' };
      }
      
      const hasAvailableWallets = window.WalletConnectionManager.availableWallets && 
                                 Object.keys(window.WalletConnectionManager.availableWallets).length > 0;
      
      if (!hasAvailableWallets) {
        return { status: 'fail', message: 'No available wallets configured' };
      }
      
      const requiredMethods = ['connectWallet', 'disconnectWallet', 'refreshWalletDisplay'];
      const missingMethods = requiredMethods.filter(method => 
        typeof window.WalletConnectionManager[method] !== 'function'
      );
      
      if (missingMethods.length > 0) {
        return { status: 'fail', message: `Missing methods: ${missingMethods.join(', ')}` };
      }
      
      return { status: 'pass', message: 'WalletConnectionManager properly initialized' };
    } catch (error) {
      return { status: 'fail', message: `Error checking wallet manager: ${error.message}` };
    }
  },

  testWalletDetection() {
    try {
      const wallets = window.WalletConnectionManager.availableWallets;
      const detectionResults = [];
      
      // Check Blue Wallet (should always be available)
      if (wallets.blue && wallets.blue.installed) {
        detectionResults.push('Blue: ✓ available');
      } else {
        detectionResults.push('Blue: ✗ not available');
      }
      
      // Check Leather Wallet
      const leatherDetected = !!(window.LeatherProvider || window.btc || window.StacksProvider);
      if (wallets.leather && wallets.leather.installed === leatherDetected) {
        detectionResults.push(`Leather: ✓ ${leatherDetected ? 'detected' : 'not detected'}`);
      } else {
        detectionResults.push(`Leather: ✗ detection mismatch`);
      }
      
      // Check Xverse Wallet
      const xverseDetected = !!(window.XverseProviders?.BitcoinProvider || window.BitcoinProvider || window.sats);
      if (wallets.xverse && wallets.xverse.installed === xverseDetected) {
        detectionResults.push(`Xverse: ✓ ${xverseDetected ? 'detected' : 'not detected'}`);
      } else {
        detectionResults.push(`Xverse: ✗ detection mismatch`);
      }
      
      return { status: 'pass', message: detectionResults.join(', ') };
    } catch (error) {
      return { status: 'fail', message: `Error testing wallet detection: ${error.message}` };
    }
  },

  async testBlueWalletConnection() {
    try {
      const initialConnectedWallet = window.WalletConnectionManager.connectedWallet;
      
      // If already connected to Blue Wallet, disconnect first
      if (initialConnectedWallet && initialConnectedWallet.id === 'blue') {
        await window.WalletConnectionManager.disconnectWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Attempt to connect to Blue Wallet
      await window.WalletConnectionManager.connectWallet('blue');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      
      if (!connectedWallet) {
        return { status: 'fail', message: 'No wallet connected after connection attempt' };
      }
      
      if (connectedWallet.id !== 'blue') {
        return { status: 'fail', message: `Connected to wrong wallet: ${connectedWallet.id}` };
      }
      
      if (!connectedWallet.address) {
        return { status: 'fail', message: 'Connected wallet has no address' };
      }
      
      return { status: 'pass', message: `Successfully connected to Blue Wallet (${connectedWallet.address.substring(0, 10)}...)` };
    } catch (error) {
      return { status: 'fail', message: `Error testing Blue Wallet connection: ${error.message}` };
    }
  },

  testUIUpdatesAfterConnection() {
    try {
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        return { status: 'fail', message: 'No wallet connected to test UI updates' };
      }
      
      const issues = [];
      
      // Check status indicator
      const statusIndicator = document.getElementById('status-indicator');
      const statusText = document.getElementById('status-text');
      
      if (statusIndicator && !statusIndicator.classList.contains('connected')) {
        issues.push('Status indicator not showing connected state');
      }
      
      if (statusText && statusText.textContent !== 'Connected') {
        issues.push(`Status text incorrect: "${statusText.textContent}"`);
      }
      
      // Check wallet list visibility
      const walletList = document.getElementById('wallet-list');
      const connectedInfo = document.getElementById('connected-wallet-info');
      
      if (walletList && walletList.style.display !== 'none') {
        issues.push('Wallet list should be hidden when connected');
      }
      
      if (connectedInfo && connectedInfo.classList.contains('hidden')) {
        issues.push('Connected wallet info should be visible');
      }
      
      // Check connected wallet button state
      const connectedButton = document.querySelector(`[data-wallet="${connectedWallet.id}"] .wallet-connect-btn`);
      if (connectedButton) {
        const connectText = connectedButton.querySelector('.connect-text');
        const disconnectText = connectedButton.querySelector('.disconnect-text');
        
        if (connectText && !connectText.classList.contains('hidden')) {
          issues.push('Connect text should be hidden for connected wallet');
        }
        
        if (disconnectText && disconnectText.classList.contains('hidden')) {
          issues.push('Disconnect text should be visible for connected wallet');
        }
        
        if (!connectedButton.classList.contains('success')) {
          issues.push('Connected wallet button should have success styling');
        }
      }
      
      if (issues.length === 0) {
        return { status: 'pass', message: 'All UI elements updated correctly after connection' };
      } else {
        return { status: 'fail', message: `UI update issues: ${issues.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing UI updates: ${error.message}` };
    }
  },

  async testWalletDisconnection() {
    try {
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        return { status: 'pass', message: 'No wallet connected to disconnect' };
      }
      
      // Disconnect the wallet
      await window.WalletConnectionManager.disconnectWallet();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stillConnected = window.WalletConnectionManager.connectedWallet;
      if (stillConnected) {
        return { status: 'fail', message: 'Wallet still connected after disconnection' };
      }
      
      // Check UI updates after disconnection
      const statusIndicator = document.getElementById('status-indicator');
      const statusText = document.getElementById('status-text');
      const walletList = document.getElementById('wallet-list');
      const connectedInfo = document.getElementById('connected-wallet-info');
      
      const issues = [];
      
      if (statusIndicator && statusIndicator.classList.contains('connected')) {
        issues.push('Status indicator still showing connected state');
      }
      
      if (statusText && statusText.textContent !== 'Disconnected') {
        issues.push(`Status text incorrect: "${statusText.textContent}"`);
      }
      
      if (walletList && walletList.style.display === 'none') {
        issues.push('Wallet list should be visible when disconnected');
      }
      
      if (connectedInfo && !connectedInfo.classList.contains('hidden')) {
        issues.push('Connected wallet info should be hidden');
      }
      
      if (issues.length === 0) {
        return { status: 'pass', message: 'Wallet disconnected successfully with proper UI updates' };
      } else {
        return { status: 'fail', message: `Disconnection UI issues: ${issues.join(', ')}` };
      }
    } catch (error) {
      return { status: 'fail', message: `Error testing wallet disconnection: ${error.message}` };
    }
  },

  logResult(message, status) {
    const result = { message, status, timestamp: new Date().toLocaleTimeString() };
    this.testResults.push(result);
    
    const resultsContainer = document.getElementById('test-results');
    if (resultsContainer) {
      const resultElement = document.createElement('div');
      resultElement.style.cssText = `
        margin-bottom: 5px;
        padding: 3px 6px;
        border-radius: 3px;
        font-size: 11px;
        ${status === 'pass' ? 'color: #4ade80; background: rgba(74, 222, 128, 0.1);' : ''}
        ${status === 'fail' ? 'color: #f87171; background: rgba(248, 113, 113, 0.1);' : ''}
        ${status === 'info' ? 'color: #60a5fa; background: rgba(96, 165, 250, 0.1);' : ''}
      `;
      resultElement.textContent = `[${result.timestamp}] ${message}`;
      resultsContainer.appendChild(resultElement);
      resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }
    
    // Also log to console with appropriate styling
    const consoleStyle = status === 'pass' ? 'color: #4ade80' : 
                        status === 'fail' ? 'color: #f87171' : 
                        'color: #60a5fa';
    console.log(`%c🧪 ${message}`, consoleStyle);
  },

  clearResults() {
    this.testResults = [];
    const resultsContainer = document.getElementById('test-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for other managers to initialize
  setTimeout(() => {
    WalletIntegrationTest.init();
  }, 2000);
});

// Export for use in other modules
window.WalletIntegrationTest = WalletIntegrationTest;