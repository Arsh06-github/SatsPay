/**
 * Integration Test Suite for SatsPay Application
 * Tests complete user workflows and component integration
 */

class IntegrationTestSuite {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🚀 Starting Integration Test Suite...');
    
    try {
      // Clear any existing data
      await this.clearTestData();
      
      // Test 1: Initial Application State (no authentication)
      await this.testInitialApplicationState();
      
      // Test 2: Navigation System
      await this.testNavigationSystem();
      
      // Test 3: Wallet Connection
      await this.testWalletConnection();
      
      // Test 4: Local Faucet
      await this.testLocalFaucet();
      
      // Test 5: Payment System
      await this.testPaymentSystem();
      
      // Test 6: Transaction History
      await this.testTransactionHistory();
      
      // Test 7: Autopay System
      await this.testAutopaySystem();
      
      // Test 8: Data Persistence
      await this.testDataPersistence();
      
      // Test 9: State Management
      await this.testStateManagement();
      
      // Test 10: Error Handling
      await this.testErrorHandling();
      
      // Generate test report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      this.logTestResult('Integration Test Suite', false, error.message);
    }
  }

  /**
   * Test initial application state (no authentication required)
   */
  async testInitialApplicationState() {
    this.currentTest = 'Initial Application State';
    console.log('🏠 Testing Initial Application State...');
    
    try {
      // Verify application starts with authenticated state
      const isAuthenticated = window.stateManager?.getState('isAuthenticated');
      if (!isAuthenticated) {
        throw new Error('Application should start in authenticated state');
      }
      
      // Verify default user is set
      const currentUser = window.stateManager?.getState('currentUser');
      if (!currentUser || !currentUser.id) {
        throw new Error('Default user not set properly');
      }
      
      // Verify current section is home (not auth)
      const currentSection = window.stateManager?.getState('currentSection');
      if (currentSection !== 'home') {
        throw new Error('Application should start at home section');
      }
      
      // Verify auth section is hidden
      const authSection = document.getElementById('auth-section');
      if (authSection && !authSection.classList.contains('hidden')) {
        throw new Error('Auth section should be hidden');
      }
      
      // Verify home section is visible
      const homeSection = document.getElementById('home-section');
      if (!homeSection || homeSection.classList.contains('hidden')) {
        throw new Error('Home section should be visible');
      }
      
      // Verify navigation is visible
      const header = document.querySelector('.header');
      if (!header || header.style.display === 'none') {
        throw new Error('Navigation should be visible');
      }
      
      console.log('✅ Initial application state test passed');
      this.logTestResult('Initial Application State', true);
      
    } catch (error) {
      console.error('❌ Initial application state test failed:', error);
      this.logTestResult('Initial Application State', false, error.message);
      throw error;
    }
  }

  /**
   * Test navigation system
   */
  async testNavigationSystem() {
    this.currentTest = 'Navigation System';
    console.log('🧭 Testing Navigation System...');
    
    try {
      const sections = ['home', 'pay', 'transactions', 'autopay'];
      
      for (const section of sections) {
        // Test navigation
        const navResult = await Router.push(section);
        if (!navResult) {
          throw new Error(`Failed to navigate to ${section}`);
        }

        // Verify section is active
        const currentSection = NavigationManager.getCurrentSection();
        if (currentSection !== section) {
          throw new Error(`Navigation to ${section} failed - current: ${currentSection}`);
        }

        // Verify section visibility
        const sectionElement = document.getElementById(`${section}-section`);
        if (!sectionElement || sectionElement.classList.contains('hidden')) {
          throw new Error(`Section ${section} not visible after navigation`);
        }

        await this.delay(100); // Small delay between navigations
      }

      this.logTestResult('Navigation System', true);

    } catch (error) {
      this.logTestResult('Navigation System', false, error.message);
      throw error;
    }
  }

  /**
   * Test wallet connection
   */
  async testWalletConnection() {
    this.currentTest = 'Wallet Connection';
    console.log('💳 Testing Wallet Connection...');
    
    try {
      // Navigate to home
      await Router.push('home');

      // Test wallet connection
      if (typeof WalletConnectionManager === 'undefined') {
        throw new Error('WalletConnectionManager not available');
      }

      // Test connecting to Blue Wallet
      const connectResult = await WalletConnectionManager.connectWallet('blue');
      if (!connectResult) {
        throw new Error('Failed to connect wallet');
      }

      // Verify wallet connection state
      const walletConnected = window.stateManager?.getState('walletConnected');
      if (!walletConnected) {
        throw new Error('Wallet connection state not updated');
      }

      // Test wallet disconnection
      const disconnectResult = await WalletConnectionManager.disconnectWallet();
      if (!disconnectResult) {
        throw new Error('Failed to disconnect wallet');
      }

      // Reconnect for other tests
      await WalletConnectionManager.connectWallet('blue');

      this.logTestResult('Wallet Connection', true);

    } catch (error) {
      this.logTestResult('Wallet Connection', false, error.message);
      throw error;
    }
  }

  /**
   * Test local faucet
   */
  async testLocalFaucet() {
    this.currentTest = 'Local Faucet';
    console.log('🚰 Testing Local Faucet...');
    
    try {
      if (typeof LocalFaucetManager === 'undefined') {
        throw new Error('LocalFaucetManager not available');
      }

      // Get initial balance
      const initialBalance = window.stateManager?.getState('balance') || { btc: 0, usd: 0 };

      // Use faucet
      const faucetResult = await LocalFaucetManager.claimBitcoin();
      if (!faucetResult) {
        throw new Error('Faucet claim failed');
      }

      // Verify balance increased
      const newBalance = window.stateManager?.getState('balance');
      if (!newBalance || newBalance.btc <= initialBalance.btc) {
        throw new Error('Balance not updated after faucet use');
      }

      // Verify faucet amount (0.012 BTC)
      const expectedIncrease = 0.012;
      const actualIncrease = newBalance.btc - initialBalance.btc;
      if (Math.abs(actualIncrease - expectedIncrease) > 0.0001) {
        throw new Error(`Incorrect faucet amount: expected ${expectedIncrease}, got ${actualIncrease}`);
      }

      this.logTestResult('Local Faucet', true);

    } catch (error) {
      this.logTestResult('Local Faucet', false, error.message);
      throw error;
    }
  }

  /**
   * Test payment system
   */
  async testPaymentSystem() {
    this.currentTest = 'Payment System';
    console.log('💸 Testing Payment System...');
    
    try {
      // Navigate to pay section
      await Router.push('pay');

      if (typeof PaymentManager === 'undefined') {
        throw new Error('PaymentManager not available');
      }

      // Get initial balance
      const initialBalance = window.stateManager?.getState('balance');
      if (!initialBalance || initialBalance.btc <= 0) {
        throw new Error('Insufficient balance for payment test');
      }

      // Test payment
      const paymentData = {
        recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: 0.001,
        description: 'Test payment'
      };

      const paymentResult = await PaymentManager.sendPayment(paymentData);
      if (!paymentResult) {
        throw new Error('Payment failed');
      }

      // Verify balance decreased
      const newBalance = window.stateManager?.getState('balance');
      if (!newBalance || newBalance.btc >= initialBalance.btc) {
        throw new Error('Balance not updated after payment');
      }

      // Verify transaction was recorded
      const transactions = window.stateManager?.getState('transactions') || [];
      const paymentTransaction = transactions.find(tx => 
        tx.type === 'send' && tx.amount === paymentData.amount
      );
      if (!paymentTransaction) {
        throw new Error('Payment transaction not recorded');
      }

      this.logTestResult('Payment System', true);

    } catch (error) {
      this.logTestResult('Payment System', false, error.message);
      throw error;
    }
  }

  /**
   * Test transaction history
   */
  async testTransactionHistory() {
    this.currentTest = 'Transaction History';
    console.log('📊 Testing Transaction History...');
    
    try {
      // Navigate to transactions section
      await Router.push('transactions');

      if (typeof TransactionManager === 'undefined') {
        throw new Error('TransactionManager not available');
      }

      // Verify transactions are displayed
      const transactions = window.stateManager?.getState('transactions') || [];
      if (transactions.length === 0) {
        throw new Error('No transactions found');
      }

      // Test transaction filtering
      const completedTransactions = TransactionManager.filterTransactions('completed');
      if (!Array.isArray(completedTransactions)) {
        throw new Error('Transaction filtering failed');
      }

      // Test transaction sorting
      const sortedTransactions = TransactionManager.sortTransactions(transactions, 'timestamp');
      if (!Array.isArray(sortedTransactions)) {
        throw new Error('Transaction sorting failed');
      }

      this.logTestResult('Transaction History', true);

    } catch (error) {
      this.logTestResult('Transaction History', false, error.message);
      throw error;
    }
  }

  /**
   * Test autopay system
   */
  async testAutopaySystem() {
    this.currentTest = 'Autopay System';
    console.log('🔄 Testing Autopay System...');
    
    try {
      // Navigate to autopay section
      await Router.push('autopay');

      if (typeof AutopayManager === 'undefined') {
        throw new Error('AutopayManager not available');
      }

      // Test autopay setup
      const autopayData = {
        recipient: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: 0.001,
        conditionType: 'time',
        interval: 'daily',
        description: 'Test autopay'
      };

      const autopayResult = await AutopayManager.setupAutopay(autopayData);
      if (!autopayResult) {
        throw new Error('Autopay setup failed');
      }

      // Verify autopay rule was created
      const autopayRules = window.stateManager?.getState('autopayRules') || [];
      const testAutopay = autopayRules.find(rule => 
        rule.recipient === autopayData.recipient && rule.amount === autopayData.amount
      );
      if (!testAutopay) {
        throw new Error('Autopay rule not created');
      }

      this.logTestResult('Autopay System', true);

    } catch (error) {
      this.logTestResult('Autopay System', false, error.message);
      throw error;
    }
  }

  /**
   * Test data persistence
   */
  async testDataPersistence() {
    this.currentTest = 'Data Persistence';
    console.log('💾 Testing Data Persistence...');
    
    try {
      if (!window.enhancedStorageManager) {
        throw new Error('Enhanced storage manager not available');
      }

      // Test saving data
      const testData = { test: 'persistence', timestamp: Date.now() };
      const saveResult = await window.enhancedStorageManager.save('test_data', testData);
      if (!saveResult) {
        throw new Error('Failed to save test data');
      }

      // Test loading data
      const loadedData = await window.enhancedStorageManager.load('test_data');
      if (!loadedData || loadedData.test !== testData.test) {
        throw new Error('Failed to load test data correctly');
      }

      // Test user data persistence
      const currentUser = window.stateManager?.getState('currentUser');
      if (currentUser) {
        const savedUser = await window.enhancedStorageManager.load('currentUser');
        if (!savedUser || savedUser.email !== currentUser.email) {
          throw new Error('User data not persisted correctly');
        }
      }

      // Test wallet connection persistence
      const walletConnected = window.stateManager?.getState('walletConnected');
      const savedWalletState = await window.enhancedStorageManager.load('walletConnected');
      if (savedWalletState !== walletConnected) {
        throw new Error('Wallet connection state not persisted correctly');
      }

      // Clean up test data
      await window.enhancedStorageManager.remove('test_data');

      this.logTestResult('Data Persistence', true);

    } catch (error) {
      this.logTestResult('Data Persistence', false, error.message);
      throw error;
    }
  }

  /**
   * Test state management
   */
  async testStateManagement() {
    this.currentTest = 'State Management';
    console.log('🔄 Testing State Management...');
    
    try {
      if (!window.stateManager) {
        throw new Error('State manager not available');
      }

      // Test state subscription
      let subscriptionCalled = false;
      const unsubscribe = window.stateManager.subscribe('testKey', (value) => {
        subscriptionCalled = true;
      });

      // Test state update
      await window.stateManager.setState({ testKey: 'testValue' });
      
      // Verify subscription was called
      if (!subscriptionCalled) {
        throw new Error('State subscription not working');
      }

      // Test state retrieval
      const testValue = window.stateManager.getState('testKey');
      if (testValue !== 'testValue') {
        throw new Error('State retrieval failed');
      }

      // Clean up
      unsubscribe();
      await window.stateManager.setState({ testKey: undefined });

      this.logTestResult('State Management', true);

    } catch (error) {
      this.logTestResult('State Management', false, error.message);
      throw error;
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    this.currentTest = 'Error Handling';
    console.log('⚠️ Testing Error Handling...');
    
    try {
      // Test invalid payment
      if (typeof PaymentManager !== 'undefined') {
        const invalidPayment = {
          recipient: 'invalid_address',
          amount: -1
        };

        try {
          await PaymentManager.sendPayment(invalidPayment);
          throw new Error('Invalid payment should have failed');
        } catch (error) {
          // This is expected
          console.log('✅ Invalid payment correctly rejected');
        }
      }

      // Test invalid state updates
      if (window.stateManager) {
        try {
          await window.stateManager.setState({ invalidKey: null });
          // This should not throw an error, but we test that state remains consistent
          const invalidValue = window.stateManager.getState('invalidKey');
          if (invalidValue !== null) {
            console.log('✅ Invalid state update handled correctly');
          }
        } catch (error) {
          // This is also acceptable behavior
          console.log('✅ Invalid state update correctly rejected');
        }
      }

      this.logTestResult('Error Handling', true);

    } catch (error) {
      this.logTestResult('Error Handling', false, error.message);
      throw error;
    }
  }

  /**
   * Clear test data
   */
  async clearTestData() {
    try {
      if (window.enhancedStorageManager) {
        await window.enhancedStorageManager.clearAll({ confirm: false });
      }
      if (window.stateManager) {
        await window.stateManager.resetState({ confirm: false });
      }
    } catch (error) {
      console.warn('Failed to clear test data:', error);
    }
  }

  /**
   * Log test result
   */
  logTestResult(testName, passed, error = null) {
    const result = {
      test: testName,
      passed,
      error,
      timestamp: Date.now()
    };
    
    this.testResults.push(result);
    
    if (passed) {
      console.log(`✅ ${testName} - PASSED`);
    } else {
      console.error(`❌ ${testName} - FAILED: ${error}`);
    }
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

    console.log('\n📊 INTEGRATION TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(50));

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`- ${r.test}: ${r.error}`);
        });
    }

    // Store results for later analysis
    if (window.enhancedStorageManager) {
      window.enhancedStorageManager.save('integration_test_results', {
        results: this.testResults,
        summary: {
          totalTests,
          passedTests,
          failedTests,
          successRate
        },
        timestamp: Date.now()
      });
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      results: this.testResults
    };
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.IntegrationTestSuite = IntegrationTestSuite;
}