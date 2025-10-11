/**
 * Error Suppression Test
 * Verifies that extension not found errors are properly suppressed
 */

const ErrorSuppressionTest = {
  init() {
    console.log('🔇 Error Suppression Test initialized');
    
    // Test after a delay to ensure other components are loaded
    setTimeout(() => {
      this.testErrorSuppression();
    }, 3000);
  },

  async testErrorSuppression() {
    console.log('🔇 Testing error message suppression for missing extensions...');
    
    // Store original ToastManager.show to monitor calls
    const originalToastShow = window.ToastManager?.show;
    const toastCalls = [];
    
    if (originalToastShow) {
      window.ToastManager.show = function(message, type, duration) {
        toastCalls.push({ message, type, duration });
        console.log(`🔇 Toast intercepted: ${type} - ${message}`);
        // Don't actually show the toast during testing
      };
    }
    
    try {
      // Test Leather connection when extension is not available
      if (!window.LeatherProvider && !window.btc && !window.StacksProvider) {
        console.log('🔇 Testing Leather connection without extension...');
        try {
          await window.WalletConnectionManager.connectWallet('leather');
        } catch (error) {
          console.log('🔇 Leather connection failed as expected:', error.message);
        }
      }
      
      // Test Xverse connection when extension is not available
      if (!window.XverseProviders?.BitcoinProvider && !window.BitcoinProvider && !window.sats) {
        console.log('🔇 Testing Xverse connection without extension...');
        try {
          await window.WalletConnectionManager.connectWallet('xverse');
        } catch (error) {
          console.log('🔇 Xverse connection failed as expected:', error.message);
        }
      }
      
      // Wait a moment for any async operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if any error toasts were shown
      const errorToasts = toastCalls.filter(call => call.type === 'error');
      
      if (errorToasts.length === 0) {
        console.log('✅ Error suppression test PASSED: No error toasts shown for missing extensions');
      } else {
        console.log('❌ Error suppression test FAILED: Error toasts were shown:');
        errorToasts.forEach(toast => {
          console.log(`   - ${toast.message}`);
        });
      }
      
    } finally {
      // Restore original ToastManager.show
      if (originalToastShow) {
        window.ToastManager.show = originalToastShow;
      }
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ErrorSuppressionTest.init();
});

// Export for use in other modules
window.ErrorSuppressionTest = ErrorSuppressionTest;