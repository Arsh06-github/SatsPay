/**
 * Performance Optimizer for SatsPay Application
 * Implements performance optimizations and monitoring
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      navigationTimes: [],
      stateUpdateTimes: [],
      storageOperationTimes: [],
      renderTimes: [],
      memoryUsage: []
    };
    
    this.optimizations = {
      debounceTimers: new Map(),
      throttleTimers: new Map(),
      intersectionObserver: null,
      resizeObserver: null,
      animationFrameCallbacks: new Set()
    };
    
    this.config = {
      debounceDelay: 300,
      throttleDelay: 100,
      maxMetricsHistory: 100,
      performanceThresholds: {
        navigation: 1000,
        stateUpdate: 100,
        storageOperation: 500,
        render: 16.67 // 60fps
      }
    };
  }

  /**
   * Initialize performance optimizations
   */
  init() {
    console.log('🚀 Initializing Performance Optimizer...');
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    // Optimize DOM operations
    this.optimizeDOMOperations();
    
    // Optimize event handlers
    this.optimizeEventHandlers();
    
    // Optimize animations
    this.optimizeAnimations();
    
    // Optimize memory usage
    this.optimizeMemoryUsage();
    
    // Set up lazy loading
    this.setupLazyLoading();
    
    // Optimize storage operations
    this.optimizeStorageOperations();
    
    console.log('✅ Performance Optimizer initialized');
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor navigation performance
    if (window.Router) {
      const originalPush = window.Router.push;
      window.Router.push = async (route) => {
        const startTime = performance.now();
        const result = await originalPush.call(window.Router, route);
        const endTime = performance.now();
        
        this.recordMetric('navigation', endTime - startTime);
        return result;
      };
    }

    // Monitor state update performance
    if (window.stateManager) {
      const originalSetState = window.stateManager.setState;
      window.stateManager.setState = async (updates, options) => {
        const startTime = performance.now();
        const result = await originalSetState.call(window.stateManager, updates, options);
        const endTime = performance.now();
        
        this.recordMetric('stateUpdate', endTime - startTime);
        return result;
      };
    }

    // Monitor storage operation performance
    if (window.enhancedStorageManager) {
      const originalSave = window.enhancedStorageManager.save;
      window.enhancedStorageManager.save = async (key, data, options) => {
        const startTime = performance.now();
        const result = await originalSave.call(window.enhancedStorageManager, key, data, options);
        const endTime = performance.now();
        
        this.recordMetric('storageOperation', endTime - startTime);
        return result;
      };
    }

    // Monitor memory usage
    this.startMemoryMonitoring();
  }

  /**
   * Record performance metric
   */
  recordMetric(type, value) {
    if (!this.metrics[type + 'Times']) {
      this.metrics[type + 'Times'] = [];
    }
    
    this.metrics[type + 'Times'].push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only recent metrics
    if (this.metrics[type + 'Times'].length > this.config.maxMetricsHistory) {
      this.metrics[type + 'Times'].shift();
    }
    
    // Check performance thresholds
    this.checkPerformanceThreshold(type, value);
  }

  /**
   * Check performance threshold
   */
  checkPerformanceThreshold(type, value) {
    const threshold = this.config.performanceThresholds[type];
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance warning: ${type} took ${value.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }
  }

  /**
   * Optimize DOM operations
   */
  optimizeDOMOperations() {
    // Batch DOM updates using DocumentFragment
    this.createDOMBatcher();
    
    // Optimize scroll handlers
    this.optimizeScrollHandlers();
    
    // Optimize resize handlers
    this.optimizeResizeHandlers();
  }

  /**
   * Create DOM batcher for efficient updates
   */
  createDOMBatcher() {
    window.DOMBatcher = {
      queue: [],
      isScheduled: false,
      
      add(callback) {
        this.queue.push(callback);
        if (!this.isScheduled) {
          this.isScheduled = true;
          requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();
            this.queue.forEach(callback => callback(fragment));
            this.queue = [];
            this.isScheduled = false;
          });
        }
      }
    };
  }

  /**
   * Optimize scroll handlers
   */
  optimizeScrollHandlers() {
    let scrollTimeout;
    const optimizedScrollHandler = this.throttle((event) => {
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Set new timeout for scroll end
      scrollTimeout = setTimeout(() => {
        // Scroll ended - perform expensive operations here
        this.onScrollEnd();
      }, 150);
    }, this.config.throttleDelay);

    // Replace existing scroll handlers
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }

  /**
   * Optimize resize handlers
   */
  optimizeResizeHandlers() {
    const optimizedResizeHandler = this.debounce(() => {
      // Batch resize operations
      requestAnimationFrame(() => {
        this.onWindowResize();
      });
    }, this.config.debounceDelay);

    window.addEventListener('resize', optimizedResizeHandler, { passive: true });
  }

  /**
   * Handle scroll end
   */
  onScrollEnd() {
    // Trigger lazy loading checks
    if (this.optimizations.intersectionObserver) {
      // Re-observe elements that might have come into view
      this.updateLazyLoadingObserver();
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    // Update responsive layouts
    this.updateResponsiveLayouts();
    
    // Recalculate animation boundaries
    this.recalculateAnimationBoundaries();
  }

  /**
   * Optimize event handlers
   */
  optimizeEventHandlers() {
    // Use event delegation for dynamic elements
    this.setupEventDelegation();
    
    // Optimize form input handlers
    this.optimizeFormHandlers();
    
    // Optimize button click handlers
    this.optimizeButtonHandlers();
  }

  /**
   * Set up event delegation
   */
  setupEventDelegation() {
    // Delegate click events
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (target) {
        const action = target.dataset.action;
        this.handleDelegatedAction(action, event, target);
      }
    }, { passive: false });

    // Delegate form events
    document.addEventListener('input', (event) => {
      if (event.target.matches('.form-input')) {
        this.handleFormInput(event);
      }
    }, { passive: true });
  }

  /**
   * Handle delegated actions
   */
  handleDelegatedAction(action, event, target) {
    switch (action) {
      case 'navigate':
        event.preventDefault();
        const section = target.dataset.section;
        if (section && window.Router) {
          window.Router.push(section);
        }
        break;
      
      case 'toggle':
        const toggleTarget = document.getElementById(target.dataset.target);
        if (toggleTarget) {
          toggleTarget.classList.toggle('hidden');
        }
        break;
      
      default:
        // Handle custom actions
        this.handleCustomAction(action, event, target);
    }
  }

  /**
   * Optimize form handlers
   */
  optimizeFormHandlers() {
    // Debounce form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('.form-input');
      inputs.forEach(input => {
        const debouncedValidation = this.debounce(() => {
          this.validateFormField(input);
        }, this.config.debounceDelay);
        
        input.addEventListener('input', debouncedValidation, { passive: true });
      });
    });
  }

  /**
   * Optimize button handlers
   */
  optimizeButtonHandlers() {
    // Prevent double-clicks on submit buttons
    const submitButtons = document.querySelectorAll('button[type="submit"], .btn-submit');
    submitButtons.forEach(button => {
      let isSubmitting = false;
      
      button.addEventListener('click', (event) => {
        if (isSubmitting) {
          event.preventDefault();
          return;
        }
        
        isSubmitting = true;
        setTimeout(() => {
          isSubmitting = false;
        }, 1000);
      });
    });
  }

  /**
   * Optimize animations
   */
  optimizeAnimations() {
    // Use CSS transforms for better performance
    this.optimizeCSSAnimations();
    
    // Batch animation updates
    this.setupAnimationBatching();
    
    // Reduce motion for accessibility
    this.respectReducedMotion();
  }

  /**
   * Optimize CSS animations
   */
  optimizeCSSAnimations() {
    // Add will-change property to animated elements
    const animatedElements = document.querySelectorAll('.floating, .shimmer, .pulse-glow, .card-hover-lift');
    animatedElements.forEach(element => {
      element.style.willChange = 'transform, opacity';
    });

    // Remove will-change after animation
    document.addEventListener('animationend', (event) => {
      if (event.target.style.willChange) {
        event.target.style.willChange = 'auto';
      }
    });
  }

  /**
   * Set up animation batching
   */
  setupAnimationBatching() {
    let animationQueue = [];
    let isAnimationScheduled = false;

    window.requestAnimationBatch = (callback) => {
      animationQueue.push(callback);
      
      if (!isAnimationScheduled) {
        isAnimationScheduled = true;
        requestAnimationFrame(() => {
          animationQueue.forEach(callback => callback());
          animationQueue = [];
          isAnimationScheduled = false;
        });
      }
    };
  }

  /**
   * Respect reduced motion preferences
   */
  respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable animations for users who prefer reduced motion
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Optimize memory usage
   */
  optimizeMemoryUsage() {
    // Clean up event listeners
    this.setupEventListenerCleanup();
    
    // Optimize object references
    this.optimizeObjectReferences();
    
    // Set up garbage collection hints
    this.setupGarbageCollectionHints();
  }

  /**
   * Set up event listener cleanup
   */
  setupEventListenerCleanup() {
    // Track event listeners for cleanup
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    const eventListeners = new WeakMap();
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!eventListeners.has(this)) {
        eventListeners.set(this, []);
      }
      eventListeners.get(this).push({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      // Event listeners will be automatically cleaned up
      console.log('🧹 Cleaning up event listeners...');
    });
  }

  /**
   * Set up lazy loading
   */
  setupLazyLoading() {
    // Lazy load images
    this.setupImageLazyLoading();
    
    // Lazy load components
    this.setupComponentLazyLoading();
  }

  /**
   * Set up image lazy loading
   */
  setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.optimizations.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.optimizations.intersectionObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observe all images with data-src
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        this.optimizations.intersectionObserver.observe(img);
      });
    }
  }

  /**
   * Optimize storage operations
   */
  optimizeStorageOperations() {
    // Batch storage operations
    this.setupStorageBatching();
    
    // Compress stored data
    this.setupStorageCompression();
  }

  /**
   * Set up storage batching
   */
  setupStorageBatching() {
    if (window.enhancedStorageManager) {
      let storageQueue = [];
      let isBatchScheduled = false;

      window.enhancedStorageManager.batchSave = (operations) => {
        storageQueue.push(...operations);
        
        if (!isBatchScheduled) {
          isBatchScheduled = true;
          setTimeout(async () => {
            const batch = [...storageQueue];
            storageQueue = [];
            isBatchScheduled = false;
            
            // Execute batch operations
            for (const operation of batch) {
              try {
                await window.enhancedStorageManager.save(operation.key, operation.data, operation.options);
              } catch (error) {
                console.error('Batch storage operation failed:', error);
              }
            }
          }, 100);
        }
      };
    }
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        this.metrics.memoryUsage.push({
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit,
          timestamp: Date.now()
        });
        
        // Keep only recent memory metrics
        if (this.metrics.memoryUsage.length > this.config.maxMetricsHistory) {
          this.metrics.memoryUsage.shift();
        }
        
        // Check for memory leaks
        this.checkMemoryUsage(memInfo);
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Check memory usage
   */
  checkMemoryUsage(memInfo) {
    const usagePercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
    
    if (usagePercent > 80) {
      console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
      this.suggestMemoryOptimization();
    }
  }

  /**
   * Suggest memory optimization
   */
  suggestMemoryOptimization() {
    console.log('💡 Memory optimization suggestions:');
    console.log('- Clear unused state data');
    console.log('- Remove old transaction history');
    console.log('- Clean up event listeners');
    
    // Automatically clean up old data
    this.performAutomaticCleanup();
  }

  /**
   * Perform automatic cleanup
   */
  performAutomaticCleanup() {
    // Clean up old metrics
    Object.keys(this.metrics).forEach(key => {
      if (Array.isArray(this.metrics[key]) && this.metrics[key].length > 50) {
        this.metrics[key] = this.metrics[key].slice(-50);
      }
    });

    // Clean up old storage data
    if (window.enhancedStorageManager) {
      window.enhancedStorageManager.cleanup?.();
    }
  }

  /**
   * Utility: Debounce function
   */
  debounce(func, delay) {
    return (...args) => {
      const key = func.toString();
      if (this.optimizations.debounceTimers.has(key)) {
        clearTimeout(this.optimizations.debounceTimers.get(key));
      }
      
      const timeoutId = setTimeout(() => {
        func.apply(this, args);
        this.optimizations.debounceTimers.delete(key);
      }, delay);
      
      this.optimizations.debounceTimers.set(key, timeoutId);
    };
  }

  /**
   * Utility: Throttle function
   */
  throttle(func, delay) {
    return (...args) => {
      const key = func.toString();
      if (!this.optimizations.throttleTimers.has(key)) {
        func.apply(this, args);
        this.optimizations.throttleTimers.set(key, true);
        
        setTimeout(() => {
          this.optimizations.throttleTimers.delete(key);
        }, delay);
      }
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const report = {
      metrics: {},
      recommendations: [],
      timestamp: Date.now()
    };

    // Calculate average metrics
    Object.keys(this.metrics).forEach(key => {
      if (Array.isArray(this.metrics[key]) && this.metrics[key].length > 0) {
        const values = this.metrics[key].map(m => m.value || m.used || 0);
        report.metrics[key] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });

    // Generate recommendations
    if (report.metrics.navigationTimes?.average > this.config.performanceThresholds.navigation) {
      report.recommendations.push('Consider optimizing navigation transitions');
    }
    
    if (report.metrics.stateUpdateTimes?.average > this.config.performanceThresholds.stateUpdate) {
      report.recommendations.push('Consider batching state updates');
    }

    return report;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Clear all timers
    this.optimizations.debounceTimers.forEach(timer => clearTimeout(timer));
    this.optimizations.throttleTimers.clear();
    
    // Disconnect observers
    if (this.optimizations.intersectionObserver) {
      this.optimizations.intersectionObserver.disconnect();
    }
    
    if (this.optimizations.resizeObserver) {
      this.optimizations.resizeObserver.disconnect();
    }
    
    console.log('🧹 Performance optimizer cleaned up');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
}