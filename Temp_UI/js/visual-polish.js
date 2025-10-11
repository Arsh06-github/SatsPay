/**
 * Visual Polish Enhancement System for SatsPay Application
 * Adds micro-interactions, smooth animations, and visual feedback
 */

class VisualPolishSystem {
  constructor() {
    this.animations = new Map();
    this.observers = new Map();
    this.config = {
      animationDuration: 300,
      easeFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      staggerDelay: 50,
      parallaxStrength: 0.5
    };
  }

  /**
   * Initialize visual polish system
   */
  init() {
    console.log('✨ Initializing Visual Polish System...');
    
    // Add micro-interactions
    this.addMicroInteractions();
    
    // Enhance button interactions
    this.enhanceButtonInteractions();
    
    // Add loading animations
    this.addLoadingAnimations();
    
    // Enhance form interactions
    this.enhanceFormInteractions();
    
    // Add scroll animations
    this.addScrollAnimations();
    
    // Add hover effects
    this.addHoverEffects();
    
    // Add focus indicators
    this.addFocusIndicators();
    
    // Add transition effects
    this.addTransitionEffects();
    
    console.log('✅ Visual Polish System initialized');
  }

  /**
   * Add micro-interactions
   */
  addMicroInteractions() {
    // Ripple effect for buttons
    this.addRippleEffect();
    
    // Magnetic effect for interactive elements
    this.addMagneticEffect();
    
    // Bounce effect for success actions
    this.addBounceEffect();
    
    // Shake effect for errors
    this.addShakeEffect();
  }

  /**
   * Add ripple effect
   */
  addRippleEffect() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('.btn, .ripple');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
      `;

      // Ensure target has relative positioning
      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      target.style.overflow = 'hidden';

      target.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });

    // Add ripple animation CSS
    this.addCSS(`
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `);
  }

  /**
   * Add magnetic effect
   */
  addMagneticEffect() {
    const magneticElements = document.querySelectorAll('.btn-primary, .wallet-connect-btn, .faucet-btn');
    
    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        
        const strength = 0.3;
        const moveX = x * strength;
        const moveY = y * strength;
        
        element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  /**
   * Add bounce effect
   */
  addBounceEffect() {
    window.triggerBounceEffect = (element) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      
      if (element) {
        element.style.animation = 'bounce-effect 0.6s ease-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 600);
      }
    };

    this.addCSS(`
      @keyframes bounce-effect {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0, 0, 0);
        }
        40%, 43% {
          transform: translate3d(0, -15px, 0);
        }
        70% {
          transform: translate3d(0, -7px, 0);
        }
        90% {
          transform: translate3d(0, -2px, 0);
        }
      }
    `);
  }

  /**
   * Add shake effect
   */
  addShakeEffect() {
    window.triggerShakeEffect = (element) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      
      if (element) {
        element.style.animation = 'shake-effect 0.5s ease-in-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 500);
      }
    };

    this.addCSS(`
      @keyframes shake-effect {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `);
  }

  /**
   * Enhance button interactions
   */
  enhanceButtonInteractions() {
    const buttons = document.querySelectorAll('.btn, button');
    
    buttons.forEach(button => {
      // Add loading state capability
      button.setLoading = (loading) => {
        if (loading) {
          button.classList.add('loading');
          button.disabled = true;
          const originalText = button.textContent;
          button.dataset.originalText = originalText;
          button.innerHTML = `
            <span class="loading-spinner"></span>
            <span class="loading-text">${originalText}</span>
          `;
        } else {
          button.classList.remove('loading');
          button.disabled = false;
          if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
          }
        }
      };

      // Add success state
      button.setSuccess = (duration = 2000) => {
        const originalText = button.textContent;
        button.classList.add('success');
        button.innerHTML = `
          <span class="success-icon">✓</span>
          <span class="success-text">Success!</span>
        `;
        
        setTimeout(() => {
          button.classList.remove('success');
          button.textContent = originalText;
        }, duration);
      };

      // Add error state
      button.setError = (duration = 2000) => {
        const originalText = button.textContent;
        button.classList.add('error');
        button.innerHTML = `
          <span class="error-icon">✗</span>
          <span class="error-text">Error</span>
        `;
        
        setTimeout(() => {
          button.classList.remove('error');
          button.textContent = originalText;
          window.triggerShakeEffect(button);
        }, duration);
      };
    });

    // Add button state CSS
    this.addCSS(`
      .btn.loading {
        pointer-events: none;
        opacity: 0.8;
      }
      
      .btn.loading .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }
      
      .btn.success {
        background: var(--color-success) !important;
        color: white !important;
      }
      
      .btn.error {
        background: var(--color-error) !important;
        color: white !important;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `);
  }

  /**
   * Add loading animations
   */
  addLoadingAnimations() {
    // Skeleton loading for cards
    this.addSkeletonLoading();
    
    // Progressive loading for lists
    this.addProgressiveLoading();
    
    // Shimmer effect for placeholders
    this.addShimmerEffect();
  }

  /**
   * Add skeleton loading
   */
  addSkeletonLoading() {
    window.showSkeletonLoading = (container) => {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      
      if (container) {
        container.classList.add('skeleton-loading');
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-placeholder';
        skeleton.innerHTML = `
          <div class="skeleton-line skeleton-line-title"></div>
          <div class="skeleton-line skeleton-line-text"></div>
          <div class="skeleton-line skeleton-line-text short"></div>
        `;
        container.appendChild(skeleton);
      }
    };

    window.hideSkeletonLoading = (container) => {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      
      if (container) {
        container.classList.remove('skeleton-loading');
        const skeleton = container.querySelector('.skeleton-placeholder');
        if (skeleton) {
          skeleton.remove();
        }
      }
    };

    this.addCSS(`
      .skeleton-loading {
        position: relative;
        overflow: hidden;
      }
      
      .skeleton-placeholder {
        padding: 20px;
      }
      
      .skeleton-line {
        height: 16px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 12px;
      }
      
      .skeleton-line-title {
        height: 24px;
        width: 60%;
      }
      
      .skeleton-line-text {
        width: 100%;
      }
      
      .skeleton-line-text.short {
        width: 40%;
      }
      
      @keyframes skeleton-loading {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `);
  }

  /**
   * Add progressive loading
   */
  addProgressiveLoading() {
    window.showProgressiveLoading = (items) => {
      items.forEach((item, index) => {
        if (typeof item === 'string') {
          item = document.querySelector(item);
        }
        
        if (item) {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, index * this.config.staggerDelay);
        }
      });
    };
  }

  /**
   * Add shimmer effect
   */
  addShimmerEffect() {
    const shimmerElements = document.querySelectorAll('.shimmer');
    
    shimmerElements.forEach(element => {
      element.style.background = `
        linear-gradient(90deg, 
          rgba(255, 255, 255, 0) 0%, 
          rgba(255, 255, 255, 0.2) 50%, 
          rgba(255, 255, 255, 0) 100%
        )
      `;
      element.style.backgroundSize = '200% 100%';
      element.style.animation = 'shimmer 2s infinite';
    });

    this.addCSS(`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `);
  }

  /**
   * Enhance form interactions
   */
  enhanceFormInteractions() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
      // Add floating label effect
      this.addFloatingLabel(input);
      
      // Add input validation animations
      this.addInputValidationAnimations(input);
      
      // Add focus ring enhancement
      this.addFocusRingEnhancement(input);
    });
  }

  /**
   * Add floating label effect
   */
  addFloatingLabel(input) {
    const formGroup = input.closest('.form-group');
    const label = formGroup?.querySelector('.form-label');
    
    if (label && formGroup) {
      formGroup.classList.add('floating-label');
      
      const checkFloat = () => {
        if (input.value || input === document.activeElement) {
          label.classList.add('floating');
        } else {
          label.classList.remove('floating');
        }
      };
      
      input.addEventListener('focus', checkFloat);
      input.addEventListener('blur', checkFloat);
      input.addEventListener('input', checkFloat);
      
      // Initial check
      checkFloat();
    }
  }

  /**
   * Add input validation animations
   */
  addInputValidationAnimations(input) {
    const originalClassList = input.classList.toString();
    
    // Override the error class addition
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (input.classList.contains('error') && !originalClassList.includes('error')) {
            window.triggerShakeEffect(input);
          } else if (input.classList.contains('valid') && !originalClassList.includes('valid')) {
            this.addSuccessGlow(input);
          }
        }
      });
    });
    
    observer.observe(input, { attributes: true });
  }

  /**
   * Add success glow effect
   */
  addSuccessGlow(element) {
    element.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.3)';
    element.style.transition = 'box-shadow 0.3s ease';
    
    setTimeout(() => {
      element.style.boxShadow = '';
    }, 1000);
  }

  /**
   * Add scroll animations
   */
  addScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements with animation classes
      const animatedElements = document.querySelectorAll('.floating, .floating-delayed, .card-hover-lift');
      animatedElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
      });

      this.observers.set('scroll', observer);
    }

    this.addCSS(`
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
    `);
  }

  /**
   * Add hover effects
   */
  addHoverEffects() {
    // Enhanced card hover effects
    const cards = document.querySelectorAll('.glass-card, .wallet-item, .transaction-item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });

    // Glow effect for important buttons
    const glowButtons = document.querySelectorAll('.btn-primary, .faucet-btn');
    
    glowButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow = '0 0 20px rgba(30, 58, 138, 0.5)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.boxShadow = '';
      });
    });
  }

  /**
   * Add focus indicators
   */
  addFocusIndicators() {
    // Enhanced focus rings
    const focusableElements = document.querySelectorAll('button, input, select, textarea, [tabindex]');
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-enhanced');
      });
      
      element.addEventListener('blur', () => {
        element.classList.remove('focus-enhanced');
      });
    });

    this.addCSS(`
      .focus-enhanced {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        transform: scale(1.02);
        transition: all 0.2s ease;
      }
    `);
  }

  /**
   * Add transition effects
   */
  addTransitionEffects() {
    // Page transition effects
    this.addPageTransitions();
    
    // Modal transition effects
    this.addModalTransitions();
    
    // Toast transition effects
    this.addToastTransitions();
  }

  /**
   * Add page transitions
   */
  addPageTransitions() {
    if (window.NavigationManager) {
      const originalNavigateTo = window.NavigationManager.navigateTo;
      
      window.NavigationManager.navigateTo = async function(section, skipAnimation) {
        // Add page transition effect
        const currentSection = document.querySelector('.section:not(.hidden)');
        const targetSection = document.getElementById(`${section}-section`);
        
        if (currentSection && targetSection && !skipAnimation) {
          // Fade out current section
          currentSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          currentSection.style.opacity = '0';
          currentSection.style.transform = 'translateX(-20px)';
          
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Call original method
          const result = await originalNavigateTo.call(this, section, true);
          
          // Fade in target section
          targetSection.style.opacity = '0';
          targetSection.style.transform = 'translateX(20px)';
          targetSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          
          requestAnimationFrame(() => {
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateX(0)';
          });
          
          return result;
        } else {
          return await originalNavigateTo.call(this, section, skipAnimation);
        }
      };
    }
  }

  /**
   * Add modal transitions
   */
  addModalTransitions() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const content = modal.querySelector('.modal-content');
      
      // Override show/hide methods if they exist
      modal.show = function() {
        this.classList.remove('hidden');
        this.style.opacity = '0';
        content.style.transform = 'scale(0.9) translateY(-20px)';
        
        requestAnimationFrame(() => {
          this.style.transition = 'opacity 0.3s ease';
          content.style.transition = 'transform 0.3s ease';
          this.style.opacity = '1';
          content.style.transform = 'scale(1) translateY(0)';
        });
      };
      
      modal.hide = function() {
        this.style.transition = 'opacity 0.3s ease';
        content.style.transition = 'transform 0.3s ease';
        this.style.opacity = '0';
        content.style.transform = 'scale(0.9) translateY(-20px)';
        
        setTimeout(() => {
          this.classList.add('hidden');
          this.style.opacity = '';
          this.style.transition = '';
          content.style.transform = '';
          content.style.transition = '';
        }, 300);
      };
    });
  }

  /**
   * Add toast transitions
   */
  addToastTransitions() {
    if (window.ToastManager) {
      const originalShow = window.ToastManager.show;
      
      window.ToastManager.show = function(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-content"><p>${message}</p></div>`;
        
        // Add enhanced styling
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        this.container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
          toast.style.transform = 'translateX(0)';
        });
        
        // Auto remove with animation
        setTimeout(() => {
          toast.style.transform = 'translateX(100%)';
          toast.style.opacity = '0';
          
          setTimeout(() => {
            if (toast.parentNode) {
              this.container.removeChild(toast);
            }
          }, 300);
        }, duration || 5000);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
          toast.style.transform = 'translateX(100%)';
          toast.style.opacity = '0';
          
          setTimeout(() => {
            if (toast.parentNode) {
              this.container.removeChild(toast);
            }
          }, 300);
        });
      };
    }
  }

  /**
   * Add CSS to document
   */
  addCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Disconnect observers
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    
    // Clear animations
    this.animations.clear();
    
    console.log('✨ Visual Polish System cleaned up');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.VisualPolishSystem = VisualPolishSystem;
}