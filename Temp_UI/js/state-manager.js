/**
 * Centralized Application State Management System
 * Provides state synchronization, persistence, and restoration across components
 */

class StateManager {
  constructor() {
    // Get default user from app.js if available
    const defaultUser = window.DefaultUser || {
      id: 'default-user',
      name: 'SatsPay User',
      email: 'user@satspay.app',
      age: 25,
      walletId: null,
      memberSince: Date.now(),
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.state = {
      // User state - set to authenticated with default user
      currentUser: defaultUser,
      isAuthenticated: true,
      
      // Navigation state - start at home instead of auth
      currentSection: 'home',
      previousSection: null,
      navigationHistory: [],
      
      // Wallet state
      walletConnected: false,
      connectedWallet: null,
      balance: { btc: 0, usd: 0 },
      
      // Transaction state
      transactions: [],
      pendingTransactions: [],
      
      // Autopay state
      autopayRules: [],
      
      // UI state
      loading: false,
      errors: [],
      notifications: [],
      
      // App state
      initialized: false,
      lastSync: null,
      version: '1.0.0'
    };

    this.subscribers = new Map();
    this.middleware = [];
    this.persistenceKeys = [
      'currentUser',
      'isAuthenticated', 
      'walletConnected',
      'connectedWallet',
      'balance',
      'transactions',
      'autopayRules',
      'navigationHistory'
    ];
    
    this.storageManager = window.enhancedStorageManager;
    this.syncInterval = null;
    this.autoSaveEnabled = true;
    
    this.init();
  }

  /**
   * Initialize state manager
   */
  async init() {
    try {
      // Load persisted state
      await this.loadPersistedState();
      
      // Set up auto-save
      if (this.autoSaveEnabled) {
        this.setupAutoSave();
      }
      
      // Mark as initialized
      this.setState({ initialized: true });
      
      console.log('StateManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize StateManager:', error);
      this.handleError('STATE_INIT_ERROR', error);
    }
  }

  /**
   * Get current state or specific state slice
   */
  getState(key = null) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * Set state with validation and persistence
   */
  async setState(updates, options = {}) {
    const { 
      persist = true, 
      notify = true, 
      validate = true,
      source = 'unknown'
    } = options;

    try {
      // Validate updates
      if (validate && !this.validateStateUpdates(updates)) {
        throw new Error('Invalid state updates');
      }

      // Apply middleware
      const processedUpdates = await this.applyMiddleware(updates, this.state);

      // Create new state
      const previousState = { ...this.state };
      const newState = { ...this.state, ...processedUpdates };

      // Update timestamp
      newState.lastSync = Date.now();

      // Set new state
      this.state = newState;

      // Persist state if requested
      if (persist) {
        await this.persistState(updates);
      }

      // Notify subscribers if requested
      if (notify) {
        this.notifySubscribers(updates, previousState, source);
      }

      return true;

    } catch (error) {
      console.error('Failed to set state:', error);
      this.handleError('STATE_UPDATE_ERROR', error);
      return false;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback, options = {}) {
    const { 
      immediate = false,
      filter = null 
    } = options;

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    // Create subscription ID
    const subscriptionId = `${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store subscription
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Map());
    }

    this.subscribers.get(key).set(subscriptionId, {
      callback,
      filter,
      createdAt: Date.now()
    });

    // Call immediately if requested
    if (immediate) {
      try {
        callback(this.state[key], null, 'immediate');
      } catch (error) {
        console.error(`Immediate callback error for ${key}:`, error);
      }
    }

    // Return unsubscribe function
    return () => this.unsubscribe(key, subscriptionId);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(key, subscriptionId) {
    try {
      const keySubscribers = this.subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.delete(subscriptionId);
        
        // Clean up empty key entries
        if (keySubscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Notify subscribers of state changes
   */
  notifySubscribers(updates, previousState, source) {
    for (const [key, value] of Object.entries(updates)) {
      const keySubscribers = this.subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.forEach((subscription, subscriptionId) => {
          try {
            const { callback, filter } = subscription;
            
            // Apply filter if provided
            if (filter && !filter(value, previousState[key])) {
              return;
            }

            callback(value, previousState[key], source);
          } catch (error) {
            console.error(`Subscriber callback error for ${key}:`, error);
            // Remove problematic subscription
            keySubscribers.delete(subscriptionId);
          }
        });
      }
    }
  }

  /**
   * Add middleware for state processing
   */
  addMiddleware(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middleware.push(middleware);
  }

  /**
   * Apply middleware to state updates
   */
  async applyMiddleware(updates, currentState) {
    let processedUpdates = { ...updates };

    for (const middleware of this.middleware) {
      try {
        processedUpdates = await middleware(processedUpdates, currentState) || processedUpdates;
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }

    return processedUpdates;
  }

  /**
   * Validate state updates
   */
  validateStateUpdates(updates) {
    try {
      // Check if updates is an object
      if (!updates || typeof updates !== 'object') {
        return false;
      }

      // Validate specific state keys
      for (const [key, value] of Object.entries(updates)) {
        if (!this.validateStateKey(key, value)) {
          console.warn(`Invalid state update for key: ${key}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('State validation error:', error);
      return false;
    }
  }

  /**
   * Validate individual state key
   */
  validateStateKey(key, value) {
    switch (key) {
      case 'currentUser':
        return value === null || (typeof value === 'object' && value.id);
      
      case 'isAuthenticated':
      case 'walletConnected':
      case 'loading':
      case 'initialized':
        return typeof value === 'boolean';
      
      case 'currentSection':
      case 'previousSection':
        return typeof value === 'string' || value === null;
      
      case 'balance':
        return typeof value === 'object' && 
               typeof value.btc === 'number' && 
               typeof value.usd === 'number';
      
      case 'transactions':
      case 'autopayRules':
      case 'errors':
      case 'notifications':
      case 'navigationHistory':
        return Array.isArray(value);
      
      case 'lastSync':
        return typeof value === 'number' || value === null;
      
      default:
        return true; // Allow unknown keys
    }
  }

  /**
   * Persist state to storage
   */
  async persistState(updates = null) {
    try {
      const stateToPersist = updates || this.state;
      const persistencePromises = [];

      // Ensure default user data is always persisted in no-auth mode
      const stateToSave = { ...stateToPersist };
      if (!stateToSave.currentUser) {
        stateToSave.currentUser = window.DefaultUser || {
          id: 'default-user',
          name: 'SatsPay User',
          email: 'user@satspay.app',
          age: 25,
          walletId: null,
          memberSince: Date.now(),
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
      }
      
      // Always ensure authenticated state is persisted
      stateToSave.isAuthenticated = true;

      for (const key of this.persistenceKeys) {
        if (!updates || updates.hasOwnProperty(key)) {
          const value = stateToSave[key];
          if (value !== undefined) {
            persistencePromises.push(
              this.storageManager.save(key, value, { backup: false })
            );
          }
        }
      }

      await Promise.all(persistencePromises);
      return true;

    } catch (error) {
      console.error('Failed to persist state:', error);
      this.handleError('STATE_PERSISTENCE_ERROR', error);
      return false;
    }
  }

  /**
   * Load persisted state from storage
   */
  async loadPersistedState() {
    try {
      const loadPromises = this.persistenceKeys.map(async (key) => {
        try {
          const value = await this.storageManager.load(key);
          return { key, value };
        } catch (error) {
          console.warn(`Failed to load persisted state for ${key}:`, error);
          return { key, value: null };
        }
      });

      const results = await Promise.all(loadPromises);
      const persistedState = {};

      results.forEach(({ key, value }) => {
        if (value !== null) {
          persistedState[key] = value;
        }
      });

      // Merge with current state, ensuring default user and authentication state
      const mergedState = { ...this.state, ...persistedState };
      
      // Ensure we always have a user and are authenticated in no-auth mode
      if (!mergedState.currentUser) {
        mergedState.currentUser = window.DefaultUser || {
          id: 'default-user',
          name: 'SatsPay User',
          email: 'user@satspay.app',
          age: 25,
          walletId: null,
          memberSince: Date.now(),
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
      }
      
      // Always ensure authenticated state in no-auth mode
      mergedState.isAuthenticated = true;
      
      // Ensure we don't start on auth section
      if (mergedState.currentSection === 'auth') {
        mergedState.currentSection = 'home';
      }
      
      this.state = mergedState;

      console.log('Persisted state loaded successfully');
      return true;

    } catch (error) {
      console.error('Failed to load persisted state:', error);
      this.handleError('STATE_LOAD_ERROR', error);
      return false;
    }
  }

  /**
   * Reset state to initial values
   */
  async resetState(options = {}) {
    const { 
      clearPersisted = true, 
      keepUser = false,
      confirm = true 
    } = options;

    if (confirm && !window.confirm('Are you sure you want to reset all application data?')) {
      return false;
    }

    try {
      // Clear persisted data if requested
      if (clearPersisted) {
        await this.clearPersistedState();
      }

      // Reset state
      const initialState = {
        currentUser: keepUser ? this.state.currentUser : (window.DefaultUser || {
          id: 'default-user',
          name: 'SatsPay User',
          email: 'user@satspay.app',
          age: 25,
          walletId: null,
          memberSince: Date.now(),
          createdAt: Date.now(),
          lastLogin: Date.now()
        }),
        isAuthenticated: true,
        currentSection: 'home',
        previousSection: null,
        navigationHistory: [],
        walletConnected: false,
        connectedWallet: null,
        balance: { btc: 0, usd: 0 },
        transactions: [],
        pendingTransactions: [],
        autopayRules: [],
        loading: false,
        errors: [],
        notifications: [],
        initialized: true,
        lastSync: Date.now(),
        version: this.state.version
      };

      this.state = initialState;

      // Notify subscribers
      this.notifySubscribers(initialState, {}, 'reset');

      console.log('State reset successfully');
      return true;

    } catch (error) {
      console.error('Failed to reset state:', error);
      this.handleError('STATE_RESET_ERROR', error);
      return false;
    }
  }

  /**
   * Clear persisted state from storage
   */
  async clearPersistedState() {
    try {
      const clearPromises = this.persistenceKeys.map(key => 
        this.storageManager.remove(key, { backup: false })
      );

      await Promise.all(clearPromises);
      return true;

    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      return false;
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    // Save state periodically
    this.syncInterval = setInterval(async () => {
      try {
        await this.persistState();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // Save every 30 seconds

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      try {
        // Ensure default user and auth state before saving
        const stateToSave = { ...this.state };
        if (!stateToSave.currentUser) {
          stateToSave.currentUser = window.DefaultUser || {
            id: 'default-user',
            name: 'SatsPay User',
            email: 'user@satspay.app',
            age: 25,
            walletId: null,
            memberSince: Date.now(),
            createdAt: Date.now(),
            lastLogin: Date.now()
          };
        }
        stateToSave.isAuthenticated = true;
        
        // Use synchronous storage for immediate save
        for (const key of this.persistenceKeys) {
          const value = stateToSave[key];
          if (value !== undefined) {
            localStorage.setItem(
              `satspay_${key}`, 
              JSON.stringify({
                type: typeof value,
                value: value,
                timestamp: Date.now(),
                version: this.state.version
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to save state on unload:', error);
      }
    });
  }

  /**
   * Handle errors
   */
  handleError(type, error) {
    const errorInfo = {
      type,
      message: error.message,
      timestamp: Date.now(),
      stack: error.stack
    };

    // Add to errors array
    this.state.errors.push(errorInfo);

    // Limit error history
    if (this.state.errors.length > 10) {
      this.state.errors = this.state.errors.slice(-10);
    }

    // Notify error subscribers
    this.notifySubscribers({ errors: this.state.errors }, { errors: [] }, 'error');
  }

  /**
   * Get state statistics
   */
  getStateStats() {
    return {
      subscriberCount: Array.from(this.subscribers.values())
        .reduce((total, keyMap) => total + keyMap.size, 0),
      middlewareCount: this.middleware.length,
      stateSize: JSON.stringify(this.state).length,
      lastSync: this.state.lastSync,
      initialized: this.state.initialized,
      version: this.state.version
    };
  }

  /**
   * Export state for debugging
   */
  exportState() {
    return {
      state: { ...this.state },
      stats: this.getStateStats(),
      exportedAt: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Clear auto-save interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Clear all subscribers
    this.subscribers.clear();

    // Clear middleware
    this.middleware = [];

    console.log('StateManager destroyed');
  }
}

// Create global instance
const stateManager = new StateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
} else if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
  window.stateManager = stateManager;
}