/**
 * Workflow Validator for SatsPay Application
 * Validates complete user workflows and component integration
 */

class WorkflowValidator {
  constructor() {
    this.validationResults = [];
    this.currentWorkflow = null;
  }

  /**
   * Validate all critical workflows
   */
  async validateAllWorkflows() {
    console.log('🔍 Starting Workflow Validation...');
    
    try {
      // Workflow 1: Complete User Journey (Direct access to Payment)
      await this.validateCompleteUserJourney();
      
      // Workflow 2: Wallet Connection Persistence
      await this.validateWalletConnectionPersistence();
      
      // Workflow 3: Data Persistence Across Refreshes
      await this.validateDataPersistenceAcrossRefreshes();
      
      // Workflow 4: Error Recovery Workflows
      await this.validateErrorRecoveryWorkflows();
      
      // Workflow 5: State Synchronization
      await this.validateStateSynchronization();
      
      // Generate validation report
      this.generateValidationReport();
      
    } catch (error) {
      console.error('❌ Workflow validation failed:', error);
      this.logValidationResult('Workflow Validation Suite', false, error.message);
    }
  }

  /**
   * Validate complete user journey with direct access to payment
   */
  async validateCompleteUserJourney() {
    this.currentWorkflow = 'Complete User Journey';
    console.log('👤 Validating Complete User Journey...');
    
    try {
      // Step 1: Initial state validation (no authentication)
      await this.validateInitialState();
      
      // Step 2: Default user profile display
      await this.validateDefaultProfileDisplay();
      
      // Step 3: Wallet connection
      await this.validateWalletConnectionProcess();
      
      // Step 4: Faucet usage
      await this.validateFaucetUsage();
      
      // Step 5: Payment process
      await this.validatePaymentProcess();
      
      // Step 6: Transaction history
      await this.validateTransactionHistoryDisplay();
      
      // Step 7: Autopay setup
      await this.validateAutopaySetup();
      
      this.logValidationResult('Complete User Journey', true);
      
    } catch (error) {
      this.logValidationResult('Complete User Journey', false, error.message);
      throw error;
    }
  }

  /**
   * Validate initial application state (no authentication required)
   */
  async validateInitialState() {
    // Check if auth section is hidden
    const authSection = document.getElementById('auth-section');
    if (authSection && !authSection.classList.contains('hidden')) {
      throw new Error('Auth section should be hidden in no-authentication mode');
    }

    // Check if navigation is visible
    const header = document.querySelector('.header');
    if (!header || header.style.display === 'none') {
      throw new Error('Navigation should be visible in no-authentication mode');
    }

    // Check if home section is visible
    const homeSection = document.getElementById('home-section');
    if (!homeSection || homeSection.classList.contains('hidden')) {
      throw new Error('Home section should be visible on initial load');
    }

    // Validate initial state manager state
    if (window.stateManager) {
      const isAuthenticated = window.stateManager.getState('isAuthenticated');
      if (!isAuthenticated) {
        throw new Error('User should be authenticated by default in no-authentication mode');
      }

      const currentSection = window.stateManager.getState('currentSection');
      if (currentSection !== 'home') {
        throw new Error('Application should start at home section');
      }
    }

    console.log('✅ Initial state validation passed');
  }

  /**
   * Validate default profile display
   */
  async validateDefaultProfileDisplay() {
    // Check if default user data is displayed
    const currentUser = window.stateManager?.getState('currentUser');
    if (!currentUser || !currentUser.id) {
      throw new Error('Default user not set in state');
    }

    // Check if user name is displayed
    const userNameElement = document.getElementById('user-name');
    if (!userNameElement || !userNameElement.textContent.includes(currentUser.name)) {
      throw new Error('Default user name not displayed correctly');
    }

    // Check if user email is displayed
    const userEmailElement = document.getElementById('user-email');
    if (!userEmailElement || !userEmailElement.textContent.includes(currentUser.email)) {
      throw new Error('Default user email not displayed correctly');
    }

    console.log('✅ Default profile display validation passed');
  }

  /**
   * Validate wallet connection process
   */
  async validateWalletConnectionProcess() {
    // Find wallet connect button
    const walletConnectBtn = document.querySelector('[data-wallet="blue"] .wallet-connect-btn');
    if (!walletConnectBtn) {
      throw new Error('Wallet connect button not found');
    }

    // Click connect button
    walletConnectBtn.click();
    await this.delay(500);

    // Validate wallet connection state
    if (window.stateManager) {
      const walletConnected = window.stateManager.getState('walletConnected');
      if (!walletConnected) {
        throw new Error('Wallet connection state not updated');
      }
    }

    // Check if wallet status is updated
    const statusText = document.getElementById('status-text');
    if (!statusText || !statusText.textContent.includes('Connected')) {
      throw new Error('Wallet status not updated in UI');
    }

    console.log('✅ Wallet connection process validation passed');
  }

  /**
   * Validate faucet usage
   */
  async validateFaucetUsage() {
    // Get initial balance
    const initialBalance = window.stateManager?.getState('balance') || { btc: 0, usd: 0 };

    // Find and click faucet button
    const faucetBtn = document.getElementById('faucet-btn');
    if (!faucetBtn) {
      throw new Error('Faucet button not found');
    }

    faucetBtn.click();
    await this.delay(1000);

    // Validate balance increase
    const newBalance = window.stateManager?.getState('balance');
    if (!newBalance || newBalance.btc <= initialBalance.btc) {
      throw new Error('Balance not increased after faucet usage');
    }

    // Check if balance is displayed correctly
    const btcBalanceElement = document.getElementById('btc-balance');
    if (!btcBalanceElement || !btcBalanceElement.textContent.includes(newBalance.btc.toFixed(8))) {
      throw new Error('BTC balance not displayed correctly');
    }

    console.log('✅ Faucet usage validation passed');
  }

  /**
   * Validate payment process
   */
  async validatePaymentProcess() {
    // Navigate to pay section
    const payNavLink = document.querySelector('[data-section="pay"]');
    if (payNavLink) {
      payNavLink.click();
      await this.delay(300);
    }

    // Check if payment interface is visible
    const paymentInterface = document.getElementById('payment-interface');
    if (!paymentInterface || paymentInterface.classList.contains('hidden')) {
      throw new Error('Payment interface not visible');
    }

    // Get initial balance
    const initialBalance = window.stateManager?.getState('balance');
    if (!initialBalance || initialBalance.btc <= 0) {
      throw new Error('Insufficient balance for payment test');
    }

    // Fill payment form
    const recipientField = document.getElementById('payment-recipient');
    const amountField = document.getElementById('payment-amount');
    const sendBtn = document.getElementById('send-payment-btn');

    if (!recipientField || !amountField || !sendBtn) {
      throw new Error('Payment form elements not found');
    }

    recipientField.value = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    amountField.value = '0.001';

    // Submit payment
    sendBtn.click();
    await this.delay(1000);

    // Validate balance decrease
    const newBalance = window.stateManager?.getState('balance');
    if (!newBalance || newBalance.btc >= initialBalance.btc) {
      throw new Error('Balance not decreased after payment');
    }

    console.log('✅ Payment process validation passed');
  }

  /**
   * Validate transaction history display
   */
  async validateTransactionHistoryDisplay() {
    // Navigate to transactions section
    const transactionsNavLink = document.querySelector('[data-section="transactions"]');
    if (transactionsNavLink) {
      transactionsNavLink.click();
      await this.delay(300);
    }

    // Check if transactions section is visible
    const transactionsSection = document.getElementById('transactions-section');
    if (!transactionsSection || transactionsSection.classList.contains('hidden')) {
      throw new Error('Transactions section not visible');
    }

    // Validate transaction list
    const transactions = window.stateManager?.getState('transactions') || [];
    if (transactions.length === 0) {
      throw new Error('No transactions found in history');
    }

    // Check if transactions are displayed
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) {
      throw new Error('Transaction list element not found');
    }

    const transactionItems = transactionList.querySelectorAll('.transaction-item');
    if (transactionItems.length === 0) {
      throw new Error('No transaction items displayed');
    }

    console.log('✅ Transaction history display validation passed');
  }

  /**
   * Validate autopay setup
   */
  async validateAutopaySetup() {
    // Navigate to autopay section
    const autopayNavLink = document.querySelector('[data-section="autopay"]');
    if (autopayNavLink) {
      autopayNavLink.click();
      await this.delay(300);
    }

    // Check if autopay section is visible
    const autopaySection = document.getElementById('autopay-section');
    if (!autopaySection || autopaySection.classList.contains('hidden')) {
      throw new Error('Autopay section not visible');
    }

    // Check if autopay interface is available
    const autopayInterface = document.getElementById('autopay-interface');
    if (!autopayInterface || autopayInterface.classList.contains('hidden')) {
      throw new Error('Autopay interface not visible');
    }

    console.log('✅ Autopay setup validation passed');
  }

  /**
   * Validate wallet connection persistence across refreshes
   */
  async validateWalletConnectionPersistence() {
    this.currentWorkflow = 'Wallet Connection Persistence';
    console.log('🔄 Validating Wallet Connection Persistence...');
    
    try {
      // Ensure wallet is connected
      if (window.stateManager) {
        const walletConnected = window.stateManager.getState('walletConnected');
        if (!walletConnected) {
          // Connect wallet first
          const walletConnectBtn = document.querySelector('[data-wallet="blue"] .wallet-connect-btn');
          if (walletConnectBtn) {
            walletConnectBtn.click();
            await this.delay(500);
          }
        }
      }

      // Simulate page refresh by reloading state
      if (window.stateManager) {
        await window.stateManager.loadPersistedState();
        
        const walletConnected = window.stateManager.getState('walletConnected');
        if (!walletConnected) {
          throw new Error('Wallet connection not persisted across refresh');
        }
      }

      this.logValidationResult('Wallet Connection Persistence', true);
      
    } catch (error) {
      this.logValidationResult('Wallet Connection Persistence', false, error.message);
      throw error;
    }
  }

  /**
   * Validate data persistence across refreshes
   */
  async validateDataPersistenceAcrossRefreshes() {
    this.currentWorkflow = 'Data Persistence Across Refreshes';
    console.log('💾 Validating Data Persistence Across Refreshes...');
    
    try {
      // Test user data persistence
      if (window.stateManager) {
        const currentUser = window.stateManager.getState('currentUser');
        if (!currentUser) {
          throw new Error('User data not persisted');
        }

        // Test balance persistence
        const balance = window.stateManager.getState('balance');
        if (!balance || balance.btc < 0) {
          throw new Error('Balance data not persisted correctly');
        }

        // Test transaction persistence
        const transactions = window.stateManager.getState('transactions');
        if (!Array.isArray(transactions)) {
          throw new Error('Transaction data not persisted correctly');
        }
      }

      // Test localStorage operations
      if (window.enhancedStorageManager) {
        const testData = { test: 'persistence', value: Math.random() };
        await window.enhancedStorageManager.save('persistence_test', testData);
        
        const loadedData = await window.enhancedStorageManager.load('persistence_test');
        if (!loadedData || loadedData.value !== testData.value) {
          throw new Error('localStorage persistence not working correctly');
        }

        // Clean up
        await window.enhancedStorageManager.remove('persistence_test');
      }

      this.logValidationResult('Data Persistence Across Refreshes', true);
      
    } catch (error) {
      this.logValidationResult('Data Persistence Across Refreshes', false, error.message);
      throw error;
    }
  }

  /**
   * Validate error recovery workflows
   */
  async validateErrorRecoveryWorkflows() {
    this.currentWorkflow = 'Error Recovery Workflows';
    console.log('⚠️ Validating Error Recovery Workflows...');
    
    try {
      // Test invalid payment recovery
      if (typeof PaymentManager !== 'undefined') {
        const initialBalance = window.stateManager?.getState('balance');
        
        try {
          await PaymentManager.sendPayment({
            recipient: 'invalid_address',
            amount: -1
          });
          throw new Error('Invalid payment should have been rejected');
        } catch (error) {
          // This is expected - verify balance unchanged
          const currentBalance = window.stateManager?.getState('balance');
          if (currentBalance.btc !== initialBalance.btc) {
            throw new Error('Balance changed after failed payment');
          }
        }
      }

      // Test storage error recovery
      if (window.enhancedStorageManager) {
        // Try to save invalid data
        try {
          await window.enhancedStorageManager.save('', undefined);
          throw new Error('Invalid save should have failed');
        } catch (error) {
          // This is expected
        }
      }

      this.logValidationResult('Error Recovery Workflows', true);
      
    } catch (error) {
      this.logValidationResult('Error Recovery Workflows', false, error.message);
      throw error;
    }
  }

  /**
   * Validate state synchronization
   */
  async validateStateSynchronization() {
    this.currentWorkflow = 'State Synchronization';
    console.log('🔄 Validating State Synchronization...');
    
    try {
      if (!window.stateManager) {
        throw new Error('State manager not available');
      }

      // Test state update synchronization
      let syncCallbackCalled = false;
      const unsubscribe = window.stateManager.subscribe('syncTest', (value) => {
        syncCallbackCalled = true;
      });

      await window.stateManager.setState({ syncTest: 'synchronized' });
      
      if (!syncCallbackCalled) {
        throw new Error('State synchronization callback not called');
      }

      // Test cross-component synchronization
      const testValue = window.stateManager.getState('syncTest');
      if (testValue !== 'synchronized') {
        throw new Error('State not synchronized across components');
      }

      // Clean up
      unsubscribe();
      await window.stateManager.setState({ syncTest: undefined });

      this.logValidationResult('State Synchronization', true);
      
    } catch (error) {
      this.logValidationResult('State Synchronization', false, error.message);
      throw error;
    }
  }

  /**
   * Log validation result
   */
  logValidationResult(workflowName, passed, error = null) {
    const result = {
      workflow: workflowName,
      passed,
      error,
      timestamp: Date.now()
    };
    
    this.validationResults.push(result);
    
    if (passed) {
      console.log(`✅ ${workflowName} - VALIDATED`);
    } else {
      console.error(`❌ ${workflowName} - FAILED: ${error}`);
    }
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const totalWorkflows = this.validationResults.length;
    const passedWorkflows = this.validationResults.filter(r => r.passed).length;
    const failedWorkflows = totalWorkflows - passedWorkflows;
    const successRate = totalWorkflows > 0 ? (passedWorkflows / totalWorkflows * 100).toFixed(1) : 0;

    console.log('\n📊 WORKFLOW VALIDATION REPORT');
    console.log('='.repeat(50));
    console.log(`Total Workflows: ${totalWorkflows}`);
    console.log(`Validated: ${passedWorkflows}`);
    console.log(`Failed: ${failedWorkflows}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(50));

    if (failedWorkflows > 0) {
      console.log('\n❌ FAILED WORKFLOWS:');
      this.validationResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`- ${r.workflow}: ${r.error}`);
        });
    }

    // Store results
    if (window.enhancedStorageManager) {
      window.enhancedStorageManager.save('workflow_validation_results', {
        results: this.validationResults,
        summary: {
          totalWorkflows,
          passedWorkflows,
          failedWorkflows,
          successRate
        },
        timestamp: Date.now()
      });
    }

    return {
      totalWorkflows,
      passedWorkflows,
      failedWorkflows,
      successRate,
      results: this.validationResults
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
  window.WorkflowValidator = WorkflowValidator;
}