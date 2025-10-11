/**
 * Browser Compatibility Checker for SatsPay Application
 * Ensures cross-browser compatibility and provides fallbacks
 */

class BrowserCompatibilityChecker {
  constructor() {
    this.browserInfo = this.getBrowserInfo();
    this.supportedFeatures = new Map();
    this.fallbacks = new Map();
    this.warnings = [];
  }

  /**
   * Initialize compatibility checker
   */
  init() {
    console.log('🌐 Initializing Browser Compatibility Checker...');
    console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`);
    
    // Check feature support
    this.checkFeatureSupport();
    
    // Apply polyfills
    this.applyPolyfills();
    
    // Set up fallbacks
    this.setupFallbacks();
    
    // Check for known issues
    this.checkKnownIssues();
    
    // Generate compatibility report
    this.generateCompatibilityReport();
    
    console.log('✅ Browser Compatibility Checker initialized');
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      name = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }
    // Internet Explorer
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      name = 'Internet Explorer';
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      name,
      version: parseInt(version),
      userAgent,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent)
    };
  }

  /**
   * Check feature support
   */
  checkFeatureSupport() {
    const features = {
      // Storage APIs
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      indexedDB: this.checkIndexedDB(),
      
      // Modern JavaScript features
      es6Classes: this.checkES6Classes(),
      arrowFunctions: this.checkArrowFunctions(),
      asyncAwait: this.checkAsyncAwait(),
      destructuring: this.checkDestructuring(),
      templateLiterals: this.checkTemplateLiterals(),
      
      // DOM APIs
      querySelector: this.checkQuerySelector(),
      addEventListener: this.checkAddEventListener(),
      classList: this.checkClassList(),
      dataset: this.checkDataset(),
      
      // CSS features
      cssGrid: this.checkCSSGrid(),
      flexbox: this.checkFlexbox(),
      cssVariables: this.checkCSSVariables(),
      backdropFilter: this.checkBackdropFilter(),
      
      // Modern APIs
      fetch: this.checkFetch(),
      intersectionObserver: this.checkIntersectionObserver(),
      resizeObserver: this.checkResizeObserver(),
      mutationObserver: this.checkMutationObserver(),
      
      // Animation APIs
      requestAnimationFrame: this.checkRequestAnimationFrame(),
      webAnimations: this.checkWebAnimations(),
      
      // Security features
      crypto: this.checkCrypto(),
      
      // Performance APIs
      performanceNow: this.checkPerformanceNow(),
      performanceObserver: this.checkPerformanceObserver()
    };

    Object.entries(features).forEach(([feature, supported]) => {
      this.supportedFeatures.set(feature, supported);
      if (!supported) {
        console.warn(`⚠️ Feature not supported: ${feature}`);
      }
    });
  }

  /**
   * Feature detection methods
   */
  checkLocalStorage() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkSessionStorage() {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkIndexedDB() {
    return 'indexedDB' in window;
  }

  checkES6Classes() {
    try {
      eval('class Test {}');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkArrowFunctions() {
    try {
      eval('() => {}');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkAsyncAwait() {
    try {
      eval('async function test() { await Promise.resolve(); }');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkDestructuring() {
    try {
      eval('const {a} = {a: 1}');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkTemplateLiterals() {
    try {
      eval('`template`');
      return true;
    } catch (e) {
      return false;
    }
  }

  checkQuerySelector() {
    return 'querySelector' in document;
  }

  checkAddEventListener() {
    return 'addEventListener' in window;
  }

  checkClassList() {
    return 'classList' in document.createElement('div');
  }

  checkDataset() {
    return 'dataset' in document.createElement('div');
  }

  checkCSSGrid() {
    return CSS.supports('display', 'grid');
  }

  checkFlexbox() {
    return CSS.supports('display', 'flex');
  }

  checkCSSVariables() {
    return CSS.supports('color', 'var(--test)');
  }

  checkBackdropFilter() {
    return CSS.supports('backdrop-filter', 'blur(10px)');
  }

  checkFetch() {
    return 'fetch' in window;
  }

  checkIntersectionObserver() {
    return 'IntersectionObserver' in window;
  }

  checkResizeObserver() {
    return 'ResizeObserver' in window;
  }

  checkMutationObserver() {
    return 'MutationObserver' in window;
  }

  checkRequestAnimationFrame() {
    return 'requestAnimationFrame' in window;
  }

  checkWebAnimations() {
    return 'animate' in document.createElement('div');
  }

  checkCrypto() {
    return 'crypto' in window && 'getRandomValues' in window.crypto;
  }

  checkPerformanceNow() {
    return 'performance' in window && 'now' in performance;
  }

  checkPerformanceObserver() {
    return 'PerformanceObserver' in window;
  }

  /**
   * Apply polyfills for missing features
   */
  applyPolyfills() {
    // Polyfill for requestAnimationFrame
    if (!this.supportedFeatures.get('requestAnimationFrame')) {
      this.polyfillRequestAnimationFrame();
    }

    // Polyfill for classList
    if (!this.supportedFeatures.get('classList')) {
      this.polyfillClassList();
    }

    // Polyfill for dataset
    if (!this.supportedFeatures.get('dataset')) {
      this.polyfillDataset();
    }

    // Polyfill for fetch
    if (!this.supportedFeatures.get('fetch')) {
      this.polyfillFetch();
    }

    // Polyfill for performance.now
    if (!this.supportedFeatures.get('performanceNow')) {
      this.polyfillPerformanceNow();
    }
  }

  /**
   * Polyfill implementations
   */
  polyfillRequestAnimationFrame() {
    let lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };

    console.log('✅ Applied requestAnimationFrame polyfill');
  }

  polyfillClassList() {
    if (!('classList' in document.createElement('_'))) {
      (function(view) {
        if (!('Element' in view)) return;

        const classListProp = 'classList';
        const protoProp = 'prototype';
        const elemCtrProto = view.Element[protoProp];
        const objCtr = Object;
        const strTrim = String[protoProp].trim || function() {
          return this.replace(/^\s+|\s+$/g, '');
        };

        const DOMTokenList = function(el) {
          this.el = el;
          const classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
          for (let i = 0; i < classes.length; i++) {
            this.push(classes[i]);
          }
          this._updateClassName = function() {
            el.className = this.toString();
          };
        };

        const tokenListProto = DOMTokenList[protoProp] = [];
        const tokenListGetter = function() {
          return new DOMTokenList(this);
        };

        tokenListProto.item = function(i) {
          return this[i] || null;
        };

        tokenListProto.contains = function(token) {
          token += '';
          return this.indexOf(token) !== -1;
        };

        tokenListProto.add = function() {
          const tokens = arguments;
          let i = 0;
          const l = tokens.length;
          let token;
          let updated = false;
          do {
            token = tokens[i] + '';
            if (this.indexOf(token) === -1) {
              this.push(token);
              updated = true;
            }
          } while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };

        tokenListProto.remove = function() {
          const tokens = arguments;
          let i = 0;
          const l = tokens.length;
          let token;
          let updated = false;
          let index;
          do {
            token = tokens[i] + '';
            index = this.indexOf(token);
            while (index !== -1) {
              this.splice(index, 1);
              updated = true;
              index = this.indexOf(token);
            }
          } while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };

        tokenListProto.toggle = function(token, force) {
          token += '';

          const result = this.contains(token);
          const method = result ?
            force !== true && 'remove' :
            force !== false && 'add';

          if (method) {
            this[method](token);
          }

          if (force === true || force === false) {
            return force;
          } else {
            return !result;
          }
        };

        tokenListProto.toString = function() {
          return this.join(' ');
        };

        if (objCtr.defineProperty) {
          const defineProperty = {
            get: tokenListGetter,
            enumerable: true,
            configurable: true
          };
          try {
            objCtr.defineProperty(elemCtrProto, classListProp, defineProperty);
          } catch (ex) {
            if (ex.number === -0x7FF5EC54) {
              defineProperty.enumerable = false;
              objCtr.defineProperty(elemCtrProto, classListProp, defineProperty);
            }
          }
        } else if (objCtr[protoProp].__defineGetter__) {
          elemCtrProto.__defineGetter__(classListProp, tokenListGetter);
        }
      }(window));
    }

    console.log('✅ Applied classList polyfill');
  }

  polyfillDataset() {
    if (!document.documentElement.dataset) {
      Object.defineProperty(Element.prototype, 'dataset', {
        get: function() {
          const element = this;
          const attributes = this.attributes;
          const dataset = {};

          for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            if (attribute.name.substr(0, 5) === 'data-') {
              const key = attribute.name.substr(5).replace(/-([a-z])/g, function(match, letter) {
                return letter.toUpperCase();
              });
              dataset[key] = attribute.value;
            }
          }

          return dataset;
        }
      });
    }

    console.log('✅ Applied dataset polyfill');
  }

  polyfillFetch() {
    if (!window.fetch) {
      window.fetch = function(url, options) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const method = (options && options.method) || 'GET';
          const headers = (options && options.headers) || {};
          const body = (options && options.body) || null;

          xhr.open(method, url);

          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });

          xhr.onload = function() {
            const response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              json: function() {
                return Promise.resolve(JSON.parse(xhr.responseText));
              },
              text: function() {
                return Promise.resolve(xhr.responseText);
              }
            };
            resolve(response);
          };

          xhr.onerror = function() {
            reject(new Error('Network error'));
          };

          xhr.send(body);
        });
      };
    }

    console.log('✅ Applied fetch polyfill');
  }

  polyfillPerformanceNow() {
    if (!window.performance) {
      window.performance = {};
    }

    if (!window.performance.now) {
      const startTime = Date.now();
      window.performance.now = function() {
        return Date.now() - startTime;
      };
    }

    console.log('✅ Applied performance.now polyfill');
  }

  /**
   * Set up fallbacks for unsupported features
   */
  setupFallbacks() {
    // CSS Grid fallback
    if (!this.supportedFeatures.get('cssGrid')) {
      this.setupGridFallback();
    }

    // Backdrop filter fallback
    if (!this.supportedFeatures.get('backdropFilter')) {
      this.setupBackdropFilterFallback();
    }

    // IntersectionObserver fallback
    if (!this.supportedFeatures.get('intersectionObserver')) {
      this.setupIntersectionObserverFallback();
    }

    // CSS Variables fallback
    if (!this.supportedFeatures.get('cssVariables')) {
      this.setupCSSVariablesFallback();
    }
  }

  /**
   * Fallback implementations
   */
  setupGridFallback() {
    // Add CSS for flexbox-based grid fallback
    const style = document.createElement('style');
    style.textContent = `
      .grid-fallback {
        display: flex;
        flex-wrap: wrap;
      }
      
      .grid-fallback > * {
        flex: 1 1 300px;
        margin: 10px;
      }
    `;
    document.head.appendChild(style);

    // Convert grid containers to flexbox
    const gridElements = document.querySelectorAll('[style*="display: grid"], .grid');
    gridElements.forEach(element => {
      element.classList.add('grid-fallback');
    });

    console.log('✅ Applied CSS Grid fallback');
  }

  setupBackdropFilterFallback() {
    // Replace backdrop-filter with solid background
    const style = document.createElement('style');
    style.textContent = `
      .glass-effect,
      .glass-card {
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: none !important;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Applied backdrop-filter fallback');
  }

  setupIntersectionObserverFallback() {
    // Simple scroll-based visibility detection
    window.IntersectionObserver = function(callback, options) {
      this.callback = callback;
      this.options = options || {};
      this.elements = [];
      
      this.observe = (element) => {
        this.elements.push(element);
      };
      
      this.unobserve = (element) => {
        const index = this.elements.indexOf(element);
        if (index > -1) {
          this.elements.splice(index, 1);
        }
      };
      
      this.disconnect = () => {
        this.elements = [];
      };

      // Check visibility on scroll
      const checkVisibility = () => {
        this.elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            this.callback([{
              target: element,
              isIntersecting: true
            }]);
          }
        });
      };

      window.addEventListener('scroll', checkVisibility);
      window.addEventListener('resize', checkVisibility);
    };

    console.log('✅ Applied IntersectionObserver fallback');
  }

  setupCSSVariablesFallback() {
    // Define fallback colors
    const fallbackColors = {
      '--color-primary': '#1e3a8a',
      '--color-secondary': '#059669',
      '--color-accent': '#f59e0b',
      '--color-background': '#f8fafc',
      '--color-surface': '#ffffff',
      '--color-text-primary': '#1f2937',
      '--color-text-secondary': '#6b7280',
      '--color-success': '#10b981',
      '--color-warning': '#f97316',
      '--color-error': '#ef4444'
    };

    // Replace CSS variables with actual values
    const style = document.createElement('style');
    let css = '';
    
    Object.entries(fallbackColors).forEach(([variable, value]) => {
      css += `
        [style*="${variable}"] {
          color: ${value} !important;
        }
      `;
    });
    
    style.textContent = css;
    document.head.appendChild(style);

    console.log('✅ Applied CSS Variables fallback');
  }

  /**
   * Check for known browser issues
   */
  checkKnownIssues() {
    const issues = [];

    // Internet Explorer issues
    if (this.browserInfo.name === 'Internet Explorer') {
      issues.push({
        severity: 'high',
        message: 'Internet Explorer is not supported. Please use a modern browser.',
        recommendation: 'Upgrade to Edge, Chrome, Firefox, or Safari'
      });
    }

    // Old browser versions
    if (this.browserInfo.name === 'Chrome' && this.browserInfo.version < 60) {
      issues.push({
        severity: 'medium',
        message: 'Chrome version is outdated',
        recommendation: 'Update to Chrome 60 or later'
      });
    }

    if (this.browserInfo.name === 'Firefox' && this.browserInfo.version < 55) {
      issues.push({
        severity: 'medium',
        message: 'Firefox version is outdated',
        recommendation: 'Update to Firefox 55 or later'
      });
    }

    if (this.browserInfo.name === 'Safari' && this.browserInfo.version < 12) {
      issues.push({
        severity: 'medium',
        message: 'Safari version is outdated',
        recommendation: 'Update to Safari 12 or later'
      });
    }

    // Mobile-specific issues
    if (this.browserInfo.isMobile) {
      issues.push({
        severity: 'low',
        message: 'Mobile browser detected',
        recommendation: 'Some features may have limited functionality on mobile'
      });
    }

    // Storage issues
    if (!this.supportedFeatures.get('localStorage')) {
      issues.push({
        severity: 'high',
        message: 'Local storage not available',
        recommendation: 'Enable cookies and local storage in browser settings'
      });
    }

    this.warnings = issues;

    // Display warnings
    issues.forEach(issue => {
      const level = issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warn' : 'info';
      console[level](`⚠️ ${issue.message} - ${issue.recommendation}`);
    });
  }

  /**
   * Generate compatibility report
   */
  generateCompatibilityReport() {
    const report = {
      browser: this.browserInfo,
      supportedFeatures: Object.fromEntries(this.supportedFeatures),
      warnings: this.warnings,
      compatibility: this.calculateCompatibilityScore(),
      timestamp: Date.now()
    };

    // Store report
    if (this.supportedFeatures.get('localStorage')) {
      try {
        localStorage.setItem('browser_compatibility_report', JSON.stringify(report));
      } catch (e) {
        console.warn('Could not store compatibility report');
      }
    }

    // Log summary
    console.log(`🌐 Browser Compatibility Score: ${report.compatibility}%`);
    
    if (report.compatibility >= 90) {
      console.log('✅ Excellent browser compatibility');
    } else if (report.compatibility >= 75) {
      console.log('⚠️ Good browser compatibility with minor limitations');
    } else if (report.compatibility >= 50) {
      console.log('⚠️ Limited browser compatibility - some features may not work');
    } else {
      console.log('❌ Poor browser compatibility - consider upgrading your browser');
    }

    return report;
  }

  /**
   * Calculate compatibility score
   */
  calculateCompatibilityScore() {
    const totalFeatures = this.supportedFeatures.size;
    const supportedCount = Array.from(this.supportedFeatures.values()).filter(Boolean).length;
    
    let score = (supportedCount / totalFeatures) * 100;
    
    // Deduct points for high severity warnings
    const highSeverityWarnings = this.warnings.filter(w => w.severity === 'high').length;
    score -= highSeverityWarnings * 20;
    
    // Deduct points for medium severity warnings
    const mediumSeverityWarnings = this.warnings.filter(w => w.severity === 'medium').length;
    score -= mediumSeverityWarnings * 10;
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Get compatibility report
   */
  getCompatibilityReport() {
    return {
      browser: this.browserInfo,
      supportedFeatures: Object.fromEntries(this.supportedFeatures),
      warnings: this.warnings,
      compatibility: this.calculateCompatibilityScore()
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.BrowserCompatibilityChecker = BrowserCompatibilityChecker;
}