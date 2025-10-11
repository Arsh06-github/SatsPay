/**
 * SatsPay - Bitcoin Wallet Management Application
 * Main application entry point and core functionality
 */

// ===== DEFAULT USER DATA =====
const DefaultUser = {
  id: 'default-user',
  name: 'SatsPay User',
  email: 'user@satspay.app',
  age: 25,
  walletId: null, // Will be generated when wallet is connected
  memberSince: Date.now(),
  createdAt: Date.now(),
  lastLogin: Date.now()
};

// Make DefaultUser available globally
window.DefaultUser = DefaultUser;

// ===== APPLICATION STATE =====
// Legacy AppState object for backward compatibility
const AppState = {
  get currentUser() { return window.stateManager?.getState('currentUser') || DefaultUser; },
  set currentUser(value) { window.stateManager?.setState({ currentUser: value }); },
  
  get currentSection() { return window.stateManager?.getState('currentSection') || 'home'; },
  set currentSection(value) { window.stateManager?.setState({ currentSection: value }); },
  
  get isAuthenticated() { return window.stateManager?.getState('isAuthenticated') || true; },
  set isAuthenticated(value) { window.stateManager?.setState({ isAuthenticated: value }); },
  
  get walletConnected() { return window.stateManager?.getState('walletConnected') || false; },
  set walletConnected(value) { window.stateManager?.setState({ walletConnected: value }); },
  
  get balance() { return window.stateManager?.getState('balance') || { btc: 0, usd: 0 }; },
  set balance(value) { window.stateManager?.setState({ balance: value }); },
  
  get transactions() { return window.stateManager?.getState('transactions') || []; },
  set transactions(value) { window.stateManager?.setState({ transactions: value }); },
  
  get autopayRules() { return window.stateManager?.getState('autopayRules') || []; },
  set autopayRules(value) { window.stateManager?.setState({ autopayRules: value }); }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Format currency values
   */
  formatCurrency(amount, currency = 'BTC') {
    if (currency === 'BTC') {
      return `${amount.toFixed(8)} BTC`;
    }
    return `${amount.toFixed(2)}`;
  },

  /**
   * Format date
   */
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate PIN format (4 digits)
   */
  validatePin(pin) {
    const pinRegex = /^\d{4}$/;
    return pinRegex.test(pin);
  },

  /**
   * Hash PIN for storage (improved hash for demo)
   */
  hashPin(pin) {
    // Add salt for better security
    const salt = 'satspay_salt_2024';
    const combined = pin + salt;
    
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Additional mixing
    hash = hash ^ (hash >>> 16);
    hash = hash * 0x85ebca6b;
    hash = hash ^ (hash >>> 13);
    hash = hash * 0xc2b2ae35;
    hash = hash ^ (hash >>> 16);
    
    return Math.abs(hash).toString(36);
  },

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ===== LOCAL STORAGE MANAGER =====
// Legacy StorageManager for backward compatibility
const StorageManager = {
  /**
   * Save data to localStorage
   */
  async save(key, data) {
    try {
      if (window.enhancedStorageManager) {
        return await window.enhancedStorageManager.save(key, data);
      } else {
        // Fallback to basic localStorage
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      if (window.ToastManager) {
        ToastManager.show('Storage error occurred', 'error');
      }
      return false;
    }
  },

  /**
   * Load data from localStorage
   */
  async load(key) {
    try {
      if (window.enhancedStorageManager) {
        return await window.enhancedStorageManager.load(key);
      } else {
        // Fallback to basic localStorage
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  },

  /**
   * Remove data from localStorage
   */
  async remove(key) {
    try {
      if (window.enhancedStorageManager) {
        return await window.enhancedStorageManager.remove(key);
      } else {
        // Fallback to basic localStorage
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Clear all app data
   */
  async clearAll() {
    try {
      if (window.enhancedStorageManager) {
        return await window.enhancedStorageManager.clearAll();
      } else {
        // Fallback to basic localStorage
        const keys = ['satspay_user', 'satspay_transactions', 'satspay_autopay', 'satspay_wallet'];
        keys.forEach(key => localStorage.removeItem(key));
        return true;
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// ===== TOAST NOTIFICATION MANAGER =====
const ToastManager = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 5000) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <p>${message}</p>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
          if (toast.parentNode) {
            this.container.removeChild(toast);
          }
        }, 300);
      }
    }, duration);

    // Add click to dismiss
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        this.container.removeChild(toast);
      }
    });
  }
};

// ===== LOADING MANAGER =====
const LoadingManager = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('loading-overlay');
  },

  show(message = 'Loading...') {
    if (this.overlay) {
      const loadingText = this.overlay.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = message;
      }
      this.overlay.classList.remove('hidden');
    }
  },

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
  }
};

// ===== NAVIGATION MANAGER =====
const NavigationManager = {
  currentSection: 'home',
  previousSection: null,
  navLinks: null,
  navToggle: null,
  navMenu: null,
  sections: null,
  isTransitioning: false,

  init() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.sections = document.querySelectorAll('.section');

    this.bindEvents();
    this.updateNavigation();
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      this.restoreNavigationState();
    }, 100);
    
    console.log('NavigationManager initialized');
  },

  bindEvents() {
    // Navigation link clicks with smooth transitions
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        if (section && !this.isTransitioning) {
          Router.push(section);
        }
      });

      // Add hover effects
      link.addEventListener('mouseenter', () => {
        if (!link.classList.contains('active')) {
          link.style.transform = 'translateY(-2px)';
        }
      });

      link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('active')) {
          link.style.transform = '';
        }
      });
    });



    // Mobile menu toggle with animation
    if (this.navToggle) {
      this.navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav') && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
      // Close mobile menu on escape key
      if (e.key === 'Escape' && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
        return;
      }

      // Navigation shortcuts (Ctrl/Cmd + number)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const shortcuts = {
          '1': 'home',
          '2': 'pay', 
          '3': 'transactions',
          '4': 'autopay'
        };

        if (shortcuts[e.key] && AppState.isAuthenticated) {
          e.preventDefault();
          Router.push(shortcuts[e.key]);
          ToastManager.show(`Navigated to ${shortcuts[e.key]}`, 'info', 2000);
        }
      }

      // Arrow key navigation in mobile menu
      if (this.navMenu?.classList.contains('active')) {
        const focusableElements = this.navMenu.querySelectorAll('.nav-link:not([disabled])');
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[prevIndex].focus();
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
      if (window.innerWidth > 768 && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    }, 250));
  },

  async navigateTo(section, skipAnimation = false) {
    // Prevent navigation during transitions
    if (this.isTransitioning && !skipAnimation) {
      return false;
    }

    // Don't navigate to the same section
    if (this.currentSection === section) {
      this.closeMobileMenu();
      return true;
    }

    this.previousSection = this.currentSection;
    this.currentSection = section;

    // Update sections with smooth transition
    if (skipAnimation) {
      this.updateSectionsImmediate();
    } else {
      await this.updateSectionsWithAnimation();
    }

    this.updateNavigation();
    this.closeMobileMenu();
    this.saveNavigationState();

    // Trigger section-specific initialization
    this.initializeSection(section);

    return true;
  },

  async updateSectionsWithAnimation() {
    this.isTransitioning = true;

    const currentSectionEl = document.getElementById(`${this.previousSection}-section`);
    const targetSectionEl = document.getElementById(`${this.currentSection}-section`);

    if (!targetSectionEl) {
      this.isTransitioning = false;
      return;
    }

    try {
      // Fade out current section
      if (currentSectionEl && !currentSectionEl.classList.contains('hidden')) {
        currentSectionEl.style.opacity = '0';
        currentSectionEl.style.transform = 'translateY(-20px)';
        
        await new Promise(resolve => setTimeout(resolve, 150));
        currentSectionEl.classList.add('hidden');
      }

      // Prepare target section
      targetSectionEl.classList.remove('hidden');
      targetSectionEl.style.opacity = '0';
      targetSectionEl.style.transform = 'translateY(20px)';

      // Force reflow
      targetSectionEl.offsetHeight;

      // Fade in target section
      targetSectionEl.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
      targetSectionEl.style.opacity = '1';
      targetSectionEl.style.transform = 'translateY(0)';

      await new Promise(resolve => setTimeout(resolve, 300));

      // Clean up styles
      targetSectionEl.style.transition = '';
      targetSectionEl.style.opacity = '';
      targetSectionEl.style.transform = '';

      if (currentSectionEl) {
        currentSectionEl.style.opacity = '';
        currentSectionEl.style.transform = '';
      }

    } catch (error) {
      console.error('Navigation animation error:', error);
      this.updateSectionsImmediate();
    } finally {
      this.isTransitioning = false;
    }
  },

  updateSectionsImmediate() {
    this.sections.forEach(section => {
      section.classList.add('hidden');
      section.style.opacity = '';
      section.style.transform = '';
    });

    const targetSection = document.getElementById(`${this.currentSection}-section`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
  },

  updateNavigation() {
    // Update active states with smooth transitions
    this.navLinks.forEach(link => {
      const isActive = link.dataset.section === this.currentSection;
      
      if (isActive && !link.classList.contains('active')) {
        link.classList.add('active');
        // Add enhanced bounce animation with glass effect
        link.style.animation = 'microBounce 0.6s ease-out';
        link.classList.add('neon-primary');
        setTimeout(() => {
          link.style.animation = '';
          link.classList.remove('neon-primary');
        }, 600);
      } else if (!isActive) {
        link.classList.remove('active');
      }
    });

    // Always show navigation header
    const header = document.querySelector('.header');
    if (header) {
      header.style.display = 'block';
      header.style.opacity = '1';
    }
  },

  toggleMobileMenu() {
    if (!this.navMenu || !this.navToggle) return;

    const isActive = this.navMenu.classList.contains('active');
    
    if (isActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    if (!this.navMenu || !this.navToggle) return;

    this.navMenu.classList.add('active');
    this.navToggle.classList.add('active');
    
    // Add aria attributes for accessibility
    this.navToggle.setAttribute('aria-expanded', 'true');
    this.navMenu.setAttribute('aria-hidden', 'false');

    // Focus first menu item
    const firstLink = this.navMenu.querySelector('.nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }

    // Prevent body scroll on mobile
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
  },

  closeMobileMenu() {
    if (!this.navMenu || !this.navToggle) return;

    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
    
    // Update aria attributes
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';
  },



  saveNavigationState() {
    // Save navigation state for all users (no authentication check needed)
    StorageManager.save('satspay_navigation', {
      currentSection: this.currentSection,
      timestamp: Date.now()
    });
  },

  async restoreNavigationState() {
    try {
      const savedState = await StorageManager.load('satspay_navigation');
      
      // Always restore saved state if available and recent (no authentication check needed)
      if (savedState) {
        // Only restore if saved within last hour
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - savedState.timestamp < oneHour) {
          // Let Router handle the navigation
          Router.replace(savedState.currentSection);
          return;
        }
      }

      // Default to 'home' section for all users (no authentication required)
      Router.replace('home');
    } catch (error) {
      console.error('Error restoring navigation state:', error);
      // Fallback to home section
      Router.replace('home');
    }
  },

  initializeSection(section) {
    // Section-specific initialization logic
    switch (section) {
      case 'home':
        // Initialize home dashboard and user profile
        if (typeof UserProfileManager !== 'undefined') {
          UserProfileManager.refreshProfile();
        }
        // Initialize wallet connection interface
        if (typeof WalletConnectionManager !== 'undefined') {
          WalletConnectionManager.refreshWalletDisplay();
        }
        // Initialize local faucet
        if (typeof LocalFaucetManager !== 'undefined') {
          LocalFaucetManager.refreshFaucetDisplay();
        }
        break;
      case 'pay':
        // Initialize payment interface
        if (typeof PaymentManager !== 'undefined') {
          PaymentManager.refreshPaymentInterface();
        }
        break;
      case 'transactions':
        // Initialize transaction history
        if (typeof TransactionManager !== 'undefined') {
          TransactionManager.refreshDisplay();
        }
        break;
      case 'autopay':
        // Initialize autopay interface
        if (typeof AutopayManager !== 'undefined') {
          AutopayManager.refreshAutopayInterface();
        }
        break;
    }
  },

  // Public method to get current section
  getCurrentSection() {
    return this.currentSection;
  },

  // Public method to check if navigation is available
  isNavigationReady() {
    return !this.isTransitioning;
  }
};

// ===== FORM VALIDATION MANAGER =====
const FormValidator = {
  /**
   * Validate form field
   */
  validateField(field, rules = {}) {
    const value = field.value.trim();
    const errors = [];

    // Required validation
    if (rules.required && !value) {
      errors.push(`${this.getFieldLabel(field)} is required`);
    }

    // Email validation
    if (rules.email && value && !Utils.validateEmail(value)) {
      errors.push('Please enter a valid email address');
    }

    // PIN validation
    if (rules.pin && value && !Utils.validatePin(value)) {
      errors.push('PIN must be exactly 4 digits');
    }

    // Age validation
    if (rules.age && value) {
      const age = parseInt(value);
      if (isNaN(age) || age < 18) {
        errors.push('You must be at least 18 years old');
      }
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`);
    }

    return errors;
  },

  /**
   * Get field label for error messages
   */
  getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('.form-label');
    return label ? label.textContent : field.name || 'Field';
  },

  /**
   * Display field errors
   */
  displayFieldErrors(field, errors) {
    const errorElement = field.closest('.form-group')?.querySelector('.form-error');
    if (errorElement) {
      errorElement.textContent = errors.length > 0 ? errors[0] : '';
    }

    // Update field styling
    field.classList.remove('error', 'valid');
    if (errors.length > 0) {
      field.classList.add('error');
    } else if (field.value.trim()) {
      field.classList.add('valid');
    }
  },

  /**
   * Clear all form errors
   */
  clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.form-error');
    errorElements.forEach(element => {
      element.textContent = '';
    });

    const fields = form.querySelectorAll('.form-input');
    fields.forEach(field => {
      field.classList.remove('error');
    });
  }
};

// ===== ROUTER MANAGER =====
const Router = {
  currentRoute: 'home',
  routes: ['home', 'pay', 'transactions', 'autopay'],
  
  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const route = event.state?.route || this.getRouteFromHash() || 'home';
      this.navigateToRoute(route, false); // Don't push to history
    });
    
    // Handle initial route - always start at home since authentication is removed
    const initialRoute = this.getRouteFromHash() || 'home';
    this.replace(initialRoute);
    
    console.log('Router initialized');
  },
  
  push(route) {
    if (!this.isValidRoute(route)) {
      console.warn(`Invalid route: ${route}`);
      return false;
    }
    
    // Update browser history
    const url = route === 'home' ? '/' : `/#${route}`;
    history.pushState({ route }, '', url);
    
    return this.navigateToRoute(route, false);
  },
  
  replace(route) {
    if (!this.isValidRoute(route)) {
      console.warn(`Invalid route: ${route}`);
      return false;
    }
    
    // Replace current history entry
    const url = route === 'home' ? '/' : `/#${route}`;
    history.replaceState({ route }, '', url);
    
    return this.navigateToRoute(route, false);
  },
  
  async navigateToRoute(route, updateHistory = true) {
    if (this.currentRoute === route) {
      return true;
    }
    
    // Use NavigationManager for actual navigation
    const success = await NavigationManager.navigateTo(route, false);
    
    if (success) {
      this.currentRoute = route;
      
      if (updateHistory) {
        const url = route === 'home' ? '/' : `/#${route}`;
        history.pushState({ route }, '', url);
      }
    }
    
    return success;
  },
  
  isValidRoute(route) {
    return this.routes.includes(route);
  },
  
  getRouteFromHash() {
    const hash = window.location.hash.slice(1); // Remove #
    return this.isValidRoute(hash) ? hash : null;
  },
  
  getCurrentRoute() {
    return this.currentRoute;
  }
};

// ===== APPLICATION INITIALIZATION =====
const App = {
  init() {
    try {
      // Initialize core managers
      ToastManager.init();
      LoadingManager.init();
      NavigationManager.init();
      Router.init();
      
      console.log('SatsPay application initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize SatsPay application:', error);
      
      // Show error message to user
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
            <p style="color: #6b7280; margin-bottom: 24px;">Sorry, there was an error loading the application. Please refresh the page to try again.</p>
            <button onclick="window.location.reload()" style="background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
};

// ===== APPLICATION STARTUP =====
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    Utils,
    StorageManager,
    ToastManager,
    LoadingManager,
    NavigationManager,
    FormValidator,
    Router,
    App
  };
}