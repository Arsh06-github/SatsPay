/**
 * Autopay Test
 * Tests the complete autopay functionality
 */

const AutopayTest = {
  init() {
    console.log('🧪 Autopay Test initialized');
    
    // Wait for autopay manager to load
    setTimeout(() => {
      this.runAutopayTests();
    }, 3000);
  },

  async runAutopayTests() {
    console.log('🧪 Running autopay functionality tests...');
    
    // Test 1: Create a test autopay rule
    await this.testCreateAutopayRule();
    
    // Test 2: Test x402 event triggering
    await this.testX402EventTriggering();
    
    // Test 3: Test balance monitoring
    await this.testBalanceMonitoring();
    
    console.log('🧪 Autopay tests completed');
  },

  async testCreateAutopayRule() {
    console.log('🧪 Testing autopay rule creation...');
    
    try {
      // Fill out the form programmatically
      const recipientInput = document.getElementById('autopay-recipient');
      const amountInput = document.getElementById('autopay-amount');
      const conditionTypeSelect = document.getElementById('autopay-condition-type');
      const x402EventInput = document.getElementById('autopay-x402-event');
      const descriptionInput = document.getElementById('autopay-description');
      
      if (recipientInput) recipientInput.value = 'bc1qtest123wallet456address789';
      if (amountInput) amountInput.value = '0.001';
      if (conditionTypeSelect) {
        conditionTypeSelect.value = 'x402';
        // Trigger change event to show x402 details
        conditionTypeSelect.dispatchEvent(new Event('change'));
      }
      
      // Wait for condition details to show
      setTimeout(() => {
        if (x402EventInput) x402EventInput.value = 'content_access';
        if (descriptionInput) descriptionInput.value = 'Test autopay rule for content access';
        
        // Submit the form
        const form = document.getElementById('autopay-form');
        if (form && window.AutopayManager) {
          window.AutopayManager.handleAutopayFormSubmit();
          console.log('✅ Test autopay rule created successfully');
        } else {
          console.log('❌ Could not create test autopay rule');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error creating test autopay rule:', error);
    }
  },

  async testX402EventTriggering() {
    console.log('🧪 Testing x402 event triggering...');
    
    // Wait a moment for the rule to be created
    setTimeout(() => {
      try {
        if (window.AutopayManager) {
          // Trigger a content_access event
          window.AutopayManager.manualTriggerX402Event('content_access');
          console.log('✅ x402 event triggered successfully');
        } else {
          console.log('❌ AutopayManager not available for x402 test');
        }
      } catch (error) {
        console.error('❌ Error triggering x402 event:', error);
      }
    }, 2000);
  },

  async testBalanceMonitoring() {
    console.log('🧪 Testing balance monitoring...');
    
    try {
      if (window.AutopayManager) {
        const currentBalance = window.AutopayManager.getCurrentBalance();
        console.log(`✅ Current balance retrieved: ${currentBalance} BTC`);
      } else {
        console.log('❌ AutopayManager not available for balance test');
      }
    } catch (error) {
      console.error('❌ Error testing balance monitoring:', error);
    }
  },

  // Manual test functions for console use
  createTestRule() {
    console.log('🧪 Creating test autopay rule...');
    
    if (!window.AutopayManager) {
      console.log('❌ AutopayManager not available');
      return;
    }

    // Create a test rule directly
    const testRule = {
      id: 'test-rule-' + Date.now(),
      recipient: 'bc1qtest123wallet456address789',
      amount: 0.001,
      condition: 'x402 content access event',
      conditionType: 'x402',
      x402Event: 'content_access',
      description: 'Test autopay rule for content access',
      createdAt: Date.now(),
      isActive: true,
      triggerCount: 0,
      lastTriggered: null
    };

    window.AutopayManager.autopayRules.push(testRule);
    window.AutopayManager.startRuleMonitoring(testRule);
    window.AutopayManager.saveAutopayRules();
    window.AutopayManager.refreshAutopayInterface();
    
    console.log('✅ Test rule created:', testRule);
  },

  triggerTestPayment() {
    console.log('🧪 Triggering test payment...');
    
    if (!window.AutopayManager) {
      console.log('❌ AutopayManager not available');
      return;
    }

    // Trigger x402 event
    window.AutopayManager.manualTriggerX402Event('content_access');
    console.log('✅ Test payment triggered');
  },

  showAutopayStats() {
    console.log('📊 Autopay Statistics:');
    
    if (!window.AutopayManager) {
      console.log('❌ AutopayManager not available');
      return;
    }

    const rules = window.AutopayManager.autopayRules;
    const activeRules = rules.filter(r => r.isActive);
    const totalTriggers = rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0);
    
    console.log(`Total Rules: ${rules.length}`);
    console.log(`Active Rules: ${activeRules.length}`);
    console.log(`Total Triggers: ${totalTriggers}`);
    console.log('Rules:', rules);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AutopayTest.init();
});

// Add console commands for manual testing
window.createTestAutopayRule = () => AutopayTest.createTestRule();
window.triggerTestPayment = () => AutopayTest.triggerTestPayment();
window.showAutopayStats = () => AutopayTest.showAutopayStats();

console.log('🧪 Autopay Test loaded. Commands: createTestAutopayRule(), triggerTestPayment(), showAutopayStats()');

// Export for use in other modules
window.AutopayTest = AutopayTest;