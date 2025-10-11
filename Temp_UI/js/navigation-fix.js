/**
 * Navigation Fix
 * Ensures proper navigation between sections
 */

const NavigationFix = {
  init() {
    console.log('🔧 Navigation Fix initialized');
    
    // Wait for DOM to be fully ready
    setTimeout(() => {
      this.ensureNavigationWorks();
      this.addNavigationDebug();
    }, 500);
  },

  ensureNavigationWorks() {
    // Ensure home section is visible by default
    const homeSection = document.getElementById('home-section');
    if (homeSection && homeSection.classList.contains('hidden')) {
      console.log('🔧 Showing home section by default');
      homeSection.classList.remove('hidden');
    }

    // Hide auth section since we're not using authentication
    const authSection = document.getElementById('auth-section');
    if (authSection && !authSection.classList.contains('hidden')) {
      console.log('🔧 Hiding auth section');
      authSection.classList.add('hidden');
    }

    // Ensure navigation links work
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      // Remove existing listeners to avoid duplicates
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // Add new listener
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        const section = newLink.dataset.section;
        console.log('🔧 Navigation clicked:', section);
        
        if (section) {
          this.navigateToSection(section);
        }
      });
    });

    console.log('🔧 Navigation ensured to work properly');
  },

  navigateToSection(targetSection) {
    console.log('🔧 Navigating to section:', targetSection);
    
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
      if (!section.classList.contains('hidden')) {
        section.classList.add('hidden');
      }
    });

    // Show target section
    const targetSectionEl = document.getElementById(`${targetSection}-section`);
    if (targetSectionEl) {
      targetSectionEl.classList.remove('hidden');
      console.log('🔧 Successfully showed section:', targetSection);
    } else {
      console.error('🔧 Target section not found:', `${targetSection}-section`);
    }

    // Update navigation active states
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.dataset.section === targetSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash
    if (targetSection === 'home') {
      history.pushState(null, '', '/');
    } else {
      history.pushState(null, '', `/#${targetSection}`);
    }

    // Initialize section-specific functionality
    this.initializeSection(targetSection);
  },

  initializeSection(section) {
    console.log('🔧 Initializing section:', section);
    
    switch (section) {
      case 'home':
        // Refresh wallet display
        if (window.WalletConnectionManager) {
          window.WalletConnectionManager.refreshWalletDisplay();
        }
        // Refresh user profile
        if (window.UserProfileManager) {
          window.UserProfileManager.refreshProfile();
        }
        // Refresh faucet
        if (window.LocalFaucetManager) {
          window.LocalFaucetManager.refreshFaucetDisplay();
        }
        break;
      case 'pay':
        // Initialize payment interface
        if (window.PaymentManager) {
          window.PaymentManager.refreshPaymentInterface();
        }
        break;
      case 'transactions':
        // Initialize transaction history
        if (window.TransactionManager) {
          window.TransactionManager.refreshDisplay();
        }
        break;
      case 'autopay':
        // Initialize autopay interface
        if (window.AutopayManager) {
          window.AutopayManager.refreshAutopayInterface();
        }
        break;
    }
  },

  addNavigationDebug() {
    // Add console commands for debugging
    window.debugNavigation = () => {
      console.log('🔧 Navigation Debug Info:');
      console.log('Current sections visibility:');
      
      const sections = ['home', 'pay', 'transactions', 'autopay', 'auth'];
      sections.forEach(section => {
        const el = document.getElementById(`${section}-section`);
        if (el) {
          console.log(`  ${section}: ${el.classList.contains('hidden') ? 'hidden' : 'visible'}`);
        } else {
          console.log(`  ${section}: not found`);
        }
      });

      console.log('Navigation links:');
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        console.log(`  ${link.dataset.section}: ${link.classList.contains('active') ? 'active' : 'inactive'}`);
      });
    };

    window.forceNavigateTo = (section) => {
      console.log('🔧 Force navigating to:', section);
      this.navigateToSection(section);
    };

    console.log('🔧 Navigation debug commands available: debugNavigation(), forceNavigateTo(section)');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NavigationFix.init();
});

// Export for use in other modules
window.NavigationFix = NavigationFix;