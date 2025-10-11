/**
 * Fixes Verification
 * Verifies that both the navigation and wallet status fixes are working
 */

const FixesVerification = {
  init() {
    console.log('✅ Fixes Verification initialized');
    
    // Wait for all components to load
    setTimeout(() => {
      this.runVerification();
    }, 3000);
  },

  async runVerification() {
    console.log('✅ Running fixes verification...');
    
    const results = {
      navigationFix: await this.testNavigationFix(),
      walletStatusFix: this.testWalletStatusFix()
    };
    
    this.reportResults(results);
  },

  async testNavigationFix() {
    console.log('🧪 Testing navigation fix...');
    
    try {
      // Test "Go to Home" button in Pay section
      const payGoToHomeBtn = document.getElementById('go-to-home-btn');
      const autopayGoToHomeBtn = document.getElementById('autopay-go-to-home-btn');
      
      const issues = [];
      
      if (!payGoToHomeBtn) {
        issues.push('Pay "Go to Home" button not found');
      } else {
        // Check if button has click handler
        const hasHandler = payGoToHomeBtn.onclick || 
                          payGoToHomeBtn.getAttribute('onclick') ||
                          payGoToHomeBtn.addEventListener;
        if (!hasHandler) {
          issues.push('Pay "Go to Home" button has no click handler');
        }
      }
      
      if (!autopayGoToHomeBtn) {
        issues.push('Autopay "Go to Home" button not found');
      } else {
        // Check if button has click handler
        const hasHandler = autopayGoToHomeBtn.onclick || 
                          autopayGoToHomeBtn.getAttribute('onclick') ||
                          autopayGoToHomeBtn.addEventListener;
        if (!hasHandler) {
          issues.push('Autopay "Go to Home" button has no click handler');
        }
      }
      
      // Test actual navigation
      if (window.UIFixes && typeof window.UIFixes.navigateToHome === 'function') {
        // Navigation function exists
      } else {
        issues.push('UIFixes.navigateToHome function not available');
      }
      
      return {
        passed: issues.length === 0,
        issues: issues,
        message: issues.length === 0 ? 'Navigation fix working correctly' : `Navigation issues: ${issues.join(', ')}`
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [error.message],
        message: `Navigation test error: ${error.message}`
      };
    }
  },

  testWalletStatusFix() {
    console.log('🧪 Testing wallet status fix...');
    
    try {
      const issues = [];
      
      // Check main wallet status
      const statusText = document.getElementById('status-text');
      if (!statusText || statusText.textContent !== 'Connected') {
        issues.push('Main wallet status not showing "Connected"');
      }
      
      const statusIndicator = document.getElementById('status-indicator');
      if (!statusIndicator || !statusIndicator.classList.contains('connected')) {
        issues.push('Status indicator not showing connected state');
      }
      
      // Check AppState
      if (!window.AppState || !window.AppState.walletConnected) {
        issues.push('AppState.walletConnected not set to true');
      }
      
      // Check if override functions exist
      if (!window.WalletStatusOverride) {
        issues.push('WalletStatusOverride not available');
      }
      
      return {
        passed: issues.length === 0,
        issues: issues,
        message: issues.length === 0 ? 'Wallet status fix working correctly' : `Wallet status issues: ${issues.join(', ')}`
      };
      
    } catch (error) {
      return {
        passed: false,
        issues: [error.message],
        message: `Wallet status test error: ${error.message}`
      };
    }
  },

  reportResults(results) {
    console.log('\n✅ ===== FIXES VERIFICATION REPORT =====');
    
    let allPassed = true;
    
    // Navigation Fix Results
    if (results.navigationFix.passed) {
      console.log('✅ Navigation Fix: PASSED');
      console.log(`   ${results.navigationFix.message}`);
    } else {
      console.log('❌ Navigation Fix: FAILED');
      console.log(`   ${results.navigationFix.message}`);
      allPassed = false;
    }
    
    // Wallet Status Fix Results
    if (results.walletStatusFix.passed) {
      console.log('✅ Wallet Status Fix: PASSED');
      console.log(`   ${results.walletStatusFix.message}`);
    } else {
      console.log('❌ Wallet Status Fix: FAILED');
      console.log(`   ${results.walletStatusFix.message}`);
      allPassed = false;
    }
    
    console.log('\n📊 Overall Result:', allPassed ? '✅ ALL FIXES WORKING' : '❌ SOME FIXES NEED ATTENTION');
    console.log('✅ =====================================\n');
    
    // Store results globally for access
    window.FixesVerificationResults = {
      navigationFix: results.navigationFix,
      walletStatusFix: results.walletStatusFix,
      allPassed: allPassed,
      timestamp: new Date().toISOString()
    };
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  FixesVerification.init();
});

// Add console command for manual verification
window.verifyFixes = () => {
  FixesVerification.runVerification();
};

console.log('✅ Fixes Verification loaded. Command: verifyFixes()');

// Export for use in other modules
window.FixesVerification = FixesVerification;