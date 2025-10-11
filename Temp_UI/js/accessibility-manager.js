/**
 * Accessibility Manager
 * Handles keyboard navigation, screen reader support, and accessibility features
 */

const AccessibilityManager = {
  // Screen reader announcement regions
  announcements: null,
  status: null,
  
  // Focus management
  focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  lastFocusedElement: null,
  
  // Keyboard navigation
  keyboardNavigationEnabled: false,
  
  init() {
    this.announcements = document.getElementById('sr-announcements');
    this.status = document.getElementById('sr-status');
    
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupFormAccessibility();
    this.detectKeyboardNavigation();
    
    console.log('AccessibilityManager initialized');
  },
  
  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    if (!message) return;
    
    const region = priority === 'assertive' ? this.status : this.announcements;
    if (region) {
      region.textContent = message;
      
      // Clear after a delay to allow for re-announcements
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  },
  
  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Enable keyboard navigation indicator
      if (e.key === 'Tab') {
        this.enableKeyboardNavigation();
      }
      
      // Handle escape key
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }
      
      // Handle arrow keys in menus
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowKeys(e);
      }
      
      // Handle Enter and Space for buttons
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivationKeys(e);
      }
    });
    
    // Disable keyboard navigation indicator on mouse use
    document.addEventListener('mousedown', () => {
      this.disableKeyboardNavigation();
    });
  },
  
  /**
   * Enable keyboard navigation visual indicators
   */
  enableKeyboardNavigation() {
    if (!this.keyboardNavigationEnabled) {
      document.body.classList.add('keyboard-navigation');
      this.keyboardNavigationEnabled = true;
    }
  },
  
  /**
   * Disable keyboard navigation visual indicators
   */
  disableKeyboardNavigation() {
    if (this.keyboardNavigationEnabled) {
      document.body.classList.remove('keyboard-navigation');
      this.keyboardNavigationEnabled = false;
    }
  },
  
  /**
   * Handle escape key presses
   */
  handleEscapeKey(e) {
    // Close modals
    const openModal = document.querySelector('.modal:not(.hidden)');
    if (openModal) {
      e.preventDefault();
      this.closeModal(openModal);
      return;
    }
    
    // Close mobile menu
    const mobileMenu = document.getElementById('nav-menu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      e.preventDefault();
      NavigationManager.closeMobileMenu();
      return;
    }
    
    // Clear form focus
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
  },
  
  /**
   * Handle arrow key navigation
   */
  handleArrowKeys(e) {
    const activeElement = document.activeElement;
    
    // Navigation menu arrow keys
    if (activeElement && activeElement.classList.contains('nav-link')) {
      e.preventDefault();
      this.navigateMenu(e.key, activeElement);
      return;
    }
    
    // Form navigation
    if (activeElement && activeElement.tagName === 'INPUT') {
      // Allow default behavior for inputs
      return;
    }
    
    // List navigation (transactions, wallets, etc.)
    const listContainer = activeElement?.closest('[role="list"], .wallet-list, .transaction-list');
    if (listContainer) {
      e.preventDefault();
      this.navigateList(e.key, activeElement, listContainer);
    }
  },
  
  /**
   * Navigate menu items with arrow keys
   */
  navigateMenu(key, currentElement) {
    const menuItems = Array.from(document.querySelectorAll('.nav-link'));
    const currentIndex = menuItems.indexOf(currentElement);
    
    let nextIndex;
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % menuItems.length;
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      nextIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
    }
    
    if (nextIndex !== undefined && menuItems[nextIndex]) {
      menuItems[nextIndex].focus();
    }
  },
  
  /**
   * Navigate list items with arrow keys
   */
  navigateList(key, currentElement, listContainer) {
    const listItems = Array.from(listContainer.querySelectorAll('[tabindex], button, [href]'));
    const currentIndex = listItems.indexOf(currentElement);
    
    let nextIndex;
    if (key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % listItems.length;
    } else if (key === 'ArrowUp') {
      nextIndex = currentIndex <= 0 ? listItems.length - 1 : currentIndex - 1;
    }
    
    if (nextIndex !== undefined && listItems[nextIndex]) {
      listItems[nextIndex].focus();
    }
  },
  
  /**
   * Handle Enter and Space key activation
   */
  handleActivationKeys(e) {
    const activeElement = document.activeElement;
    
    // Handle custom buttons (elements with role="button")
    if (activeElement && activeElement.getAttribute('role') === 'button') {
      e.preventDefault();
      activeElement.click();
      return;
    }
    
    // Handle links with Space key
    if (e.key === ' ' && activeElement && activeElement.tagName === 'A') {
      e.preventDefault();
      activeElement.click();
      return;
    }
  },
  
  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Track last focused element before modal opens
    document.addEventListener('focusin', (e) => {
      if (!e.target.closest('.modal')) {
        this.lastFocusedElement = e.target;
      }
    });
    
    // Focus management for dynamic content
    this.setupFocusTrap();
  },
  
  /**
   * Setup focus trap for modals
   */
  setupFocusTrap() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const modal = document.querySelector('.modal:not(.hidden)');
      if (!modal) return;
      
      const focusableElements = modal.querySelectorAll(this.focusableElements);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  },
  
  /**
   * Open modal with proper focus management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Store current focus
    this.lastFocusedElement = document.activeElement;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector(this.focusableElements);
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Announce modal opening
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
      this.announce(`${modalTitle.textContent} dialog opened`, 'assertive');
    }
  },
  
  /**
   * Close modal with proper focus restoration
   */
  closeModal(modal) {
    if (!modal) return;
    
    // Hide modal
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
    
    // Announce modal closing
    this.announce('Dialog closed', 'assertive');
  },
  
  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Announce page changes
    if (typeof NavigationManager !== 'undefined') {
      const originalNavigateTo = NavigationManager.navigateTo;
      NavigationManager.navigateTo = async function(section, skipAnimation) {
        const result = await originalNavigateTo.call(this, section, skipAnimation);
        if (result) {
          const sectionTitle = document.querySelector(`#${section}-section .section-title`);
          if (sectionTitle) {
            AccessibilityManager.announce(`Navigated to ${sectionTitle.textContent}`, 'assertive');
          }
        }
        return result;
      };
    }
    
    // Announce form validation errors
    this.setupFormErrorAnnouncements();
    
    // Announce loading states
    this.setupLoadingAnnouncements();
  },
  
  /**
   * Setup form error announcements
   */
  setupFormErrorAnnouncements() {
    // Monitor form error elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target;
          if (target.classList && target.classList.contains('form-error') && target.textContent.trim()) {
            this.announce(`Form error: ${target.textContent}`, 'assertive');
          }
        }
      });
    });
    
    // Observe all form error elements
    document.querySelectorAll('.form-error').forEach(element => {
      observer.observe(element, { childList: true, characterData: true, subtree: true });
    });
  },
  
  /**
   * Setup loading state announcements
   */
  setupLoadingAnnouncements() {
    if (typeof LoadingManager !== 'undefined') {
      const originalShow = LoadingManager.show;
      const originalHide = LoadingManager.hide;
      
      LoadingManager.show = function(message = 'Loading...') {
        originalShow.call(this, message);
        AccessibilityManager.announce(message, 'assertive');
      };
      
      LoadingManager.hide = function() {
        originalHide.call(this);
        AccessibilityManager.announce('Loading complete', 'polite');
      };
    }
  },
  
  /**
   * Setup form accessibility
   */
  setupFormAccessibility() {
    // Add live validation
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('form-input')) {
        this.validateFieldAccessibility(e.target);
      }
    });
    
    // Add form submission handling
    document.addEventListener('submit', (e) => {
      this.handleFormSubmission(e);
    });
  },
  
  /**
   * Validate field with accessibility support
   */
  validateFieldAccessibility(field) {
    const isValid = field.checkValidity();
    const errorElement = field.closest('.form-group')?.querySelector('.form-error');
    
    // Update aria-invalid
    field.setAttribute('aria-invalid', !isValid);
    
    // Update form group classes
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('has-error', 'has-success');
      if (field.value.trim()) {
        formGroup.classList.add(isValid ? 'has-success' : 'has-error');
      }
    }
  },
  
  /**
   * Handle form submission with accessibility
   */
  handleFormSubmission(e) {
    const form = e.target;
    const invalidFields = form.querySelectorAll(':invalid');
    
    if (invalidFields.length > 0) {
      e.preventDefault();
      
      // Focus first invalid field
      invalidFields[0].focus();
      
      // Announce validation errors
      const errorCount = invalidFields.length;
      this.announce(`Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please correct and try again.`, 'assertive');
      
      // Create error summary
      this.createErrorSummary(form, invalidFields);
    }
  },
  
  /**
   * Create error summary for form validation
   */
  createErrorSummary(form, invalidFields) {
    // Remove existing error summary
    const existingSummary = form.querySelector('.error-summary');
    if (existingSummary) {
      existingSummary.remove();
    }
    
    // Create new error summary
    const summary = document.createElement('div');
    summary.className = 'error-summary';
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-labelledby', 'error-summary-title');
    
    const title = document.createElement('h3');
    title.id = 'error-summary-title';
    title.textContent = 'Please correct the following errors:';
    
    const list = document.createElement('ul');
    
    invalidFields.forEach(field => {
      const label = field.closest('.form-group')?.querySelector('.form-label')?.textContent || field.name;
      const listItem = document.createElement('li');
      
      const link = document.createElement('a');
      link.href = `#${field.id}`;
      link.textContent = `${label}: ${field.validationMessage}`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        field.focus();
      });
      
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
    
    summary.appendChild(title);
    summary.appendChild(list);
    
    // Insert at beginning of form
    form.insertBefore(summary, form.firstChild);
  },
  
  /**
   * Detect if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  /**
   * Detect if user prefers high contrast
   */
  prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  /**
   * Update button loading state with accessibility
   */
  setButtonLoading(button, loading = true, loadingText = 'Loading...') {
    if (loading) {
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
    } else {
      button.setAttribute('aria-busy', 'false');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  },
  
  /**
   * Update status indicator with accessibility
   */
  updateStatusIndicator(indicator, status, label) {
    indicator.className = `status-indicator ${status}`;
    indicator.setAttribute('aria-label', label);
    
    // Update associated text
    const statusText = indicator.parentElement?.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = label;
    }
  },
  
  /**
   * Make element focusable and add to tab order
   */
  makeFocusable(element, tabIndex = 0) {
    element.setAttribute('tabindex', tabIndex);
    
    // Add keyboard activation if it's not already interactive
    if (!['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    }
  },
  
  /**
   * Remove element from tab order
   */
  makeUnfocusable(element) {
    element.setAttribute('tabindex', '-1');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AccessibilityManager.init());
} else {
  AccessibilityManager.init();
}

// Export for use in other modules
window.AccessibilityManager = AccessibilityManager;