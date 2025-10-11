/**
 * State Management System Test Suite
 * Simple tests to verify the implementation works correctly
 */

class StateTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  /**
   * Add a test
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('🧪 Running State Management Tests...');
    this.results = [];

    for (const test of this.tests) {
      try {
        console.log(`Running: ${test.name}`);
        await test.testFn();
        this.results.push({ name: test.name, status: 'PASS' });
        console.log(`✅ ${test.name} - PASSED`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'FAIL', error: error.message });
        console.error(`❌ ${test.name} - FAILED:`, error.message);
      }
    }

    this.printResults();
  }

  /**
   * Print test results
   */
  printResults() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Wait helper
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create test suite
const stateTests = new StateTestSuite();

// Test 1: Enhanced Storage Manager Basic Operations
stateTests.addTest('Enhanced Storage Manager - Basic Operations', async () => {
  const storage = window.enhancedStorageManager;
  stateTests.assert(storage, 'Enhanced storage manager should be available');

  // Test save and load
  const testData = { test: 'data', number: 42, array: [1, 2, 3] };
  await storage.save('test_key', testData);
  
  const loadedData = await storage.load('test_key');
  stateTests.assert(JSON.stringify(loadedData) === JSON.stringify(testData), 'Loaded data should match saved data');

  // Test remove
  await storage.remove('test_key');
  const removedData = await storage.load('test_key');
  stateTests.assert(removedData === null, 'Removed data should return null');
});

// Test 2: State Manager Basic Operations
stateTests.addTest('State Manager - Basic Operations', async () => {
  const stateManager = window.stateManager;
  stateTests.assert(stateManager, 'State manager should be available');

  // Test setState and getState
  await stateManager.setState({ testValue: 'hello world' });
  const value = stateManager.getState('testValue');
  stateTests.assert(value === 'hello world', 'State value should be set correctly');

  // Test state subscription
  let subscriptionCalled = false;
  let subscriptionValue = null;

  const unsubscribe = stateManager.subscribe('testValue', (newValue) => {
    subscriptionCalled = true;
    subscriptionValue = newValue;
  });

  await stateManager.setState({ testValue: 'updated value' });
  await stateTests.wait(50); // Wait for async subscription

  stateTests.assert(subscriptionCalled, 'Subscription should be called');
  stateTests.assert(subscriptionValue === 'updated value', 'Subscription should receive correct value');

  unsubscribe();
});

// Test 3: State Persistence
stateTests.addTest('State Manager - Persistence', async () => {
  const stateManager = window.stateManager;
  
  // Set some persistent state
  await stateManager.setState({ 
    currentUser: { id: 'test123', name: 'Test User' },
    isAuthenticated: true,
    balance: { btc: 0.5, usd: 25000 }
  });

  // Verify state was persisted
  const storage = window.enhancedStorageManager;
  const persistedUser = await storage.load('currentUser');
  const persistedAuth = await storage.load('isAuthenticated');
  const persistedBalance = await storage.load('balance');

  stateTests.assert(persistedUser && persistedUser.id === 'test123', 'User should be persisted');
  stateTests.assert(persistedAuth === true, 'Authentication state should be persisted');
  stateTests.assert(persistedBalance && persistedBalance.btc === 0.5, 'Balance should be persisted');
});

// Test 4: State Synchronization
stateTests.addTest('State Synchronizer - Integration', async () => {
  const stateSynchronizer = window.stateSynchronizer;
  stateTests.assert(stateSynchronizer, 'State synchronizer should be available');
  stateTests.assert(stateSynchronizer.initialized, 'State synchronizer should be initialized');

  // Test component state update
  const success = await stateSynchronizer.updateStateFromComponent('TestComponent', {
    testComponentValue: 'component update'
  });

  stateTests.assert(success, 'Component state update should succeed');

  const value = window.stateManager.getState('testComponentValue');
  stateTests.assert(value === 'component update', 'State should be updated from component');
});

// Test 5: Error Handling
stateTests.addTest('Error Handling', async () => {
  const storage = window.enhancedStorageManager;
  
  // Test invalid data handling
  try {
    await storage.save('', 'invalid key');
    stateTests.assert(false, 'Should throw error for invalid key');
  } catch (error) {
    stateTests.assert(error.message.includes('Invalid key'), 'Should throw appropriate error');
  }

  // Test state validation
  const stateManager = window.stateManager;
  const result = await stateManager.setState({ balance: 'invalid balance' });
  stateTests.assert(result === false, 'Invalid state should be rejected');
});

// Test 6: Backup and Recovery
stateTests.addTest('Backup and Recovery', async () => {
  const storage = window.enhancedStorageManager;
  
  // Save some data
  const testData = { important: 'data', timestamp: Date.now() };
  await storage.save('backup_test', testData);
  
  // Create backup
  const backupSuccess = await storage.createBackup('satspay_backup_test');
  stateTests.assert(backupSuccess, 'Backup creation should succeed');
  
  // Remove original data
  await storage.remove('backup_test');
  
  // Recover from backup
  const recoveredData = await storage.recoverFromBackup('satspay_backup_test');
  stateTests.assert(recoveredData && recoveredData.important === 'data', 'Data should be recovered from backup');
});

// Export test suite for manual running
if (typeof window !== 'undefined') {
  window.stateTests = stateTests;
  
  // Auto-run tests if in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Run tests after a delay to ensure everything is initialized
    setTimeout(() => {
      if (window.enhancedStorageManager && window.stateManager && window.stateSynchronizer) {
        console.log('🚀 Auto-running state management tests...');
        stateTests.runTests();
      }
    }, 2000);
  }
}