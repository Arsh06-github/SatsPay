/**
 * Enhanced Error Handler for SatsPay Application
 * Provides comprehensive error handling, logging, and user feedback
 */

class EnhancedErrorHandler {
  constructor() {
    this.errorLog = [];
    this.errorCounts = new Map();
    this.maxErrorLogSize = 100;
    this.retryAttempts = new Map();
    this.maxRetryAttempts = 3;
    
    this.errorTypes = {
      NETWORK: 'network',
      STORAGE: 'storage',
      VALIDATION: 'validation',
      PAYMENT: 'payment',
      STATE: 'state',
      UI: 'ui',
      UNKNOWN: 'unknown'
    };
    
    this.severityLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  /**
   * Initialize error handler
   */
  init() {
    console.log('🛡️ Initializing Enhanced Error Handler...');
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Set up promise rejection handler
    this.setupPromiseRejectionHandler();
    
    // Set up custom error handlers
    this.setupCustomErrorHandlers();
    
    // Set up error recovery mechanisms
    this.setupErrorRecovery();
    
    console.log('✅ Enhanced Error Handler initialized');
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: this.errorTypes.UI,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        severity: this.severityLevels.MEDIUM
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: this.errorTypes.NETWORK,
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          severity: this.severityLevels.LOW
        });
      }
    }, true);
  }

  /**
   * Set up promise rejection handler
   */
  setupPromiseRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: this.errorTypes.UNKNOWN,
        message: 'Unhandled promise rejection',
        reason: event.reason,
        severity: this.severityLevels.HIGH
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });
  }

  /**
   * Set up custom error handlers
   */
  setupCustomErrorHandlers() {
    // Wrap StateManager methods
    if (window.stateManager) {
      this.wrapStateManagerMethods();
    }

    // Wrap StorageManager methods
    if (window.enhancedStorageManager) {
      this.wrapStorageManagerMethods();
    }

    // Wrap Router methods
    if (window.Router) {
      this.wrapRouterMethods();
    }

    // AuthManager methods removed - no longer needed for no-authentication mode
  }

  /**
   * Wrap StateManager methods with error handling
   */
  wrapStateManagerMethods() {
    const originalSetState = window.stateManager.setState;
    window.stateManager.setState = async (updates, options) => {
      try {
        return await originalSetState.call(window.stateManager, updates, options);
      } catch (error) {
        this.handleError({
          type: this.errorTypes.STATE,
          message: 'State update failed',
          error,
          context: { updates, options },
          severity: this.severityLevels.HIGH,
          recoverable: true
        });
        throw error;
      }
    };

    const originalLoadPersistedState = window.stateManager.loadPersistedState;
    window.stateManager.loadPersistedState = async () => {
      try {
        return await originalLoadPersistedState.call(window.stateManager);
      } catch (error) {
        this.handleError({
          type: this.errorTypes.STATE,
          message: 'Failed to load persisted state',
          error,
          severity: this.severityLevels.MEDIUM,
          recoverable: true
        });
        
        // Attempt recovery by resetting state
        return this.recoverFromStateError();
      }
    };
  }

  /**
   * Wrap StorageManager methods with error handling
   */
  wrapStorageManagerMethods() {
    const originalSave = window.enhancedStorageManager.save;
    window.enhancedStorageManager.save = async (key, data, options) => {
      try {
        return await originalSave.call(window.enhancedStorageManager, key, data, options);
      } catch (error) {
        this.handleError({
          type: this.errorTypes.STORAGE,
          message: `Failed to save data for key: ${key}`,
          error,
          context: { key, dataType: typeof data },
          severity: this.severityLevels.MEDIUM,
          recoverable: true
        });
        
        // Attempt recovery
        return this.recoverFromStorageError('save', key, data, options);
      }
    };

    const originalLoad = window.enhancedStorageManager.load;
    window.enhancedStorageManager.load = async (key, options) => {
      try {
        return await originalLoad.call(window.enhancedStorageManager, key, options);
      } catch (error) {
        this.handleError({
          type: this.errorTypes.STORAGE,
          message: `Failed to load data for key: ${key}`,
          error,
          context: { key },
          severity: this.severityLevels.MEDIUM,
          recoverable: true
        });
        
        // Attempt recovery
        return this.recoverFromStorageError('load', key, null, options);
      }
    };
  }

  /**
   * Wrap Router methods with error handling
   */
  wrapRouterMethods() {
    const originalPush = window.Router.push;
    window.Router.push = async (route) => {
      try {
        return await originalPush.call(window.Router, route);
      } catch (error) {
        this.handleError({
          type: this.errorTypes.UI,
          message: `Navigation failed for route: ${route}`,
          error,
          context: { route },
          severity: this.severityLevels.MEDIUM,
          recoverable: true
        });
        
        // Attempt recovery by navigating to home
        return this.recoverFromNavigationError(route);
      }
    };
  }



  /**
   * Handle error with comprehensive logging and user feedback
   */
  handleError(errorInfo) {
    // Create error entry
    const errorEntry = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      type: errorInfo.type || this.errorTypes.UNKNOWN,
      message: errorInfo.message || 'Unknown error',
      severity: errorInfo.severity || this.severityLevels.MEDIUM,
      error: errorInfo.error,
      context: errorInfo.context || {},
      recoverable: errorInfo.recoverable || false,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: errorInfo.error?.stack
    };

    // Add to error log
    this.addToErrorLog(errorEntry);

    // Update error counts
    this.updateErrorCounts(errorEntry.type);

    // Log to console based on severity
    this.logToConsole(errorEntry);

    // Show user feedback
    this.showUserFeedback(errorEntry);

    // Attempt recovery if possible
    if (errorEntry.recoverable) {
      this.attemptRecovery(errorEntry);
    }

    // Report critical errors
    if (errorEntry.severity === this.severityLevels.CRITICAL) {
      this.reportCriticalError(errorEntry);
    }

    return errorEntry;
  }

  /**
   * Add error to log
   */
  addToErrorLog(errorEntry) {
    this.errorLog.push(errorEntry);
    
    // Maintain log size
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog.shift();
    }

    // Store in localStorage for persistence
    if (window.enhancedStorageManager) {
      window.enhancedStorageManager.save('error_log', this.errorLog.slice(-20), { backup: false });
    }
  }

  /**
   * Update error counts
   */
  updateErrorCounts(errorType) {
    const count = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, count + 1);

    // Check for error patterns
    if (count > 5) {
      this.handleError({
        type: this.errorTypes.UNKNOWN,
        message: `High frequency of ${errorType} errors detected`,
        severity: this.severityLevels.HIGH,
        context: { errorType, count: count + 1 }
      });
    }
  }

  /**
   * Log to console based on severity
   */
  logToConsole(errorEntry) {
    const logMessage = `[${errorEntry.type.toUpperCase()}] ${errorEntry.message}`;
    
    switch (errorEntry.severity) {
      case this.severityLevels.LOW:
        console.info('ℹ️', logMessage, errorEntry);
        break;
      case this.severityLevels.MEDIUM:
        console.warn('⚠️', logMessage, errorEntry);
        break;
      case this.severityLevels.HIGH:
        console.error('❌', logMessage, errorEntry);
        break;
      case this.severityLevels.CRITICAL:
        console.error('🚨', logMessage, errorEntry);
        break;
    }
  }

  /**
   * Show user feedback
   */
  showUserFeedback(errorEntry) {
    if (window.ToastManager) {
      let message = '';
      let type = 'error';

      switch (errorEntry.type) {
        case this.errorTypes.NETWORK:
          message = 'Network connection issue. Please check your internet connection.';
          type = 'warning';
          break;
        case this.errorTypes.STORAGE:
          message = 'Data storage issue. Your changes may not be saved.';
          type = 'warning';
          break;
        case this.errorTypes.VALIDATION:
          message = 'Please check your input and try again.';
          type = 'warning';
          break;

        case this.errorTypes.PAYMENT:
          message = 'Payment processing failed. Please try again.';
          type = 'error';
          break;
        default:
          if (errorEntry.severity === this.severityLevels.LOW) {
            return; // Don't show low severity errors to users
          }
          message = 'An unexpected error occurred. Please try again.';
          type = 'error';
      }

      window.ToastManager.show(message, type, 5000);
    }
  }

  /**
   * Attempt error recovery
   */
  attemptRecovery(errorEntry) {
    const retryKey = `${errorEntry.type}_${errorEntry.message}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;

    if (attempts < this.maxRetryAttempts) {
      this.retryAttempts.set(retryKey, attempts + 1);
      
      setTimeout(() => {
        this.executeRecovery(errorEntry);
      }, Math.pow(2, attempts) * 1000); // Exponential backoff
    } else {
      console.warn(`Max retry attempts reached for error: ${errorEntry.message}`);
    }
  }

  /**
   * Execute recovery based on error type
   */
  executeRecovery(errorEntry) {
    switch (errorEntry.type) {
      case this.errorTypes.STATE:
        return this.recoverFromStateError();
      case this.errorTypes.STORAGE:
        return this.recoverFromStorageError();
      case this.errorTypes.UI:
        return this.recoverFromUIError();
      default:
        console.log('No specific recovery method for error type:', errorEntry.type);
    }
  }

  /**
   * Recover from state errors
   */
  async recoverFromStateError() {
    try {
      console.log('🔄 Attempting state recovery...');
      
      // Reset to safe state
      if (window.stateManager) {
        await window.stateManager.resetState({ confirm: false, keepUser: true });
        console.log('✅ State recovery successful');
        return true;
      }
    } catch (error) {
      console.error('❌ State recovery failed:', error);
    }
    return false;
  }

  /**
   * Recover from storage errors
   */
  async recoverFromStorageError(operation, key, data, options) {
    try {
      console.log(`🔄 Attempting storage recovery for ${operation}...`);
      
      if (operation === 'save' && window.enhancedStorageManager) {
        // Try to save with backup disabled
        return await window.enhancedStorageManager.save(key, data, { ...options, backup: false });
      } else if (operation === 'load' && window.enhancedStorageManager) {
        // Try to recover from backup
        return await window.enhancedStorageManager.recoverFromBackup(key);
      }
    } catch (error) {
      console.error('❌ Storage recovery failed:', error);
    }
    return null;
  }

  /**
   * Recover from navigation errors
   */
  async recoverFromNavigationError(failedRoute) {
    try {
      console.log('🔄 Attempting navigation recovery...');
      
      // Try to navigate to home
      if (window.Router && failedRoute !== 'home') {
        return await window.Router.push('home');
      } else {
        // Reload the page as last resort
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Navigation recovery failed:', error);
    }
    return false;
  }

  /**
   * Recover from UI errors
   */
  recoverFromUIError() {
    try {
      console.log('🔄 Attempting UI recovery...');
      
      // Refresh current section
      if (window.NavigationManager) {
        const currentSection = window.NavigationManager.getCurrentSection();
        window.NavigationManager.initializeSection(currentSection);
        return true;
      }
    } catch (error) {
      console.error('❌ UI recovery failed:', error);
    }
    return false;
  }

  /**
   * Report critical errors
   */
  reportCriticalError(errorEntry) {
    console.error('🚨 CRITICAL ERROR DETECTED:', errorEntry);
    
    // Store critical error for later analysis
    if (window.enhancedStorageManager) {
      const criticalErrors = JSON.parse(localStorage.getItem('critical_errors') || '[]');
      criticalErrors.push(errorEntry);
      localStorage.setItem('critical_errors', JSON.stringify(criticalErrors.slice(-10)));
    }
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: this.errorLog.slice(-10),
      errorCounts: Object.fromEntries(this.errorCounts)
    };

    // Count by type
    this.errorLog.forEach(error => {
      stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export error log
   */
  exportErrorLog() {
    const exportData = {
      errorLog: this.errorLog,
      statistics: this.getErrorStatistics(),
      exportedAt: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.errorCounts.clear();
    this.retryAttempts.clear();
    
    if (window.enhancedStorageManager) {
      window.enhancedStorageManager.remove('error_log');
    }
    
    console.log('🧹 Error log cleared');
  }

  /**
   * Set up error recovery mechanisms
   */
  setupErrorRecovery() {
    // Auto-recovery for common issues
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    // Check if critical components are still available
    const criticalComponents = [
      'stateManager',
      'enhancedStorageManager',
      'NavigationManager',
      'Router'
    ];

    criticalComponents.forEach(component => {
      if (!window[component]) {
        this.handleError({
          type: this.errorTypes.CRITICAL,
          message: `Critical component missing: ${component}`,
          severity: this.severityLevels.CRITICAL,
          recoverable: false
        });
      }
    });
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.EnhancedErrorHandler = EnhancedErrorHandler;
}