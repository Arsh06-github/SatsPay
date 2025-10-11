/**
 * Navigation Test
 * Simple test to verify navigation is working correctly
 */

const NavigationTest = {
  init() {
    console.log('🧪 Navigation Test initialized');
    
    // Wait for everything to load
    setTimeout(() => {
      this.runNavigationTest();
    }, 2000);
  },

  async runNavigationTest() {
    console.log('🧪 Running navigation test...');
    
    const sections = ['home', 'pay', 'transactions', 'autopay'];
    
    for (const section of sections) {
      console.log(`🧪 Testing navigation to: ${section}`);
      
      // Click the navigation link
      const navLink = document.querySelector(`[data-section="${section}"]`);
      if (navLink) {
        navLink.click();
        
        // Wait a moment for navigation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if section is visible
        const sectionEl = document.getElementById(`${section}-section`);
        if (sectionEl && !sectionEl.classList.contains('hidden')) {
          console.log(`✅ ${section} section is visible`);
        } else {
          console.log(`❌ ${section} section is not visible`);
        }
      } else {
        console.log(`❌ Navigation link for ${section} not found`);
      }
    }
    
    // Return to home
    const homeLink = document.querySelector('[data-section="home"]');
    if (homeLink) {
      homeLink.click();
    }
    
    console.log('🧪 Navigation test completed');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NavigationTest.init();
});

// Export for use in other modules
window.NavigationTest = NavigationTest;