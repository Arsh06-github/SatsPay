/**
 * State Synchronization Utilities
 * Provides integration between legacy components and the new state management system
 */

class StateSynchronizer {
  constructor() {
    this.initialized = false;
    this.syncHandlers = new Map();
    this.legacyComponents = [
      'UserProfileManager', 
      'WalletConnectionManager',
      'LocalFaucetManager',
      'PaymentManager',
      'TransactionManager',
      'AutopayManager',
      'NavigationManager'
    ];
  }

  /**
   * Initialize state synchronization
   */
  async init() {
    if (this.initialized) return;

    try {
      // Wait for state manager to be ready
      await this.waitForStateManager();
      
      // Set up synchronization handlers
      this.setupAuthSync();
      this.setupWalletSync();
      this.setupTransactionSync();
      this.setupNavigationSync();
      this.setupBalanceSync();
      
      // Migrate existing localStorage data
      await this.migrateExistingData();
      
      this.initialized = true;
      console.log('State synchronization initialized');
      
    } catch (error) {
      console.error('Failed to initialize state synchronization:', error);
    }
  }

  /**
   * Wait for state manager to be available
   */
  async waitForStateManager() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('State manager initialization timeout'));
      }, 10000);

      const checkStateManager = () => {
        if (window.stateManager && window.stateManager.getState('initialized')) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkStateManager, 100);
        }
      };

      checkStateManager();
    });
  }

  /**
   * Set up authentication state synchronization
   */
  setupAuthSync() {
    // Subscribe to authentication changes
    window.stateManager.subscribe('isAuthenticated', (isAuthenticated, previousValue, source) => {
      if (source === 'auth-sync') return; // Prevent circular updates
      
      // Update legacy components
      this.notifyLegacyComponents('authenticationChanged', {
        isAuthenticated,
        previousValue,
        user: window.stateManager.getState('currentUser')
      });
    });

    window.stateManager.subscribe('currentUser', (user, previousValue, source) => {
      if (source === 'auth-sync') return;
      
      // Update user profile displays
      this.notifyLegacyComponents('userChanged', {
        user,
        previousValue
      });
    });

    // Create sync handler for auth manager
    this.syncHandlers.set('auth', {
      updateState: async (data) => {
        await window.stateManager.setState({
          currentUser: data.user,
          isAuthenticated: data.isAuthenticated
        }, { source: 'auth-sync' });
      }
    });
  }

  /**
   * Set up wallet state synchronization
   */
  setupWalletSync() {
    // Subscribe to wallet connection changes
    window.stateManager.subscribe('walletConnected', (connected, previousValue, source) => {
      if (source === 'wallet-sync') return;
      
      this.notifyLegacyComponents('walletConnectionChanged', {
        connected,
        previousValue,
        wallet: window.stateManager.getState('connectedWallet')
      });
    });

    window.stateManager.subscribe('connectedWallet', (wallet, previousValue, source) => {
      if (source === 'wallet-sync') return;
      
      this.notifyLegacyComponents('connectedWalletChanged', {
        wallet,
        previousValue
      });
    });

    // Create sync handler for wallet manager
    this.syncHandlers.set('wallet', {
      updateState: async (data) => {
        await window.stateManager.setState({
          walletConnected: data.connected,
          connectedWallet: data.wallet
        }, { source: 'wallet-sync' });
      }
    });
  }

  /**
   * Set up transaction state synchronization
   */
  setupTransactionSync() {
    // Subscribe to transaction changes
    window.stateManager.subscribe('transactions', (transactions, previousValue, source) => {
      if (source === 'transaction-sync') return;
      
      this.notifyLegacyComponents('transactionsChanged', {
        transactions,
        previousValue
      });
    });

    // Create sync handler for transaction manager
    this.syncHandlers.set('transactions', {
      updateState: async (data) => {
        await window.stateManager.setState({
          transactions: data.transactions
        }, { source: 'transaction-sync' });
      }
    });
  }

  /**
   * Set up navigation state synchronization
   */
  setupNavigationSync() {
    // Subscribe to navigation changes
    window.stateManager.subscribe('currentSection', (section, previousValue, source) => {
      if (source === 'navigation-sync') return;
      
      this.notifyLegacyComponents('navigationChanged', {
        currentSection: section,
        previousSection: previousValue
      });
    });

    // Create sync handler for navigation manager
    this.syncHandlers.set('navigation', {
      updateState: async (data) => {
        await window.stateManager.setState({
          currentSection: data.currentSection,
          previousSection: data.previousSection,
          navigationHistory: data.history || window.stateManager.getState('navigationHistory')
        }, { source: 'navigation-sync' });
      }
    });
  }

  /**
   * Set up balance state synchronization
   */
  setupBalanceSync() {
    // Subscribe to balance changes
    window.stateManager.subscribe('balance', (balance, previousValue, source) => {
      if (source === 'balance-sync') return;
      
      this.notifyLegacyComponents('balanceChanged', {
        balance,
        previousValue
      });
    });

    // Create sync handler for balance updates
    this.syncHandlers.set('balance', {
      updateState: async (data) => {
        await window.stateManager.setState({
          balance: data.balance
        }, { source: 'balance-sync' });
      }
    });
  }

  /**
   * Notify legacy components of state changes
   */
  notifyLegacyComponents(eventType, data) {
    this.legacyComponents.forEach(componentName => {
      try {
        const component = window[componentName];
        if (component && typeof component.onStateChange === 'function') {
          component.onStateChange(eventType, data);
        }
      } catch (error) {
        console.warn(`Failed to notify ${componentName} of state change:`, error);
      }
    });
  }

  /**
   * Sync state from legacy component
   */
  async syncFromComponent(componentType, data) {
    try {
      const handler = this.syncHandlers.get(componentType);
      if (handler) {
        await handler.updateState(data);
      }
    } catch (error) {
      console.error(`Failed to sync state from ${componentType}:`, error);
    }
  }

  /**
   * Migrate existing localStorage data to new state management
   */
  async migrateExistingData() {
    try {
      const legacyKeys = [
        'satspay_user',
        'satspay_transactions', 
        'satspay_autopay',
        'satspay_wallet',
        'satspay_navigation'
      ];

      const migrationData = {};

      // Load legacy data
      for (const key of legacyKeys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            
            switch (key) {
              case 'satspay_user':
                migrationData.currentUser = parsed;
                migrationData.isAuthenticated = !!parsed;
                break;
              case 'satspay_transactions':
                migrationData.transactions = Array.isArray(parsed) ? parsed : [];
                break;
              case 'satspay_autopay':
                migrationData.autopayRules = Array.isArray(parsed) ? parsed : [];
                break;
              case 'satspay_wallet':
                if (parsed.connected) {
                  migrationData.walletConnected = true;
                  migrationData.connectedWallet = parsed;
                }
                if (parsed.balance) {
                  migrationData.balance = parsed.balance;
                }
                break;
              case 'satspay_navigation':
                if (parsed.currentSection) {
                  migrationData.currentSection = parsed.currentSection;
                }
                break;
            }
          }
        } catch (error) {
          console.warn(`Failed to migrate ${key}:`, error);
        }
      }

      // Apply migrated data to state manager
      if (Object.keys(migrationData).length > 0) {
        await window.stateManager.setState(migrationData, { 
          source: 'migration',
          persist: true 
        });
        console.log('Legacy data migrated successfully:', migrationData);
      }

    } catch (error) {
      console.error('Failed to migrate existing data:', error);
    }
  }

  /**
   * Create state binding for legacy components
   */
  createStateBinding(componentName, stateKey, callback) {
    if (!this.initialized) {
      console.warn('State synchronizer not initialized');
      return null;
    }

    return window.stateManager.subscribe(stateKey, (value, previousValue, source) => {
      try {
        callback(value, previousValue, source);
      } catch (error) {
        console.error(`State binding error for ${componentName}.${stateKey}:`, error);
      }
    });
  }

  /**
   * Update state from legacy component
   */
  async updateStateFromComponent(componentName, updates) {
    if (!this.initialized) {
      console.warn('State synchronizer not initialized');
      return false;
    }

    try {
      await window.stateManager.setState(updates, {
        source: `${componentName.toLowerCase()}-component`,
        persist: true
      });
      return true;
    } catch (error) {
      console.error(`Failed to update state from ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Get current state for legacy components
   */
  getStateForComponent(componentName, stateKeys = null) {
    if (!this.initialized) {
      console.warn('State synchronizer not initialized');
      return null;
    }

    if (stateKeys) {
      const result = {};
      stateKeys.forEach(key => {
        result[key] = window.stateManager.getState(key);
      });
      return result;
    }

    return window.stateManager.getState();
  }

  /**
   * Reset state synchronization
   */
  async reset() {
    try {
      // Clear all sync handlers
      this.syncHandlers.clear();
      
      // Reset state manager
      if (window.stateManager) {
        await window.stateManager.resetState();
      }
      
      this.initialized = false;
      console.log('State synchronization reset');
      
    } catch (error) {
      console.error('Failed to reset state synchronization:', error);
    }
  }

  /**
   * Get synchronization statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      syncHandlers: this.syncHandlers.size,
      legacyComponents: this.legacyComponents.length,
      stateManagerStats: window.stateManager ? window.stateManager.getStateStats() : null
    };
  }
}

// Create global instance
const stateSynchronizer = new StateSynchronizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateSynchronizer;
} else if (typeof window !== 'undefined') {
  window.StateSynchronizer = StateSynchronizer;
  window.stateSynchronizer = stateSynchronizer;
}