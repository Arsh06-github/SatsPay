/**
 * Unit Tests for Data Persistence
 * Tests localStorage operations, state management functions, and data recovery mechanisms
 * Requirements: 10.1, 10.3, 10.4
 */

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
    this.quotaExceeded = false;
  }

  getItem(key) {
    if (this.quotaExceeded && Math.random() < 0.1) {
      throw new Error('QuotaExceededError');
    }
    return this.store[key] || null;
  }

  setItem(key, value) {
    if (this.quotaExceeded) {
      throw new Error('QuotaExceededError');
    }
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  // Test utilities
  simulateQuotaExceeded(enabled = true) {
    this.quotaExceeded = enabled;
  }

  getStore() {
    return { ...this.store };
  }
}

// Test Suite for Enhanced Storage Manager
class StorageManagerTests {
  constructor() {
    this.mockLocalStorage = new MockLocalStorage();
    this.originalLocalStorage = null;
    this.testResults = [];
  }

  setUp() {
    // Replace localStorage with mock
    this.originalLocalStorage = global.localStorage || window.localStorage;
    global.localStorage = this.mockLocalStorage;
    window.localStorage = this.mockLocalStorage;
    
    // Clear mock storage
    this.mockLocalStorage.clear();
    this.mockLocalStorage.simulateQuotaExceeded(false);
  }

  tearDown() {
    // Restore original localStorage
    if (this.originalLocalStorage) {
      global.localStorage = this.originalLocalStorage;
      window.localStorage = this.originalLocalStorage;
    }
  }

  async runTest(testName, testFunction) {
    try {
      this.setUp();
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(`❌ ${testName}: ${error.message}`);
    } finally {
      this.tearDown();
    }
  }

  // Test: Basic serialization and deserialization
  async testBasicSerialization() {
    const storageManager = new EnhancedStorageManager();
    
    // Test different data types
    const testData = [
      { type: 'string', value: 'test string' },
      { type: 'number', value: 42 },
      { type: 'boolean', value: true },
      { type: 'object', value: { name: 'John', age: 30 } },
      { type: 'array', value: [1, 2, 3, 'test'] },
      { type: 'null', value: null }
    ];

    for (const test of testData) {
      const serialized = storageManager.serialize(test.value);
      const deserialized = storageManager.deserialize(serialized);
      
      if (JSON.stringify(deserialized) !== JSON.stringify(test.value)) {
        throw new Error(`Serialization failed for ${test.type}`);
      }
    }
  }

  // Test: Save and load operations
  async testSaveAndLoad() {
    const storageManager = new EnhancedStorageManager();
    
    const testData = {
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      balance: { btc: 0.012, usd: 500 },
      transactions: [
        { id: 1, amount: 0.001, type: 'send' },
        { id: 2, amount: 0.002, type: 'receive' }
      ]
    };

    // Test save operations
    for (const [key, value] of Object.entries(testData)) {
      const success = await storageManager.save(key, value);
      if (!success) {
        throw new Error(`Failed to save ${key}`);
      }
    }

    // Test load operations
    for (const [key, expectedValue] of Object.entries(testData)) {
      const loadedValue = await storageManager.load(key);
      if (JSON.stringify(loadedValue) !== JSON.stringify(expectedValue)) {
        throw new Error(`Loaded value doesn't match saved value for ${key}`);
      }
    }
  }

  // Test: Error handling and retry mechanism
  async testErrorHandlingAndRetry() {
    const storageManager = new EnhancedStorageManager();
    
    // Simulate quota exceeded error
    this.mockLocalStorage.simulateQuotaExceeded(true);
    
    try {
      await storageManager.save('test_key', 'test_value', { retries: 2 });
      throw new Error('Expected save to fail due to quota exceeded');
    } catch (error) {
      if (!error.message.includes('Storage quota exceeded')) {
        throw new Error('Expected quota exceeded error');
      }
    }

    // Test with quota available
    this.mockLocalStorage.simulateQuotaExceeded(false);
    const success = await storageManager.save('test_key', 'test_value');
    if (!success) {
      throw new Error('Save should succeed when quota is available');
    }
  }

  // Test: Backup and recovery mechanisms
  async testBackupAndRecovery() {
    const storageManager = new EnhancedStorageManager();
    
    const testData = { user: 'test_user', balance: 100 };
    
    // Save data with backup
    await storageManager.save('test_data', testData, { backup: true });
    
    // Verify backup was created
    const backupData = storageManager.getBackupData();
    if (!backupData || !backupData['satspay_test_data']) {
      throw new Error('Backup was not created');
    }

    // Simulate data corruption by removing original data
    localStorage.removeItem('satspay_test_data');
    
    // Test recovery from backup
    const recoveredData = await storageManager.recoverFromBackup('satspay_test_data');
    if (JSON.stringify(recoveredData) !== JSON.stringify(testData)) {
      throw new Error('Data recovery failed');
    }
  }

  // Test: Data validation
  async testDataValidation() {
    const storageManager = new EnhancedStorageManager();
    
    // Test valid data
    const validData = { name: 'test', value: 123 };
    if (!storageManager.validateData(validData)) {
      throw new Error('Valid data should pass validation');
    }

    // Test circular reference (should fail validation)
    const circularData = { name: 'test' };
    circularData.self = circularData;
    
    if (storageManager.validateData(circularData)) {
      throw new Error('Circular reference should fail validation');
    }

    // Test null and undefined (should be valid)
    if (!storageManager.validateData(null) || !storageManager.validateData(undefined)) {
      throw new Error('Null and undefined should be valid');
    }
  }

  // Test: Storage quota checking
  async testStorageQuotaCheck() {
    const storageManager = new EnhancedStorageManager();
    
    // Initially should have quota available
    if (!storageManager.checkStorageQuota()) {
      throw new Error('Should have storage quota available initially');
    }

    // Fill up storage with large data
    const largeData = 'x'.repeat(1000000); // 1MB string
    for (let i = 0; i < 6; i++) {
      localStorage.setItem(`large_data_${i}`, largeData);
    }

    // Should detect quota issues
    if (storageManager.checkStorageQuota()) {
      throw new Error('Should detect storage quota issues with large data');
    }
  }

  // Test: Metadata management
  async testMetadataManagement() {
    const storageManager = new EnhancedStorageManager();
    
    // Check initial metadata
    const initialMetadata = storageManager.getMetadata();
    if (!initialMetadata || !initialMetadata.version || !initialMetadata.dataKeys) {
      throw new Error('Initial metadata should be properly initialized');
    }

    // Test metadata updates
    const testMetadata = {
      ...initialMetadata,
      customField: 'test_value',
      lastUpdate: Date.now()
    };
    
    const success = storageManager.setMetadata(testMetadata);
    if (!success) {
      throw new Error('Failed to set metadata');
    }

    const updatedMetadata = storageManager.getMetadata();
    if (updatedMetadata.customField !== 'test_value') {
      throw new Error('Metadata was not updated correctly');
    }
  }

  // Test: Export and import functionality
  async testExportAndImport() {
    const storageManager = new EnhancedStorageManager();
    
    // Save test data
    const testData = {
      user: { name: 'Test User', id: 123 },
      settings: { theme: 'dark', notifications: true }
    };

    for (const [key, value] of Object.entries(testData)) {
      await storageManager.save(key, value);
    }

    // Export data
    const exportedData = await storageManager.exportData();
    if (!exportedData) {
      throw new Error('Failed to export data');
    }

    const parsedExport = JSON.parse(exportedData);
    if (!parsedExport.data || !parsedExport.metadata) {
      throw new Error('Exported data structure is invalid');
    }

    // Clear storage
    await storageManager.clearAll({ confirm: false });

    // Import data
    const importSuccess = await storageManager.importData(exportedData, { 
      overwrite: true, 
      validate: true 
    });
    
    if (!importSuccess) {
      throw new Error('Failed to import data');
    }

    // Verify imported data
    for (const [key, expectedValue] of Object.entries(testData)) {
      const loadedValue = await storageManager.load(key);
      if (JSON.stringify(loadedValue) !== JSON.stringify(expectedValue)) {
        throw new Error(`Imported data doesn't match for ${key}`);
      }
    }
  }

  // Run all storage manager tests
  async runAllStorageTests() {
    console.log('🧪 Running Enhanced Storage Manager Tests...\n');

    await this.runTest('Basic Serialization', () => this.testBasicSerialization());
    await this.runTest('Save and Load Operations', () => this.testSaveAndLoad());
    await this.runTest('Error Handling and Retry', () => this.testErrorHandlingAndRetry());
    await this.runTest('Backup and Recovery', () => this.testBackupAndRecovery());
    await this.runTest('Data Validation', () => this.testDataValidation());
    await this.runTest('Storage Quota Check', () => this.testStorageQuotaCheck());
    await this.runTest('Metadata Management', () => this.testMetadataManagement());
    await this.runTest('Export and Import', () => this.testExportAndImport());
  }
}

// Test Suite for State Manager
class StateManagerTests {
  constructor() {
    this.mockLocalStorage = new MockLocalStorage();
    this.originalLocalStorage = null;
    this.testResults = [];
  }

  setUp() {
    // Replace localStorage with mock
    this.originalLocalStorage = global.localStorage || window.localStorage;
    global.localStorage = this.mockLocalStorage;
    window.localStorage = this.mockLocalStorage;
    
    // Clear mock storage
    this.mockLocalStorage.clear();
    this.mockLocalStorage.simulateQuotaExceeded(false);

    // Mock enhanced storage manager
    global.enhancedStorageManager = new EnhancedStorageManager();
    window.enhancedStorageManager = global.enhancedStorageManager;
  }

  tearDown() {
    // Restore original localStorage
    if (this.originalLocalStorage) {
      global.localStorage = this.originalLocalStorage;
      window.localStorage = this.originalLocalStorage;
    }
  }

  async runTest(testName, testFunction) {
    try {
      this.setUp();
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(`❌ ${testName}: ${error.message}`);
    } finally {
      this.tearDown();
    }
  }

  // Test: State initialization
  async testStateInitialization() {
    const stateManager = new StateManager();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const state = stateManager.getState();
    
    // Check initial state structure
    const requiredKeys = [
      'currentUser', 'isAuthenticated', 'currentSection', 'walletConnected',
      'balance', 'transactions', 'autopayRules', 'initialized'
    ];

    for (const key of requiredKeys) {
      if (!state.hasOwnProperty(key)) {
        throw new Error(`Missing required state key: ${key}`);
      }
    }

    if (!state.initialized) {
      throw new Error('State should be initialized');
    }
  }

  // Test: State updates and validation
  async testStateUpdatesAndValidation() {
    const stateManager = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test valid state updates
    const validUpdates = {
      currentUser: { id: 1, name: 'Test User' },
      isAuthenticated: true,
      balance: { btc: 0.012, usd: 500 }
    };

    const success = await stateManager.setState(validUpdates);
    if (!success) {
      throw new Error('Valid state updates should succeed');
    }

    // Verify updates were applied
    const updatedState = stateManager.getState();
    if (!updatedState.isAuthenticated || updatedState.currentUser.name !== 'Test User') {
      throw new Error('State updates were not applied correctly');
    }

    // Test invalid state updates
    const invalidUpdates = {
      isAuthenticated: 'not_a_boolean',
      balance: 'invalid_balance_format'
    };

    const invalidSuccess = await stateManager.setState(invalidUpdates, { validate: true });
    if (invalidSuccess) {
      throw new Error('Invalid state updates should fail validation');
    }
  }

  // Test: State persistence and restoration
  async testStatePersistenceAndRestoration() {
    // Create first state manager instance
    const stateManager1 = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set some state
    const testState = {
      currentUser: { id: 1, name: 'Persistent User' },
      isAuthenticated: true,
      balance: { btc: 0.05, usd: 2000 },
      transactions: [{ id: 1, amount: 0.01, type: 'send' }]
    };

    await stateManager1.setState(testState);
    await stateManager1.persistState();

    // Create second state manager instance (simulating app restart)
    const stateManager2 = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check if state was restored
    const restoredState = stateManager2.getState();
    
    if (!restoredState.isAuthenticated) {
      throw new Error('Authentication state was not persisted');
    }

    if (restoredState.currentUser.name !== 'Persistent User') {
      throw new Error('User data was not persisted');
    }

    if (restoredState.balance.btc !== 0.05) {
      throw new Error('Balance was not persisted');
    }

    if (restoredState.transactions.length !== 1) {
      throw new Error('Transactions were not persisted');
    }
  }

  // Test: State subscriptions
  async testStateSubscriptions() {
    const stateManager = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    let callbackCount = 0;
    let lastValue = null;
    let lastPreviousValue = null;

    // Subscribe to balance changes
    const unsubscribe = stateManager.subscribe('balance', (value, previousValue, source) => {
      callbackCount++;
      lastValue = value;
      lastPreviousValue = previousValue;
    });

    // Update balance
    const newBalance = { btc: 0.1, usd: 4000 };
    await stateManager.setState({ balance: newBalance });

    // Check if callback was called
    if (callbackCount !== 1) {
      throw new Error(`Expected 1 callback, got ${callbackCount}`);
    }

    if (JSON.stringify(lastValue) !== JSON.stringify(newBalance)) {
      throw new Error('Callback did not receive correct new value');
    }

    // Test unsubscribe
    unsubscribe();
    await stateManager.setState({ balance: { btc: 0.2, usd: 8000 } });

    if (callbackCount !== 1) {
      throw new Error('Callback should not be called after unsubscribe');
    }
  }

  // Test: State reset functionality
  async testStateReset() {
    const stateManager = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set some state
    await stateManager.setState({
      currentUser: { id: 1, name: 'Test User' },
      isAuthenticated: true,
      balance: { btc: 0.1, usd: 4000 },
      transactions: [{ id: 1, amount: 0.01 }]
    });

    // Reset state
    const resetSuccess = await stateManager.resetState({ confirm: false });
    if (!resetSuccess) {
      throw new Error('State reset should succeed');
    }

    // Check if state was reset
    const resetState = stateManager.getState();
    
    if (resetState.isAuthenticated) {
      throw new Error('Authentication should be reset');
    }

    if (resetState.currentUser !== null) {
      throw new Error('Current user should be reset');
    }

    if (resetState.balance.btc !== 0) {
      throw new Error('Balance should be reset');
    }

    if (resetState.transactions.length !== 0) {
      throw new Error('Transactions should be reset');
    }
  }

  // Test: Error handling
  async testErrorHandling() {
    const stateManager = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate storage error
    this.mockLocalStorage.simulateQuotaExceeded(true);

    // Try to persist state (should handle error gracefully)
    const persistSuccess = await stateManager.persistState();
    if (persistSuccess) {
      throw new Error('Persist should fail with quota exceeded');
    }

    // Check if error was recorded
    const state = stateManager.getState();
    if (state.errors.length === 0) {
      throw new Error('Error should be recorded in state');
    }

    const lastError = state.errors[state.errors.length - 1];
    if (lastError.type !== 'STATE_PERSISTENCE_ERROR') {
      throw new Error('Error type should be STATE_PERSISTENCE_ERROR');
    }
  }

  // Test: Middleware functionality
  async testMiddleware() {
    const stateManager = new StateManager();
    await new Promise(resolve => setTimeout(resolve, 100));

    let middlewareCalled = false;
    let middlewareUpdates = null;

    // Add middleware
    stateManager.addMiddleware((updates, currentState) => {
      middlewareCalled = true;
      middlewareUpdates = updates;
      
      // Modify updates (add timestamp)
      return {
        ...updates,
        lastModified: Date.now()
      };
    });

    // Update state
    await stateManager.setState({ currentUser: { id: 1, name: 'Test' } });

    if (!middlewareCalled) {
      throw new Error('Middleware should be called');
    }

    if (!middlewareUpdates.currentUser) {
      throw new Error('Middleware should receive updates');
    }

    // Check if middleware modification was applied
    const state = stateManager.getState();
    if (!state.lastModified) {
      throw new Error('Middleware modification should be applied');
    }
  }

  // Run all state manager tests
  async runAllStateTests() {
    console.log('🧪 Running State Manager Tests...\n');

    await this.runTest('State Initialization', () => this.testStateInitialization());
    await this.runTest('State Updates and Validation', () => this.testStateUpdatesAndValidation());
    await this.runTest('State Persistence and Restoration', () => this.testStatePersistenceAndRestoration());
    await this.runTest('State Subscriptions', () => this.testStateSubscriptions());
    await this.runTest('State Reset', () => this.testStateReset());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Middleware Functionality', () => this.testMiddleware());
  }
}

// Test Suite for State Synchronizer
class StateSynchronizerTests {
  constructor() {
    this.mockLocalStorage = new MockLocalStorage();
    this.originalLocalStorage = null;
    this.testResults = [];
  }

  setUp() {
    // Replace localStorage with mock
    this.originalLocalStorage = global.localStorage || window.localStorage;
    global.localStorage = this.mockLocalStorage;
    window.localStorage = this.mockLocalStorage;
    
    // Clear mock storage
    this.mockLocalStorage.clear();
    this.mockLocalStorage.simulateQuotaExceeded(false);

    // Mock dependencies
    global.enhancedStorageManager = new EnhancedStorageManager();
    window.enhancedStorageManager = global.enhancedStorageManager;
    
    global.stateManager = new StateManager();
    window.stateManager = global.stateManager;
  }

  tearDown() {
    // Restore original localStorage
    if (this.originalLocalStorage) {
      global.localStorage = this.originalLocalStorage;
      window.localStorage = this.originalLocalStorage;
    }
  }

  async runTest(testName, testFunction) {
    try {
      this.setUp();
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(`❌ ${testName}: ${error.message}`);
    } finally {
      this.tearDown();
    }
  }

  // Test: Synchronizer initialization
  async testSynchronizerInitialization() {
    // Wait for state manager to initialize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const synchronizer = new StateSynchronizer();
    await synchronizer.init();

    if (!synchronizer.initialized) {
      throw new Error('Synchronizer should be initialized');
    }

    const stats = synchronizer.getStats();
    if (stats.syncHandlers === 0) {
      throw new Error('Sync handlers should be set up');
    }
  }

  // Test: Legacy data migration
  async testLegacyDataMigration() {
    // Set up legacy data in localStorage
    const legacyData = {
      satspay_user: JSON.stringify({ id: 1, name: 'Legacy User', email: 'legacy@test.com' }),
      satspay_transactions: JSON.stringify([
        { id: 1, amount: 0.01, type: 'send' },
        { id: 2, amount: 0.02, type: 'receive' }
      ]),
      satspay_wallet: JSON.stringify({
        connected: true,
        type: 'blue',
        balance: { btc: 0.05, usd: 2000 }
      })
    };

    for (const [key, value] of Object.entries(legacyData)) {
      localStorage.setItem(key, value);
    }

    // Wait for state manager to initialize
    await new Promise(resolve => setTimeout(resolve, 200));

    // Initialize synchronizer (should migrate data)
    const synchronizer = new StateSynchronizer();
    await synchronizer.init();

    // Check if data was migrated to state manager
    const state = window.stateManager.getState();
    
    if (!state.currentUser || state.currentUser.name !== 'Legacy User') {
      throw new Error('User data was not migrated');
    }

    if (!state.isAuthenticated) {
      throw new Error('Authentication state was not migrated');
    }

    if (state.transactions.length !== 2) {
      throw new Error('Transactions were not migrated');
    }

    if (!state.walletConnected) {
      throw new Error('Wallet connection state was not migrated');
    }

    if (state.balance.btc !== 0.05) {
      throw new Error('Balance was not migrated');
    }
  }

  // Test: State binding for legacy components
  async testStateBinding() {
    // Wait for state manager to initialize
    await new Promise(resolve => setTimeout(resolve, 200));

    const synchronizer = new StateSynchronizer();
    await synchronizer.init();

    let callbackCount = 0;
    let lastValue = null;

    // Create state binding
    const unsubscribe = synchronizer.createStateBinding(
      'TestComponent',
      'balance',
      (value, previousValue, source) => {
        callbackCount++;
        lastValue = value;
      }
    );

    if (!unsubscribe) {
      throw new Error('State binding should return unsubscribe function');
    }

    // Update state through state manager
    const newBalance = { btc: 0.1, usd: 4000 };
    await window.stateManager.setState({ balance: newBalance });

    if (callbackCount !== 1) {
      throw new Error('State binding callback should be called');
    }

    if (JSON.stringify(lastValue) !== JSON.stringify(newBalance)) {
      throw new Error('State binding should receive correct value');
    }

    // Test unsubscribe
    unsubscribe();
    await window.stateManager.setState({ balance: { btc: 0.2, usd: 8000 } });

    if (callbackCount !== 1) {
      throw new Error('Callback should not be called after unsubscribe');
    }
  }

  // Test: Component state updates
  async testComponentStateUpdates() {
    // Wait for state manager to initialize
    await new Promise(resolve => setTimeout(resolve, 200));

    const synchronizer = new StateSynchronizer();
    await synchronizer.init();

    // Update state from component
    const componentUpdates = {
      currentUser: { id: 2, name: 'Component User' },
      isAuthenticated: true,
      balance: { btc: 0.15, usd: 6000 }
    };

    const success = await synchronizer.updateStateFromComponent('TestComponent', componentUpdates);
    if (!success) {
      throw new Error('Component state update should succeed');
    }

    // Verify state was updated
    const state = window.stateManager.getState();
    if (state.currentUser.name !== 'Component User') {
      throw new Error('State was not updated from component');
    }

    if (state.balance.btc !== 0.15) {
      throw new Error('Balance was not updated from component');
    }
  }

  // Test: Get state for components
  async testGetStateForComponent() {
    // Wait for state manager to initialize
    await new Promise(resolve => setTimeout(resolve, 200));

    const synchronizer = new StateSynchronizer();
    await synchronizer.init();

    // Set some state
    await window.stateManager.setState({
      currentUser: { id: 1, name: 'Test User' },
      balance: { btc: 0.1, usd: 4000 },
      transactions: [{ id: 1, amount: 0.01 }]
    });

    // Get specific state keys
    const specificState = synchronizer.getStateForComponent('TestComponent', ['currentUser', 'balance']);
    
    if (!specificState.currentUser || !specificState.balance) {
      throw new Error('Should return requested state keys');
    }

    if (specificState.transactions) {
      throw new Error('Should not return unrequested state keys');
    }

    // Get all state
    const allState = synchronizer.getStateForComponent('TestComponent');
    if (!allState.currentUser || !allState.balance || !allState.transactions) {
      throw new Error('Should return all state when no keys specified');
    }
  }

  // Run all synchronizer tests
  async runAllSynchronizerTests() {
    console.log('🧪 Running State Synchronizer Tests...\n');

    await this.runTest('Synchronizer Initialization', () => this.testSynchronizerInitialization());
    await this.runTest('Legacy Data Migration', () => this.testLegacyDataMigration());
    await this.runTest('State Binding', () => this.testStateBinding());
    await this.runTest('Component State Updates', () => this.testComponentStateUpdates());
    await this.runTest('Get State for Component', () => this.testGetStateForComponent());
  }
}

// Main test runner
class DataPersistenceTestRunner {
  constructor() {
    this.storageTests = new StorageManagerTests();
    this.stateTests = new StateManagerTests();
    this.synchronizerTests = new StateSynchronizerTests();
  }

  async runAllTests() {
    console.log('🚀 Starting Data Persistence Unit Tests\n');
    console.log('Testing Requirements: 10.1, 10.3, 10.4\n');
    console.log('=' .repeat(60));

    try {
      // Run storage manager tests
      await this.storageTests.runAllStorageTests();
      console.log('\n' + '=' .repeat(60));

      // Run state manager tests  
      await this.stateTests.runAllStateTests();
      console.log('\n' + '=' .repeat(60));

      // Run synchronizer tests
      await this.synchronizerTests.runAllSynchronizerTests();
      console.log('\n' + '=' .repeat(60));

      // Print summary
      this.printTestSummary();

    } catch (error) {
      console.error('Test runner error:', error);
    }
  }

  printTestSummary() {
    const allResults = [
      ...this.storageTests.testResults,
      ...this.stateTests.testResults,
      ...this.synchronizerTests.testResults
    ];

    const passed = allResults.filter(r => r.status === 'PASS').length;
    const failed = allResults.filter(r => r.status === 'FAIL').length;
    const total = allResults.length;

    console.log('\n📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      allResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✨ Data Persistence Tests Complete!');
  }
}

// Export test runner for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataPersistenceTestRunner,
    StorageManagerTests,
    StateManagerTests,
    StateSynchronizerTests,
    MockLocalStorage
  };
} else if (typeof window !== 'undefined') {
  window.DataPersistenceTestRunner = DataPersistenceTestRunner;
  window.StorageManagerTests = StorageManagerTests;
  window.StateManagerTests = StateManagerTests;
  window.StateSynchronizerTests = StateSynchronizerTests;
  window.MockLocalStorage = MockLocalStorage;
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - provide manual trigger
  console.log('Data Persistence Tests loaded. Run tests with: new DataPersistenceTestRunner().runAllTests()');
} else if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment - auto-run
  const testRunner = new DataPersistenceTestRunner();
  testRunner.runAllTests();
}