/**
 * Final Integration Check for SatsPay Application
 * Runs comprehensive validation after application initialization
 */

class FinalIntegrationCheck {
  constructor() {
    this.checkResults = [];
    this.startTime = Date.now();
  }

  /**
   * Run final integration check
   */
  async runFinalCheck() {
    console.log('🔍 Running Final Integration Check...');
    console.log('='.repeat(50));
    
    try {
      // Wait for application to fully initialize
      await this.waitForInitialization();
      
      // Check 1: Core Components
      await this.checkCoreComponents();
      
      // Check 2: State Management
      await this.checkStateManagement();
      
      // Check 3: Data Persistence
      await this.checkDataPersistence();
      
      // Check 4: UI Components
      await this.checkUIComponents();
      
      // Check 5: Navigation System
      await this.checkNavigationSystem();
      
      // Check 6: Authentication Flow
      await this.checkAuthenticationFlow();
      
      // Check 7: Wallet Integration
      await this.checkWalletIntegration();
      
      // Check 8: Payment System
      await this.checkPaymentSystem();
      
      // Check 9: Transaction Management
      await this.checkTransactionManagement();
      
      // Check 10: Autopay System
      await this.checkAutopaySystem();
      
      // Generate final report
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Final integration check failed:', error);
      this.logCheckResult('Final Integration Check', false, error.message);
    }
  }

  /**
   * Wait for application initialization
   */
  async waitForInitialization() {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (window.stateManager && 
          window.enhancedStorageManager && 
          window.NavigationManager && 
          window.Router) {
        console.log('✅ Application initialization detected');
        await this.delay(1000); // Give extra time for full initialization
        return;
      }
      await this.delay(100);
    }
    
    throw new Error('Application failed to initialize within timeout');
  }

  /**
   * Check core components
   */
  async checkCoreComponents() {
    console.log('🔧 Checking Core Components...');
    
    const components = [
      { name: 'StateManager', check: () => window.stateManager && typeof window.stateManager.getState === 'function' },
      { name: 'EnhancedStorageManager', check: () => window.enhancedStorageManager && typeof window.enhancedStorageManager.save === 'function' },
      { name: 'NavigationManager', check: () => window.NavigationManager && typeof window.NavigationManager.navigateTo === 'function' },
      { name: 'Router', check: () => window.Router && typeof window.Router.push === 'function' },

      { name: 'ToastManager', check: () => window.ToastManager && typeof window.ToastManager.show === 'function' },
      { name: 'LoadingManager', check: () => window.LoadingManager && typeof window.LoadingManager.show === 'function' }
    ];

    let allComponentsWorking = true;
    
    for (const component of components) {
      try {
        if (component.check()) {
          console.log(`✅ ${component.name} - Working`);
        } else {
          console.warn(`⚠️ ${component.name} - Not available or incomplete`);
          allComponentsWorking = false;
        }
      } catch (error) {
        console.error(`❌ ${component.name} - Error: ${error.message}`);
        allComponentsWorking = false;
      }
    }

    this.logCheckResult('Core Components', allComponentsWorking);
  }

  /**
   * Check state management
   */
  async checkStateManagement() {
    console.log('🔄 Checking State Management...');
    
    try {
      if (!window.stateManager) {
        throw new Error('StateManager not available');
      }

      // Test state operations
      const testKey = 'finalCheckTest';
      const testValue = { test: true, timestamp: Date.now() };
      
      await window.stateManager.setState({ [testKey]: testValue });
      const retrievedValue = window.stateManager.getState(testKey);
      
      if (!retrievedValue || retrievedValue.test !== testValue.test) {
        throw new Error('State management not working correctly');
      }

      // Test state subscription
      let subscriptionWorking = false;
      const unsubscribe = window.stateManager.subscribe(testKey, () => {
        subscriptionWorking = true;
      });

      await window.stateManager.setState({ [testKey]: { ...testValue, updated: true } });
      
      if (!subscriptionWorking) {
        throw new Error('State subscription not working');
      }

      unsubscribe();
      await window.stateManager.setState({ [testKey]: undefined });

      console.log('✅ State Management - Working');
      this.logCheckResult('State Management', true);
      
    } catch (error) {
      console.error('❌ State Management - Failed:', error.message);
      this.logCheckResult('State Management', false, error.message);
    }
  }

  /**
   * Check data persistence
   */
  async checkDataPersistence() {
    console.log('💾 Checking Data Persistence...');
    
    try {
      if (!window.enhancedStorageManager) {
        throw new Error('EnhancedStorageManager not available');
      }

      const testKey = 'persistenceTest';
      const testData = { 
        persistence: true, 
        timestamp: Date.now(),
        nested: { value: 'test' }
      };

      // Test save
      const saveResult = await window.enhancedStorageManager.save(testKey, testData);
      if (!saveResult) {
        throw new Error('Failed to save test data');
      }

      // Test load
      const loadedData = await window.enhancedStorageManager.load(testKey);
      if (!loadedData || loadedData.persistence !== testData.persistence) {
        throw new Error('Failed to load test data correctly');
      }

      // Test remove
      const removeResult = await window.enhancedStorageManager.remove(testKey);
      if (!removeResult) {
        throw new Error('Failed to remove test data');
      }

      // Verify removal
      const removedData = await window.enhancedStorageManager.load(testKey);
      if (removedData !== null) {
        throw new Error('Data not properly removed');
      }

      console.log('✅ Data Persistence - Working');
      this.logCheckResult('Data Persistence', true);
      
    } catch (error) {
      console.error('❌ Data Persistence - Failed:', error.message);
      this.logCheckResult('Data Persistence', false, error.message);
    }
  }

  /**
   * Check UI components
   */
  async checkUIComponents() {
    console.log('🎨 Checking UI Components...');
    
    const requiredElements = [
      'auth-section',
      'home-section',
      'pay-section', 
      'transactions-section',
      'autopay-section',
      'nav-menu',
      'toast-container',
      'loading-overlay'
    ];

    let allElementsPresent = true;
    
    for (const elementId of requiredElements) {
      const element = document.getElementById(elementId);
      if (element) {
        console.log(`✅ ${elementId} - Present`);
      } else {
        console.warn(`⚠️ ${elementId} - Missing`);
        allElementsPresent = false;
      }
    }

    // Check if CSS is loaded
    const computedStyle = window.getComputedStyle(document.body);
    const hasCustomStyles = computedStyle.getPropertyValue('--color-primary') !== '';
    
    if (hasCustomStyles) {
      console.log('✅ CSS Styles - Loaded');
    } else {
      console.warn('⚠️ CSS Styles - Not fully loaded');
      allElementsPresent = false;
    }

    this.logCheckResult('UI Components', allElementsPresent);
  }

  /**
   * Check navigation system
   */
  async checkNavigationSystem() {
    console.log('🧭 Checking Navigation System...');
    
    try {
      if (!window.NavigationManager || !window.Router) {
        throw new Error('Navigation components not available');
      }

      // Test navigation to different sections
      const sections = ['home', 'pay', 'transactions', 'autopay'];
      
      for (const section of sections) {
        const navResult = await window.Router.push(section);
        if (!navResult) {
          throw new Error(`Failed to navigate to ${section}`);
        }

        const currentSection = window.NavigationManager.getCurrentSection();
        if (currentSection !== section) {
          throw new Error(`Navigation state mismatch for ${section}`);
        }

        await this.delay(100);
      }

      console.log('✅ Navigation System - Working');
      this.logCheckResult('Navigation System', true);
      
    } catch (error) {
      console.error('❌ Navigation System - Failed:', error.message);
      this.logCheckResult('Navigation System', false, error.message);
    }
  }

  /**
   * Check authentication flow
   */
  async checkAuthenticationFlow() {
    console.log('🔐 Checking Authentication Flow...');
    
    try {
      // AuthManager no longer needed in no-authentication mode

      // Check initial authentication state
      const initialAuth = window.stateManager?.getState('isAuthenticated');
      console.log(`Initial authentication state: ${initialAuth}`);

      // Check if auth forms are present
      const signInForm = document.getElementById('signin-form');
      const signUpForm = document.getElementById('signup-form');
      
      if (!signInForm || !signUpForm) {
        throw new Error('Authentication forms not found');
      }

      console.log('✅ Authentication Flow - Components Available');
      this.logCheckResult('Authentication Flow', true);
      
    } catch (error) {
      console.error('❌ Authentication Flow - Failed:', error.message);
      this.logCheckResult('Authentication Flow', false, error.message);
    }
  }

  /**
   * Check wallet integration
   */
  async checkWalletIntegration() {
    console.log('💳 Checking Wallet Integration...');
    
    try {
      // Check wallet connection interface
      const walletList = document.getElementById('wallet-list');
      if (!walletList) {
        throw new Error('Wallet list not found');
      }

      const walletItems = walletList.querySelectorAll('.wallet-item');
      if (walletItems.length === 0) {
        throw new Error('No wallet items found');
      }

      // Check wallet connect buttons
      const connectButtons = walletList.querySelectorAll('.wallet-connect-btn');
      if (connectButtons.length === 0) {
        throw new Error('No wallet connect buttons found');
      }

      console.log(`✅ Wallet Integration - ${walletItems.length} wallets available`);
      this.logCheckResult('Wallet Integration', true);
      
    } catch (error) {
      console.error('❌ Wallet Integration - Failed:', error.message);
      this.logCheckResult('Wallet Integration', false, error.message);
    }
  }

  /**
   * Check payment system
   */
  async checkPaymentSystem() {
    console.log('💸 Checking Payment System...');
    
    try {
      // Navigate to pay section
      await window.Router.push('pay');
      await this.delay(200);

      // Check payment interface elements
      const paymentInterface = document.getElementById('payment-interface');
      const walletCheck = document.getElementById('wallet-check-section');
      
      if (!paymentInterface && !walletCheck) {
        throw new Error('Payment interface components not found');
      }

      console.log('✅ Payment System - Interface Available');
      this.logCheckResult('Payment System', true);
      
    } catch (error) {
      console.error('❌ Payment System - Failed:', error.message);
      this.logCheckResult('Payment System', false, error.message);
    }
  }

  /**
   * Check transaction management
   */
  async checkTransactionManagement() {
    console.log('📊 Checking Transaction Management...');
    
    try {
      // Navigate to transactions section
      await window.Router.push('transactions');
      await this.delay(200);

      // Check transaction interface
      const transactionsSection = document.getElementById('transactions-section');
      if (!transactionsSection) {
        throw new Error('Transactions section not found');
      }

      // Check if transactions state is initialized
      const transactions = window.stateManager?.getState('transactions');
      if (!Array.isArray(transactions)) {
        throw new Error('Transactions state not properly initialized');
      }

      console.log('✅ Transaction Management - Available');
      this.logCheckResult('Transaction Management', true);
      
    } catch (error) {
      console.error('❌ Transaction Management - Failed:', error.message);
      this.logCheckResult('Transaction Management', false, error.message);
    }
  }

  /**
   * Check autopay system
   */
  async checkAutopaySystem() {
    console.log('🔄 Checking Autopay System...');
    
    try {
      // Navigate to autopay section
      await window.Router.push('autopay');
      await this.delay(200);

      // Check autopay interface
      const autopaySection = document.getElementById('autopay-section');
      if (!autopaySection) {
        throw new Error('Autopay section not found');
      }

      // Check if autopay state is initialized
      const autopayRules = window.stateManager?.getState('autopayRules');
      if (!Array.isArray(autopayRules)) {
        throw new Error('Autopay rules state not properly initialized');
      }

      console.log('✅ Autopay System - Available');
      this.logCheckResult('Autopay System', true);
      
    } catch (error) {
      console.error('❌ Autopay System - Failed:', error.message);
      this.logCheckResult('Autopay System', false, error.message);
    }
  }

  /**
   * Log check result
   */
  logCheckResult(checkName, passed, error = null) {
    const result = {
      check: checkName,
      passed,
      error,
      timestamp: Date.now()
    };
    
    this.checkResults.push(result);
  }

  /**
   * Generate final report
   */
  generateFinalReport() {
    const totalChecks = this.checkResults.length;
    const passedChecks = this.checkResults.filter(r => r.passed).length;
    const failedChecks = totalChecks - passedChecks;
    const successRate = totalChecks > 0 ? (passedChecks / totalChecks * 100).toFixed(1) : 0;
    const totalTime = Date.now() - this.startTime;

    console.log('\n📊 FINAL INTEGRATION CHECK REPORT');
    console.log('='.repeat(50));
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks}`);
    console.log(`Failed: ${failedChecks}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log('='.repeat(50));

    // Show detailed results
    this.checkResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const status = result.passed ? 'PASSED' : 'FAILED';
      const error = result.error ? ` - ${result.error}` : '';
      console.log(`${icon} ${result.check}: ${status}${error}`);
    });

    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (failedChecks === 0) {
      console.log('🎉 EXCELLENT! All integration checks passed.');
      console.log('✅ The application is fully integrated and ready for use.');
    } else if (failedChecks <= 2) {
      console.log('⚠️ GOOD! Most integration checks passed with minor issues.');
      console.log('🔧 Review and fix the failed checks for optimal performance.');
    } else {
      console.log('❌ NEEDS ATTENTION! Multiple integration checks failed.');
      console.log('🚨 Significant issues detected that need immediate attention.');
    }

    // Store results
    if (window.enhancedStorageManager) {
      const reportData = {
        summary: {
          totalChecks,
          passedChecks,
          failedChecks,
          successRate,
          totalTime
        },
        results: this.checkResults,
        timestamp: Date.now(),
        version: '1.0.0'
      };

      window.enhancedStorageManager.save('final_integration_check_report', reportData);
    }

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      successRate,
      totalTime,
      results: this.checkResults
    };
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-run final check after application initialization
if (typeof window !== 'undefined') {
  window.FinalIntegrationCheck = FinalIntegrationCheck;
  
  // Run check after DOM is loaded and app is initialized
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
      try {
        const finalCheck = new FinalIntegrationCheck();
        await finalCheck.runFinalCheck();
      } catch (error) {
        console.error('Final integration check failed to run:', error);
      }
    }, 3000); // Wait 3 seconds for full app initialization
  });
}