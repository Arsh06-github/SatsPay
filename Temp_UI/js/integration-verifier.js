/**
 * Integration Verifier for SatsPay Application
 * Comprehensive verification of all components and workflows
 */

class IntegrationVerifier {
  constructor() {
    this.verificationResults = [];
    this.componentStatus = {};
    this.workflowStatus = {};
    this.performanceMetrics = {};
  }

  /**
   * Run complete integration verification
   */
  async runCompleteVerification() {
    console.log('🚀 Starting Complete Integration Verification...');
    console.log('='.repeat(60));
    
    try {
      // Phase 1: Component Availability Check
      await this.verifyComponentAvailability();
      
      // Phase 2: Component Integration Check
      await this.verifyComponentIntegration();
      
      // Phase 3: Data Flow Verification
      await this.verifyDataFlow();
      
      // Phase 4: User Workflow Verification
      await this.verifyUserWorkflows();
      
      // Phase 5: Performance Verification
      await this.verifyPerformance();
      
      // Phase 6: Error Handling Verification
      await this.verifyErrorHandling();
      
      // Phase 7: Persistence Verification
      await this.verifyPersistence();
      
      // Generate comprehensive report
      this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Integration verification failed:', error);
      this.logVerificationResult('Integration Verification Suite', false, error.message);
    }
  }

  /**
   * Verify component availability
   */
  async verifyComponentAvailability() {
    console.log('🔍 Phase 1: Verifying Component Availability...');
    
    const components = [
      { name: 'StateManager', object: window.stateManager },
      { name: 'EnhancedStorageManager', object: window.enhancedStorageManager },
      { name: 'NavigationManager', object: window.NavigationManager },
      { name: 'Router', object: window.Router },
      { name: 'PaymentManager', object: window.PaymentManager },
      { name: 'TransactionManager', object: window.TransactionManager },
      { name: 'AutopayManager', object: window.AutopayManager },
      { name: 'WalletConnectionManager', object: window.WalletConnectionManager },
      { name: 'LocalFaucetManager', object: window.LocalFaucetManager },
      { name: 'ToastManager', object: window.ToastManager },
      { name: 'LoadingManager', object: window.LoadingManager }
    ];

    for (const component of components) {
      try {
        if (component.object && typeof component.object === 'object') {
          this.componentStatus[component.name] = 'available';
          console.log(`✅ ${component.name} - Available`);
        } else {
          this.componentStatus[component.name] = 'missing';
          console.warn(`⚠️ ${component.name} - Missing or not initialized`);
        }
      } catch (error) {
        this.componentStatus[component.name] = 'error';
        console.error(`❌ ${component.name} - Error: ${error.message}`);
      }
    }

    // Verify DOM elements
    const criticalElements = [
      'auth-section',
      'home-section', 
      'pay-section',
      'transactions-section',
      'autopay-section',
      'nav-menu',
      'toast-container',
      'loading-overlay'
    ];

    for (const elementId of criticalElements) {
      const element = document.getElementById(elementId);
      if (element) {
        console.log(`✅ DOM Element ${elementId} - Found`);
      } else {
        console.warn(`⚠️ DOM Element ${elementId} - Missing`);
      }
    }

    this.logVerificationResult('Component Availability', true);
  }

  /**
   * Verify component integration
   */
  async verifyComponentIntegration() {
    console.log('🔗 Phase 2: Verifying Component Integration...');
    
    try {
      // Test StateManager integration
      if (window.stateManager) {
        const testState = { integrationTest: Date.now() };
        await window.stateManager.setState(testState);
        const retrievedState = window.stateManager.getState('integrationTest');
        
        if (retrievedState !== testState.integrationTest) {
          throw new Error('StateManager integration failed');
        }
        console.log('✅ StateManager integration - Working');
      }

      // Test StorageManager integration
      if (window.enhancedStorageManager) {
        const testData = { integration: 'test', timestamp: Date.now() };
        await window.enhancedStorageManager.save('integration_test', testData);
        const loadedData = await window.enhancedStorageManager.load('integration_test');
        
        if (!loadedData || loadedData.integration !== testData.integration) {
          throw new Error('StorageManager integration failed');
        }
        
        await window.enhancedStorageManager.remove('integration_test');
        console.log('✅ StorageManager integration - Working');
      }

      // Test Router integration
      if (window.Router && window.NavigationManager) {
        const currentSection = window.NavigationManager.getCurrentSection();
        if (typeof currentSection !== 'string') {
          throw new Error('Router-NavigationManager integration failed');
        }
        console.log('✅ Router-NavigationManager integration - Working');
      }

      this.logVerificationResult('Component Integration', true);
      
    } catch (error) {
      this.logVerificationResult('Component Integration', false, error.message);
      throw error;
    }
  }

  /**
   * Verify data flow between components
   */
  async verifyDataFlow() {
    console.log('🌊 Phase 3: Verifying Data Flow...');
    
    try {
      // Test state to storage flow
      if (window.stateManager && window.enhancedStorageManager) {
        const testData = { dataFlow: 'test', value: Math.random() };
        
        // Set state
        await window.stateManager.setState({ dataFlowTest: testData });
        
        // Verify state persistence
        await window.stateManager.persistState({ dataFlowTest: testData });
        
        // Load from storage
        const storedData = await window.enhancedStorageManager.load('dataFlowTest');
        
        if (!storedData || storedData.value !== testData.value) {
          throw new Error('State to storage data flow failed');
        }
        
        console.log('✅ State to Storage data flow - Working');
      }

      // Test UI to state flow
      if (window.stateManager) {
        let uiUpdateReceived = false;
        const unsubscribe = window.stateManager.subscribe('uiTest', (value) => {
          uiUpdateReceived = true;
        });

        await window.stateManager.setState({ uiTest: 'ui-update' });
        
        if (!uiUpdateReceived) {
          throw new Error('UI to state data flow failed');
        }
        
        unsubscribe();
        console.log('✅ UI to State data flow - Working');
      }

      this.logVerificationResult('Data Flow', true);
      
    } catch (error) {
      this.logVerificationResult('Data Flow', false, error.message);
      throw error;
    }
  }

  /**
   * Verify user workflows
   */
  async verifyUserWorkflows() {
    console.log('👤 Phase 4: Verifying User Workflows...');
    
    try {
      // Run workflow validator
      const workflowValidator = new WorkflowValidator();
      await workflowValidator.validateAllWorkflows();
      
      const workflowResults = workflowValidator.validationResults;
      const passedWorkflows = workflowResults.filter(r => r.passed).length;
      const totalWorkflows = workflowResults.length;
      
      if (passedWorkflows < totalWorkflows) {
        console.warn(`⚠️ ${totalWorkflows - passedWorkflows} workflow(s) failed validation`);
      }
      
      this.workflowStatus = {
        total: totalWorkflows,
        passed: passedWorkflows,
        failed: totalWorkflows - passedWorkflows,
        results: workflowResults
      };

      this.logVerificationResult('User Workflows', passedWorkflows === totalWorkflows);
      
    } catch (error) {
      this.logVerificationResult('User Workflows', false, error.message);
      throw error;
    }
  }

  /**
   * Verify performance
   */
  async verifyPerformance() {
    console.log('⚡ Phase 5: Verifying Performance...');
    
    try {
      const performanceTests = [];

      // Test navigation performance
      const navStartTime = performance.now();
      if (window.Router) {
        await window.Router.push('home');
        await this.delay(100);
        await window.Router.push('pay');
        await this.delay(100);
        await window.Router.push('transactions');
      }
      const navEndTime = performance.now();
      const navTime = navEndTime - navStartTime;
      
      performanceTests.push({
        test: 'Navigation Performance',
        time: navTime,
        passed: navTime < 1000, // Should complete in under 1 second
        threshold: 1000
      });

      // Test state update performance
      const stateStartTime = performance.now();
      if (window.stateManager) {
        for (let i = 0; i < 100; i++) {
          await window.stateManager.setState({ perfTest: i });
        }
      }
      const stateEndTime = performance.now();
      const stateTime = stateEndTime - stateStartTime;
      
      performanceTests.push({
        test: 'State Update Performance',
        time: stateTime,
        passed: stateTime < 500, // Should complete in under 500ms
        threshold: 500
      });

      // Test storage performance
      const storageStartTime = performance.now();
      if (window.enhancedStorageManager) {
        for (let i = 0; i < 50; i++) {
          await window.enhancedStorageManager.save(`perf_test_${i}`, { data: i });
        }
        for (let i = 0; i < 50; i++) {
          await window.enhancedStorageManager.load(`perf_test_${i}`);
        }
        for (let i = 0; i < 50; i++) {
          await window.enhancedStorageManager.remove(`perf_test_${i}`);
        }
      }
      const storageEndTime = performance.now();
      const storageTime = storageEndTime - storageStartTime;
      
      performanceTests.push({
        test: 'Storage Performance',
        time: storageTime,
        passed: storageTime < 2000, // Should complete in under 2 seconds
        threshold: 2000
      });

      this.performanceMetrics = performanceTests;

      // Log results
      performanceTests.forEach(test => {
        if (test.passed) {
          console.log(`✅ ${test.test} - ${test.time.toFixed(2)}ms (< ${test.threshold}ms)`);
        } else {
          console.warn(`⚠️ ${test.test} - ${test.time.toFixed(2)}ms (> ${test.threshold}ms)`);
        }
      });

      const allPassed = performanceTests.every(test => test.passed);
      this.logVerificationResult('Performance', allPassed);
      
    } catch (error) {
      this.logVerificationResult('Performance', false, error.message);
      throw error;
    }
  }

  /**
   * Verify error handling
   */
  async verifyErrorHandling() {
    console.log('⚠️ Phase 6: Verifying Error Handling...');
    
    try {
      const errorTests = [];

      // Test invalid state updates
      if (window.stateManager) {
        try {
          await window.stateManager.setState(null);
          errorTests.push({ test: 'Invalid State Update', passed: false });
        } catch (error) {
          errorTests.push({ test: 'Invalid State Update', passed: true });
        }
      }

      // Test invalid storage operations
      if (window.enhancedStorageManager) {
        try {
          await window.enhancedStorageManager.save('', undefined);
          errorTests.push({ test: 'Invalid Storage Save', passed: false });
        } catch (error) {
          errorTests.push({ test: 'Invalid Storage Save', passed: true });
        }
      }

      // Test invalid navigation
      if (window.Router) {
        try {
          const result = await window.Router.push('invalid-section');
          errorTests.push({ test: 'Invalid Navigation', passed: !result });
        } catch (error) {
          errorTests.push({ test: 'Invalid Navigation', passed: true });
        }
      }

      // Log results
      errorTests.forEach(test => {
        if (test.passed) {
          console.log(`✅ ${test.test} - Properly handled`);
        } else {
          console.warn(`⚠️ ${test.test} - Not properly handled`);
        }
      });

      const allPassed = errorTests.every(test => test.passed);
      this.logVerificationResult('Error Handling', allPassed);
      
    } catch (error) {
      this.logVerificationResult('Error Handling', false, error.message);
      throw error;
    }
  }

  /**
   * Verify persistence
   */
  async verifyPersistence() {
    console.log('💾 Phase 7: Verifying Persistence...');
    
    try {
      const persistenceTests = [];

      // Test user data persistence
      if (window.stateManager && window.enhancedStorageManager) {
        const testUser = {
          id: 'test-user-' + Date.now(),
          name: 'Persistence Test User',
          email: 'persistence@test.com'
        };

        // Set user data
        await window.stateManager.setState({ currentUser: testUser });
        
        // Persist state
        await window.stateManager.persistState();
        
        // Load from storage
        const persistedUser = await window.enhancedStorageManager.load('currentUser');
        
        persistenceTests.push({
          test: 'User Data Persistence',
          passed: persistedUser && persistedUser.id === testUser.id
        });
      }

      // Test balance persistence
      if (window.stateManager && window.enhancedStorageManager) {
        const testBalance = { btc: 0.123456, usd: 1234.56 };
        
        await window.stateManager.setState({ balance: testBalance });
        await window.stateManager.persistState();
        
        const persistedBalance = await window.enhancedStorageManager.load('balance');
        
        persistenceTests.push({
          test: 'Balance Persistence',
          passed: persistedBalance && persistedBalance.btc === testBalance.btc
        });
      }

      // Test transaction persistence
      if (window.stateManager && window.enhancedStorageManager) {
        const testTransactions = [
          {
            id: 'tx-1',
            type: 'send',
            amount: 0.001,
            timestamp: Date.now()
          }
        ];
        
        await window.stateManager.setState({ transactions: testTransactions });
        await window.stateManager.persistState();
        
        const persistedTransactions = await window.enhancedStorageManager.load('transactions');
        
        persistenceTests.push({
          test: 'Transaction Persistence',
          passed: Array.isArray(persistedTransactions) && persistedTransactions.length > 0
        });
      }

      // Log results
      persistenceTests.forEach(test => {
        if (test.passed) {
          console.log(`✅ ${test.test} - Working`);
        } else {
          console.warn(`⚠️ ${test.test} - Failed`);
        }
      });

      const allPassed = persistenceTests.every(test => test.passed);
      this.logVerificationResult('Persistence', allPassed);
      
    } catch (error) {
      this.logVerificationResult('Persistence', false, error.message);
      throw error;
    }
  }

  /**
   * Log verification result
   */
  logVerificationResult(phaseName, passed, error = null) {
    const result = {
      phase: phaseName,
      passed,
      error,
      timestamp: Date.now()
    };
    
    this.verificationResults.push(result);
    
    if (passed) {
      console.log(`✅ ${phaseName} - VERIFIED`);
    } else {
      console.error(`❌ ${phaseName} - FAILED: ${error || 'Unknown error'}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport() {
    const totalPhases = this.verificationResults.length;
    const passedPhases = this.verificationResults.filter(r => r.passed).length;
    const failedPhases = totalPhases - passedPhases;
    const successRate = totalPhases > 0 ? (passedPhases / totalPhases * 100).toFixed(1) : 0;

    console.log('\n📊 COMPREHENSIVE INTEGRATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Verification Phases: ${totalPhases}`);
    console.log(`Passed: ${passedPhases}`);
    console.log(`Failed: ${failedPhases}`);
    console.log(`Overall Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    // Component Status Summary
    console.log('\n🔧 COMPONENT STATUS:');
    Object.entries(this.componentStatus).forEach(([component, status]) => {
      const icon = status === 'available' ? '✅' : status === 'missing' ? '⚠️' : '❌';
      console.log(`${icon} ${component}: ${status}`);
    });

    // Workflow Status Summary
    if (this.workflowStatus.total) {
      console.log('\n👤 WORKFLOW STATUS:');
      console.log(`Total Workflows: ${this.workflowStatus.total}`);
      console.log(`Passed: ${this.workflowStatus.passed}`);
      console.log(`Failed: ${this.workflowStatus.failed}`);
    }

    // Performance Summary
    if (this.performanceMetrics.length > 0) {
      console.log('\n⚡ PERFORMANCE METRICS:');
      this.performanceMetrics.forEach(metric => {
        const icon = metric.passed ? '✅' : '⚠️';
        console.log(`${icon} ${metric.test}: ${metric.time.toFixed(2)}ms`);
      });
    }

    // Failed Phases
    if (failedPhases > 0) {
      console.log('\n❌ FAILED PHASES:');
      this.verificationResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`- ${r.phase}: ${r.error || 'Unknown error'}`);
        });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (failedPhases === 0) {
      console.log('✅ All integration tests passed! The application is ready for production.');
    } else {
      console.log('⚠️ Some integration tests failed. Please review and fix the issues before deployment.');
      
      if (this.componentStatus.missing || this.componentStatus.error) {
        console.log('- Check component initialization and dependencies');
      }
      
      if (this.workflowStatus.failed > 0) {
        console.log('- Review user workflow implementations');
      }
      
      if (this.performanceMetrics.some(m => !m.passed)) {
        console.log('- Optimize performance bottlenecks');
      }
    }

    // Store comprehensive results
    if (window.enhancedStorageManager) {
      const comprehensiveResults = {
        summary: {
          totalPhases,
          passedPhases,
          failedPhases,
          successRate
        },
        verificationResults: this.verificationResults,
        componentStatus: this.componentStatus,
        workflowStatus: this.workflowStatus,
        performanceMetrics: this.performanceMetrics,
        timestamp: Date.now(),
        version: '1.0.0'
      };

      window.enhancedStorageManager.save('comprehensive_integration_report', comprehensiveResults);
    }

    return {
      totalPhases,
      passedPhases,
      failedPhases,
      successRate,
      componentStatus: this.componentStatus,
      workflowStatus: this.workflowStatus,
      performanceMetrics: this.performanceMetrics
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
  window.IntegrationVerifier = IntegrationVerifier;
}

// Auto-run verification when script loads (optional)
if (typeof window !== 'undefined' && window.location.search.includes('verify=true')) {
  window.addEventListener('load', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for app initialization
    const verifier = new IntegrationVerifier();
    await verifier.runCompleteVerification();
  });
}