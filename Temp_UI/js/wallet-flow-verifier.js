/**
 * Wallet Connection Flow Verifier
 * Comprehensive verification of wallet connection flow integration
 * Tests all requirements from the specification
 */

const WalletFlowVerifier = {
  verificationResults: [],
  
  init() {
    console.log('🔍 Wallet Flow Verifier initialized');
    this.runVerification();
  },

  async runVerification() {
    console.log('🔍 Starting comprehensive wallet connection flow verification...');
    
    // Wait for other managers to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.clearResults();
    
    // Verify all requirements from the specification
    await this.verifyRequirement1(); // Button state management
    await this.verifyRequirement2(); // Debug panel hidden
    await this.verifyRequirement3(); // Visual feedback consistency
    
    this.generateVerificationReport();
  },

  async verifyRequirement1() {
    this.logVerification('\n📋 Verifying Requirement 1: Wallet connection button state management', 'info');
    
    // 1.1: Extension not installed -> "Install Extension"
    await this.verifyRequirement1_1();
    
    // 1.2: Extension installed but not connected -> "Connect"
    await this.verifyRequirement1_2();
    
    // 1.3: Wallet successfully connected -> "Connected" with proper styling
    await this.verifyRequirement1_3();
    
    // 1.4: Connected wallet clicked -> "Disconnect" functionality
    await this.verifyRequirement1_4();
    
    // 1.5: State changes -> immediate UI updates
    await this.verifyRequirement1_5();
  },

  async verifyRequirement1_1() {
    try {
      const walletButtons = document.querySelectorAll('.wallet-connect-btn');
      let extensionNotInstalledCorrect = true;
      const results = [];
      
      walletButtons.forEach(button => {
        const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        
        if (wallet && wallet.isExtension && !wallet.installed) {
          const buttonText = button.querySelector('.connect-text')?.textContent || button.textContent;
          if (buttonText.trim() === 'Install Extension') {
            results.push(`${walletType}: ✓ shows "Install Extension"`);
          } else {
            extensionNotInstalledCorrect = false;
            results.push(`${walletType}: ✗ shows "${buttonText.trim()}" instead of "Install Extension"`);
          }
        }
      });
      
      if (results.length === 0) {
        this.logVerification('1.1: No uninstalled extensions to test', 'info');
      } else if (extensionNotInstalledCorrect) {
        this.logVerification(`1.1: ✓ Extension not installed buttons correct: ${results.join(', ')}`, 'pass');
      } else {
        this.logVerification(`1.1: ✗ Extension not installed button issues: ${results.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`1.1: ✗ Error verifying extension not installed state: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement1_2() {
    try {
      const walletButtons = document.querySelectorAll('.wallet-connect-btn');
      let installedNotConnectedCorrect = true;
      const results = [];
      
      walletButtons.forEach(button => {
        const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        const isConnected = window.WalletConnectionManager?.connectedWallet?.id === walletType;
        
        if (wallet && (!wallet.isExtension || wallet.installed) && !isConnected) {
          const buttonText = button.querySelector('.connect-text')?.textContent || button.textContent;
          if (buttonText.trim() === 'Connect') {
            results.push(`${walletType}: ✓ shows "Connect"`);
          } else {
            installedNotConnectedCorrect = false;
            results.push(`${walletType}: ✗ shows "${buttonText.trim()}" instead of "Connect"`);
          }
        }
      });
      
      if (installedNotConnectedCorrect) {
        this.logVerification(`1.2: ✓ Installed not connected buttons correct: ${results.join(', ')}`, 'pass');
      } else {
        this.logVerification(`1.2: ✗ Installed not connected button issues: ${results.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`1.2: ✗ Error verifying installed not connected state: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement1_3() {
    try {
      // First ensure we have a connected wallet for testing
      const initialConnectedWallet = window.WalletConnectionManager.connectedWallet;
      
      if (!initialConnectedWallet) {
        // Connect to Blue Wallet for testing
        await window.WalletConnectionManager.connectWallet('blue');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('1.3: ✗ Could not establish wallet connection for testing', 'fail');
        return;
      }
      
      const connectedButton = document.querySelector(`[data-wallet="${connectedWallet.id}"] .wallet-connect-btn`);
      if (!connectedButton) {
        this.logVerification('1.3: ✗ Could not find connected wallet button', 'fail');
        return;
      }
      
      const issues = [];
      
      // Check button text
      const disconnectText = connectedButton.querySelector('.disconnect-text');
      if (disconnectText && disconnectText.textContent.trim() === 'Connected') {
        // Good
      } else {
        const buttonText = connectedButton.querySelector('.connect-text')?.textContent || connectedButton.textContent;
        if (buttonText.trim() !== 'Connected') {
          issues.push(`button text is "${buttonText.trim()}" instead of "Connected"`);
        }
      }
      
      // Check button styling
      if (!connectedButton.classList.contains('success')) {
        issues.push('button missing success styling class');
      }
      
      if (issues.length === 0) {
        this.logVerification(`1.3: ✓ Connected wallet button shows "Connected" with proper styling`, 'pass');
      } else {
        this.logVerification(`1.3: ✗ Connected wallet button issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`1.3: ✗ Error verifying connected state: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement1_4() {
    try {
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('1.4: ⚠ No connected wallet to test disconnect functionality', 'info');
        return;
      }
      
      const connectedButton = document.querySelector(`[data-wallet="${connectedWallet.id}"] .wallet-connect-btn`);
      if (!connectedButton) {
        this.logVerification('1.4: ✗ Could not find connected wallet button', 'fail');
        return;
      }
      
      // Check if disconnect functionality is available
      const disconnectBtn = document.getElementById('disconnect-wallet-btn');
      const hasDisconnectButton = !!disconnectBtn;
      
      // Check if clicking connected button triggers disconnect
      const hasClickHandler = connectedButton.onclick || 
                             connectedButton.getAttribute('onclick') ||
                             connectedButton.dataset.wallet; // Has data attribute for event delegation
      
      if (hasDisconnectButton || hasClickHandler) {
        this.logVerification('1.4: ✓ Disconnect functionality available', 'pass');
      } else {
        this.logVerification('1.4: ✗ No disconnect functionality found', 'fail');
      }
    } catch (error) {
      this.logVerification(`1.4: ✗ Error verifying disconnect functionality: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement1_5() {
    try {
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('1.5: ⚠ No connected wallet to test state changes', 'info');
        return;
      }
      
      // Test disconnection and immediate UI update
      const initialStatusText = document.getElementById('status-text')?.textContent;
      
      await window.WalletConnectionManager.disconnectWallet();
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay
      
      const newStatusText = document.getElementById('status-text')?.textContent;
      const walletList = document.getElementById('wallet-list');
      const connectedInfo = document.getElementById('connected-wallet-info');
      
      const issues = [];
      
      if (initialStatusText === newStatusText) {
        issues.push('status text did not update immediately');
      }
      
      if (walletList && walletList.style.display === 'none') {
        issues.push('wallet list did not show immediately');
      }
      
      if (connectedInfo && !connectedInfo.classList.contains('hidden')) {
        issues.push('connected info did not hide immediately');
      }
      
      if (issues.length === 0) {
        this.logVerification('1.5: ✓ UI updates immediately on state changes', 'pass');
      } else {
        this.logVerification(`1.5: ✗ Immediate UI update issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`1.5: ✗ Error verifying immediate state changes: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement2() {
    this.logVerification('\n📋 Verifying Requirement 2: Debug panel hidden from user interface', 'info');
    
    // 2.1: No debugging popup windows
    await this.verifyRequirement2_1();
    
    // 2.2: No technical debugging information in popups
    await this.verifyRequirement2_2();
    
    // 2.3: Debug interfaces hidden from user view
    await this.verifyRequirement2_3();
    
    // 2.4: Debug info logged to console instead
    await this.verifyRequirement2_4();
    
    // 2.5: Only user-friendly messages through toast system
    await this.verifyRequirement2_5();
  },

  async verifyRequirement2_1() {
    try {
      const debugPanel = document.getElementById('wallet-debug-panel');
      if (!debugPanel) {
        this.logVerification('2.1: ✗ Debug panel not found', 'fail');
        return;
      }
      
      const isHidden = debugPanel.style.display === 'none' || 
                      getComputedStyle(debugPanel).display === 'none';
      
      if (isHidden) {
        this.logVerification('2.1: ✓ Debug panel is hidden from user view', 'pass');
      } else {
        this.logVerification('2.1: ✗ Debug panel is visible to users', 'fail');
      }
    } catch (error) {
      this.logVerification(`2.1: ✗ Error verifying debug panel visibility: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement2_2() {
    try {
      // Check that debug panel content is not visible to users
      const debugPanel = document.getElementById('wallet-debug-panel');
      if (!debugPanel) {
        this.logVerification('2.2: ✗ Debug panel not found', 'fail');
        return;
      }
      
      const debugContent = debugPanel.querySelector('#debug-content');
      const isContentHidden = !debugContent || 
                             debugPanel.style.display === 'none' ||
                             getComputedStyle(debugPanel).display === 'none';
      
      if (isContentHidden) {
        this.logVerification('2.2: ✓ Technical debugging information hidden from users', 'pass');
      } else {
        this.logVerification('2.2: ✗ Technical debugging information visible to users', 'fail');
      }
    } catch (error) {
      this.logVerification(`2.2: ✗ Error verifying debug content visibility: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement2_3() {
    try {
      const debugPanel = document.getElementById('wallet-debug-panel');
      const isHidden = !debugPanel || 
                      debugPanel.style.display === 'none' || 
                      getComputedStyle(debugPanel).display === 'none';
      
      // Check for console commands availability
      const hasShowCommand = typeof window.showWalletDebug === 'function';
      const hasHideCommand = typeof window.hideWalletDebug === 'function';
      
      if (isHidden && hasShowCommand && hasHideCommand) {
        this.logVerification('2.3: ✓ Debug interface hidden but accessible via console', 'pass');
      } else if (!isHidden) {
        this.logVerification('2.3: ✗ Debug interface visible to users', 'fail');
      } else {
        this.logVerification('2.3: ✗ Debug interface console commands not available', 'fail');
      }
    } catch (error) {
      this.logVerification(`2.3: ✗ Error verifying debug interface hiding: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement2_4() {
    try {
      // Check if console logging is active by looking for debug methods
      const hasDebugLogging = window.WalletDebug && 
                             typeof window.WalletDebug.updateDebugInfo === 'function';
      
      if (hasDebugLogging) {
        this.logVerification('2.4: ✓ Debug information available in console for developers', 'pass');
      } else {
        this.logVerification('2.4: ✗ Debug console logging not available', 'fail');
      }
    } catch (error) {
      this.logVerification(`2.4: ✗ Error verifying console logging: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement2_5() {
    try {
      // Check if ToastManager exists for user-friendly messages
      const hasToastManager = typeof window.ToastManager === 'object' &&
                             typeof window.ToastManager.show === 'function';
      
      if (hasToastManager) {
        this.logVerification('2.5: ✓ Toast notification system available for user-friendly messages', 'pass');
      } else {
        this.logVerification('2.5: ✗ Toast notification system not available', 'fail');
      }
    } catch (error) {
      this.logVerification(`2.5: ✗ Error verifying toast notification system: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement3() {
    this.logVerification('\n📋 Verifying Requirement 3: Consistent visual feedback', 'info');
    
    // 3.1: Connected state shows "Connected" status
    await this.verifyRequirement3_1();
    
    // 3.2: Connected state uses proper styling
    await this.verifyRequirement3_2();
    
    // 3.3: Disconnected state reverts properly
    await this.verifyRequirement3_3();
    
    // 3.4: All UI elements update consistently
    await this.verifyRequirement3_4();
    
    // 3.5: State persistence across page refreshes
    await this.verifyRequirement3_5();
  },

  async verifyRequirement3_1() {
    try {
      // Ensure we have a connected wallet
      if (!window.WalletConnectionManager.connectedWallet) {
        await window.WalletConnectionManager.connectWallet('blue');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('3.1: ⚠ Could not establish connection for testing', 'info');
        return;
      }
      
      const statusText = document.getElementById('status-text');
      const statusIndicator = document.getElementById('status-indicator');
      
      const issues = [];
      
      if (!statusText || statusText.textContent !== 'Connected') {
        issues.push('status text not showing "Connected"');
      }
      
      if (!statusIndicator || !statusIndicator.classList.contains('connected')) {
        issues.push('status indicator not showing connected state');
      }
      
      if (issues.length === 0) {
        this.logVerification('3.1: ✓ Connected state shows "Connected" status indicator', 'pass');
      } else {
        this.logVerification(`3.1: ✗ Connected status issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`3.1: ✗ Error verifying connected status: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement3_2() {
    try {
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('3.2: ⚠ No connected wallet to test styling', 'info');
        return;
      }
      
      const connectedButton = document.querySelector(`[data-wallet="${connectedWallet.id}"] .wallet-connect-btn`);
      if (!connectedButton) {
        this.logVerification('3.2: ✗ Could not find connected wallet button', 'fail');
        return;
      }
      
      const hasSuccessClass = connectedButton.classList.contains('success');
      const statusIndicator = document.getElementById('status-indicator');
      const hasConnectedClass = statusIndicator && statusIndicator.classList.contains('connected');
      
      if (hasSuccessClass && hasConnectedClass) {
        this.logVerification('3.2: ✓ Connected state uses proper success styling', 'pass');
      } else {
        const issues = [];
        if (!hasSuccessClass) issues.push('button missing success class');
        if (!hasConnectedClass) issues.push('status indicator missing connected class');
        this.logVerification(`3.2: ✗ Connected styling issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`3.2: ✗ Error verifying connected styling: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement3_3() {
    try {
      const wasConnected = !!window.WalletConnectionManager.connectedWallet;
      
      if (wasConnected) {
        await window.WalletConnectionManager.disconnectWallet();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const statusText = document.getElementById('status-text');
      const statusIndicator = document.getElementById('status-indicator');
      const walletButtons = document.querySelectorAll('.wallet-connect-btn');
      
      const issues = [];
      
      if (!statusText || statusText.textContent !== 'Disconnected') {
        issues.push('status text not reverted to "Disconnected"');
      }
      
      if (statusIndicator && statusIndicator.classList.contains('connected')) {
        issues.push('status indicator still showing connected state');
      }
      
      // Check that buttons reverted to "Connect" state
      let buttonsReverted = true;
      walletButtons.forEach(button => {
        const walletType = button.dataset.wallet || button.closest('[data-wallet]')?.dataset.wallet;
        const wallet = window.WalletConnectionManager?.availableWallets?.[walletType];
        
        if (wallet && (!wallet.isExtension || wallet.installed)) {
          const buttonText = button.querySelector('.connect-text')?.textContent || button.textContent;
          if (buttonText.trim() !== 'Connect') {
            buttonsReverted = false;
            issues.push(`${walletType} button not reverted to "Connect"`);
          }
        }
      });
      
      if (issues.length === 0) {
        this.logVerification('3.3: ✓ Disconnected state properly reverts all UI elements', 'pass');
      } else {
        this.logVerification(`3.3: ✗ Disconnection revert issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`3.3: ✗ Error verifying disconnection revert: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement3_4() {
    try {
      // Test consistency by connecting and checking all related elements
      await window.WalletConnectionManager.connectWallet('blue');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const connectedWallet = window.WalletConnectionManager.connectedWallet;
      if (!connectedWallet) {
        this.logVerification('3.4: ⚠ Could not establish connection for consistency test', 'info');
        return;
      }
      
      const elements = {
        statusText: document.getElementById('status-text'),
        statusIndicator: document.getElementById('status-indicator'),
        walletList: document.getElementById('wallet-list'),
        connectedInfo: document.getElementById('connected-wallet-info'),
        connectedButton: document.querySelector(`[data-wallet="${connectedWallet.id}"] .wallet-connect-btn`)
      };
      
      const issues = [];
      
      // Check all elements are consistently updated
      if (!elements.statusText || elements.statusText.textContent !== 'Connected') {
        issues.push('status text inconsistent');
      }
      
      if (!elements.statusIndicator || !elements.statusIndicator.classList.contains('connected')) {
        issues.push('status indicator inconsistent');
      }
      
      if (elements.walletList && elements.walletList.style.display !== 'none') {
        issues.push('wallet list should be hidden');
      }
      
      if (elements.connectedInfo && elements.connectedInfo.classList.contains('hidden')) {
        issues.push('connected info should be visible');
      }
      
      if (elements.connectedButton && !elements.connectedButton.classList.contains('success')) {
        issues.push('connected button styling inconsistent');
      }
      
      if (issues.length === 0) {
        this.logVerification('3.4: ✓ All UI elements update consistently', 'pass');
      } else {
        this.logVerification(`3.4: ✗ UI consistency issues: ${issues.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`3.4: ✗ Error verifying UI consistency: ${error.message}`, 'fail');
    }
  },

  async verifyRequirement3_5() {
    try {
      // Check if wallet state persistence is implemented
      const hasStorageManager = typeof window.StorageManager === 'object';
      const hasLoadWalletState = typeof window.WalletConnectionManager.loadWalletState === 'function';
      const hasSaveWalletState = typeof window.WalletConnectionManager.saveWalletState === 'function';
      
      if (hasStorageManager && hasLoadWalletState && hasSaveWalletState) {
        this.logVerification('3.5: ✓ State persistence mechanisms implemented', 'pass');
      } else {
        const missing = [];
        if (!hasStorageManager) missing.push('StorageManager');
        if (!hasLoadWalletState) missing.push('loadWalletState');
        if (!hasSaveWalletState) missing.push('saveWalletState');
        this.logVerification(`3.5: ✗ Missing persistence components: ${missing.join(', ')}`, 'fail');
      }
    } catch (error) {
      this.logVerification(`3.5: ✗ Error verifying state persistence: ${error.message}`, 'fail');
    }
  },

  generateVerificationReport() {
    const passed = this.verificationResults.filter(r => r.status === 'pass').length;
    const failed = this.verificationResults.filter(r => r.status === 'fail').length;
    const info = this.verificationResults.filter(r => r.status === 'info').length;
    
    console.log('\n🔍 ===== WALLET CONNECTION FLOW VERIFICATION REPORT =====');
    console.log(`📊 Total Tests: ${this.verificationResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`ℹ️  Info: ${info}`);
    
    if (failed === 0) {
      console.log('🎉 All wallet connection flow requirements verified successfully!');
    } else {
      console.log('⚠️  Some requirements need attention. Check the detailed results above.');
    }
    
    console.log('🔍 ========================================================\n');
    
    // Create summary object for external access
    window.WalletFlowVerificationSummary = {
      total: this.verificationResults.length,
      passed,
      failed,
      info,
      success: failed === 0,
      results: this.verificationResults
    };
  },

  logVerification(message, status) {
    const result = { message, status, timestamp: new Date().toLocaleTimeString() };
    this.verificationResults.push(result);
    
    // Log to console with appropriate styling
    const consoleStyle = status === 'pass' ? 'color: #4ade80; font-weight: bold' : 
                        status === 'fail' ? 'color: #f87171; font-weight: bold' : 
                        'color: #60a5fa';
    console.log(`%c${message}`, consoleStyle);
  },

  clearResults() {
    this.verificationResults = [];
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other managers to initialize
  setTimeout(() => {
    WalletFlowVerifier.init();
  }, 4000);
});

// Export for use in other modules
window.WalletFlowVerifier = WalletFlowVerifier;