/**
 * Autopay Manager
 * Complete frontend-only autopay system with x402 protocol support
 * Handles: wallet ID entry -> condition setup -> condition checking -> payment triggering
 */

const AutopayManager = {
  autopayRules: [],
  activeMonitors: new Map(),
  triggerCount: 0,
  
  init() {
    console.log('💰 AutopayManager initialized');
    this.bindEvents();
    this.loadAutopayRules();
    this.refreshAutopayInterface();
    this.startGlobalMonitoring();
  },

  bindEvents() {
    // Form submission
    const autopayForm = document.getElementById('autopay-form');
    if (autopayForm) {
      autopayForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAutopayFormSubmit();
      });
    }

    // Condition type change
    const conditionTypeSelect = document.getElementById('autopay-condition-type');
    if (conditionTypeSelect) {
      conditionTypeSelect.addEventListener('change', (e) => {
        this.handleConditionTypeChange(e.target.value);
      });
    }

    // Test condition button
    const testConditionBtn = document.getElementById('test-condition-btn');
    if (testConditionBtn) {
      testConditionBtn.addEventListener('click', () => {
        this.testCondition();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('autopay-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.clearForm();
      });
    }

    console.log('💰 Autopay events bound');
  },

  handleConditionTypeChange(conditionType) {
    // Hide all condition details
    const allDetails = document.querySelectorAll('.condition-details');
    allDetails.forEach(detail => detail.classList.add('hidden'));

    // Show relevant condition details
    const detailsId = `${conditionType}-condition-details`;
    const detailsElement = document.getElementById(detailsId);
    if (detailsElement) {
      detailsElement.classList.remove('hidden');
    }
  },

  async handleAutopayFormSubmit() {
    try {
      const formData = this.getFormData();
      
      // Validate form data
      const validation = this.validateAutopayForm(formData);
      if (!validation.isValid) {
        this.displayFormErrors(validation.errors);
        return;
      }

      // Create autopay rule
      const autopayRule = this.createAutopayRule(formData);
      
      // Add to rules list
      this.autopayRules.push(autopayRule);
      
      // Save to storage
      await this.saveAutopayRules();
      
      // Start monitoring for this rule
      this.startRuleMonitoring(autopayRule);
      
      // Refresh interface
      this.refreshAutopayInterface();
      
      // Clear form
      this.clearForm();
      
      // Show success message
      ToastManager.show(`Autopay rule "${autopayRule.description || 'Untitled'}" created successfully!`, 'success');
      
      console.log('💰 Autopay rule created:', autopayRule);
      
    } catch (error) {
      console.error('💰 Error creating autopay rule:', error);
      ToastManager.show('Failed to create autopay rule', 'error');
    }
  },

  getFormData() {
    return {
      recipient: document.getElementById('autopay-recipient')?.value?.trim() || '',
      amount: parseFloat(document.getElementById('autopay-amount')?.value) || 0,
      condition: document.getElementById('autopay-condition')?.value?.trim() || '',
      conditionType: document.getElementById('autopay-condition-type')?.value || '',
      interval: document.getElementById('autopay-interval')?.value || '',
      threshold: parseFloat(document.getElementById('autopay-threshold')?.value) || 0,
      x402Event: document.getElementById('autopay-x402-event')?.value?.trim() || '',
      description: document.getElementById('autopay-description')?.value?.trim() || ''
    };
  },

  validateAutopayForm(formData) {
    const errors = {};
    let isValid = true;

    // Validate recipient wallet ID
    if (!formData.recipient) {
      errors.recipient = 'Recipient wallet ID is required';
      isValid = false;
    } else if (formData.recipient.length < 10) {
      errors.recipient = 'Invalid wallet ID format';
      isValid = false;
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Payment amount must be greater than 0';
      isValid = false;
    }

    // Validate condition type
    if (!formData.conditionType) {
      errors.conditionType = 'Please select a condition type';
      isValid = false;
    }

    // Validate condition-specific fields
    switch (formData.conditionType) {
      case 'time':
        if (!formData.interval) {
          errors.interval = 'Please select a payment interval';
          isValid = false;
        }
        break;
      case 'balance':
        if (!formData.threshold || formData.threshold <= 0) {
          errors.threshold = 'Balance threshold must be greater than 0';
          isValid = false;
        }
        break;
      case 'x402':
        if (!formData.x402Event) {
          errors.x402Event = 'Please specify the x402 event type';
          isValid = false;
        }
        break;
    }

    return { isValid, errors };
  },

  displayFormErrors(errors) {
    // Clear previous errors
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.textContent = '');

    // Display new errors
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`autopay-${field}-error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
      }
    });
  },

  createAutopayRule(formData) {
    const rule = {
      id: Utils.generateId(),
      recipient: formData.recipient,
      amount: formData.amount,
      condition: formData.condition,
      conditionType: formData.conditionType,
      description: formData.description || `Payment to ${formData.recipient.substring(0, 10)}...`,
      createdAt: Date.now(),
      isActive: true,
      triggerCount: 0,
      lastTriggered: null
    };

    // Add condition-specific data
    switch (formData.conditionType) {
      case 'time':
        rule.interval = formData.interval;
        rule.nextTrigger = this.calculateNextTrigger(formData.interval);
        break;
      case 'balance':
        rule.threshold = formData.threshold;
        break;
      case 'x402':
        rule.x402Event = formData.x402Event;
        break;
    }

    return rule;
  },

  calculateNextTrigger(interval) {
    const now = Date.now();
    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };
    
    return now + (intervals[interval] || intervals.daily);
  },

  startRuleMonitoring(rule) {
    if (!rule.isActive) return;

    switch (rule.conditionType) {
      case 'time':
        this.startTimeBasedMonitoring(rule);
        break;
      case 'balance':
        this.startBalanceMonitoring(rule);
        break;
      case 'x402':
        this.startX402Monitoring(rule);
        break;
      case 'manual':
        // Manual rules don't need automatic monitoring
        break;
    }
  },

  startTimeBasedMonitoring(rule) {
    const checkInterval = 10000; // Check every 10 seconds
    
    const intervalId = setInterval(() => {
      if (!rule.isActive) {
        clearInterval(intervalId);
        this.activeMonitors.delete(rule.id);
        return;
      }

      const now = Date.now();
      if (now >= rule.nextTrigger) {
        this.triggerPayment(rule, 'Time interval reached');
        rule.nextTrigger = this.calculateNextTrigger(rule.interval);
      }
    }, checkInterval);

    this.activeMonitors.set(rule.id, intervalId);
    console.log(`💰 Started time-based monitoring for rule ${rule.id}`);
  },

  startBalanceMonitoring(rule) {
    const checkInterval = 5000; // Check every 5 seconds
    
    const intervalId = setInterval(() => {
      if (!rule.isActive) {
        clearInterval(intervalId);
        this.activeMonitors.delete(rule.id);
        return;
      }

      const currentBalance = this.getCurrentBalance();
      if (currentBalance >= rule.threshold) {
        this.triggerPayment(rule, `Balance threshold reached: ${currentBalance} BTC >= ${rule.threshold} BTC`);
      }
    }, checkInterval);

    this.activeMonitors.set(rule.id, intervalId);
    console.log(`💰 Started balance monitoring for rule ${rule.id}`);
  },

  startX402Monitoring(rule) {
    // x402 monitoring is event-driven, so we just register the rule
    console.log(`💰 Registered x402 monitoring for rule ${rule.id}, event: ${rule.x402Event}`);
  },

  getCurrentBalance() {
    // Get current balance from wallet or AppState
    if (window.WalletConnectionManager?.connectedWallet?.balance?.btc) {
      return window.WalletConnectionManager.connectedWallet.balance.btc;
    }
    if (window.AppState?.balance?.btc) {
      return window.AppState.balance.btc;
    }
    return 0.012; // Default simulated balance
  },

  async triggerPayment(rule, reason) {
    try {
      console.log(`💰 Triggering payment for rule ${rule.id}: ${reason}`);
      
      // Update rule statistics
      rule.triggerCount++;
      rule.lastTriggered = Date.now();
      this.triggerCount++;
      
      // Create payment transaction
      const transaction = {
        id: Utils.generateId(),
        type: 'autopay',
        recipient: rule.recipient,
        amount: rule.amount,
        description: `Autopay: ${rule.description}`,
        timestamp: Date.now(),
        status: 'completed',
        autopayRuleId: rule.id,
        triggerReason: reason
      };
      
      // Add to transaction history
      if (window.TransactionManager) {
        await window.TransactionManager.addTransaction(transaction);
      }
      
      // Update balance
      const currentBalance = this.getCurrentBalance();
      const newBalance = Math.max(0, currentBalance - rule.amount);
      if (window.WalletConnectionManager?.updateBalance) {
        await window.WalletConnectionManager.updateBalance({
          btc: newBalance,
          usd: newBalance * 42000 // Approximate USD value
        });
      }
      
      // Save updated rules
      await this.saveAutopayRules();
      
      // Show payment triggered message
      this.showPaymentTriggeredMessage(rule, reason, transaction);
      
      // Refresh interface
      this.refreshAutopayInterface();
      
      console.log(`💰 Payment triggered successfully:`, transaction);
      
    } catch (error) {
      console.error('💰 Error triggering payment:', error);
      ToastManager.show(`Failed to trigger payment for ${rule.description}`, 'error');
    }
  },

  showPaymentTriggeredMessage(rule, reason, transaction) {
    // Create payment triggered message
    const message = `Payment Triggered for Completion: ${rule.amount} BTC sent to ${rule.recipient.substring(0, 10)}... (${reason})`;
    
    // Show toast notification
    ToastManager.show(message, 'success', 8000);
    
    // Add to autopay messages section
    const messagesContainer = document.getElementById('autopay-messages');
    if (messagesContainer) {
      const messageElement = document.createElement('div');
      messageElement.className = 'autopay-message success';
      messageElement.innerHTML = `
        <div class="autopay-message-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        <div class="autopay-message-content">
          <div class="autopay-message-title">Payment Triggered for Completion</div>
          <div class="autopay-message-details">
            <div class="message-detail">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${rule.amount} BTC</span>
            </div>
            <div class="message-detail">
              <span class="detail-label">Recipient:</span>
              <span class="detail-value">${rule.recipient}</span>
            </div>
            <div class="message-detail">
              <span class="detail-label">Reason:</span>
              <span class="detail-value">${reason}</span>
            </div>
            <div class="message-detail">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <button class="autopay-message-close" onclick="this.parentElement.remove()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        if (messageElement.parentElement) {
          messageElement.remove();
        }
      }, 30000);
    }
  },

  testCondition() {
    const conditionType = document.getElementById('autopay-condition-type')?.value;
    const condition = document.getElementById('autopay-condition')?.value?.trim();
    
    if (!conditionType || !condition) {
      ToastManager.show('Please select a condition type and enter a condition', 'warning');
      return;
    }

    // Create a temporary rule for testing
    const testRule = {
      id: 'test',
      conditionType: conditionType,
      condition: condition,
      amount: 0.001,
      recipient: 'test_wallet_123',
      description: 'Test condition'
    };

    switch (conditionType) {
      case 'time':
        ToastManager.show('Time-based condition will be checked automatically when active', 'info');
        break;
      case 'balance':
        const threshold = parseFloat(document.getElementById('autopay-threshold')?.value) || 0;
        const currentBalance = this.getCurrentBalance();
        const willTrigger = currentBalance >= threshold;
        ToastManager.show(
          `Balance condition test: Current balance ${currentBalance} BTC ${willTrigger ? '>=' : '<'} threshold ${threshold} BTC. ${willTrigger ? 'WOULD TRIGGER' : 'Would not trigger'}`,
          willTrigger ? 'success' : 'info'
        );
        break;
      case 'x402':
        const x402Event = document.getElementById('autopay-x402-event')?.value?.trim();
        ToastManager.show(`x402 condition ready for event: "${x402Event}". Use the testing buttons below to simulate events.`, 'info');
        break;
      case 'manual':
        ToastManager.show('Manual condition - payment will only trigger when manually activated', 'info');
        break;
      default:
        ToastManager.show('Unknown condition type', 'error');
    }
  },

  clearForm() {
    const form = document.getElementById('autopay-form');
    if (form) {
      form.reset();
      
      // Clear errors
      const errorElements = form.querySelectorAll('.form-error');
      errorElements.forEach(el => el.textContent = '');
      
      // Hide condition details
      const conditionDetails = form.querySelectorAll('.condition-details');
      conditionDetails.forEach(detail => detail.classList.add('hidden'));
    }
  },

  async loadAutopayRules() {
    try {
      const savedRules = await StorageManager.load('satspay_autopay_rules');
      if (savedRules && Array.isArray(savedRules)) {
        this.autopayRules = savedRules;
        
        // Start monitoring for active rules
        this.autopayRules.forEach(rule => {
          if (rule.isActive) {
            this.startRuleMonitoring(rule);
          }
        });
        
        console.log(`💰 Loaded ${this.autopayRules.length} autopay rules`);
      }
    } catch (error) {
      console.error('💰 Error loading autopay rules:', error);
    }
  },

  async saveAutopayRules() {
    try {
      await StorageManager.save('satspay_autopay_rules', this.autopayRules);
    } catch (error) {
      console.error('💰 Error saving autopay rules:', error);
    }
  },

  refreshAutopayInterface() {
    // Show/hide sections based on actual wallet connection
    const walletCheckSection = document.getElementById('autopay-wallet-check-section');
    const autopayInterface = document.getElementById('autopay-interface');
    
    const isWalletConnected = this.isWalletConnected();
    
    if (isWalletConnected) {
      // Wallet is connected - show autopay interface
      if (walletCheckSection) {
        walletCheckSection.style.display = 'none';
      }
      if (autopayInterface) {
        autopayInterface.classList.remove('hidden');
      }
    } else {
      // Wallet is not connected - show connection prompt
      if (walletCheckSection) {
        walletCheckSection.style.display = 'block';
      }
      if (autopayInterface) {
        autopayInterface.classList.add('hidden');
      }
    }

    // Update statistics only if wallet is connected
    if (isWalletConnected) {
      this.updateAutopayStats();
      this.updateAutopayRulesList();
    }
  },

  updateAutopayStats() {
    const totalRulesEl = document.getElementById('total-autopay-rules');
    const activeRulesEl = document.getElementById('active-autopay-rules');
    const totalTriggersEl = document.getElementById('total-autopay-triggers');
    
    const activeRules = this.autopayRules.filter(rule => rule.isActive);
    const totalTriggers = this.autopayRules.reduce((sum, rule) => sum + (rule.triggerCount || 0), 0);
    
    if (totalRulesEl) totalRulesEl.textContent = this.autopayRules.length;
    if (activeRulesEl) activeRulesEl.textContent = activeRules.length;
    if (totalTriggersEl) totalTriggersEl.textContent = totalTriggers;
  },

  updateAutopayRulesList() {
    const rulesList = document.getElementById('autopay-rules-list');
    const emptyState = document.getElementById('autopay-empty-state');
    
    if (!rulesList) return;

    if (this.autopayRules.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Create rules HTML
    const rulesHTML = this.autopayRules.map(rule => this.createRuleHTML(rule)).join('');
    rulesList.innerHTML = rulesHTML;
  },

  createRuleHTML(rule) {
    const statusClass = rule.isActive ? 'active' : 'inactive';
    const statusText = rule.isActive ? 'Active' : 'Inactive';
    const nextTriggerText = rule.nextTrigger ? new Date(rule.nextTrigger).toLocaleString() : 'N/A';
    
    return `
      <div class="autopay-rule-item ${statusClass}" data-rule-id="${rule.id}">
        <div class="autopay-rule-header">
          <div class="autopay-rule-info">
            <h4 class="autopay-rule-title">${rule.description}</h4>
            <p class="autopay-rule-details">
              ${rule.amount} BTC to ${rule.recipient.substring(0, 20)}...
            </p>
          </div>
          <div class="autopay-rule-status">
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
        
        <div class="autopay-rule-body">
          <div class="autopay-rule-stats">
            <div class="stat-item">
              <span class="stat-label">Type:</span>
              <span class="stat-value">${rule.conditionType}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Triggers:</span>
              <span class="stat-value">${rule.triggerCount || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Last Triggered:</span>
              <span class="stat-value">${rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleString() : 'Never'}</span>
            </div>
            ${rule.conditionType === 'time' ? `
            <div class="stat-item">
              <span class="stat-label">Next Trigger:</span>
              <span class="stat-value">${nextTriggerText}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="autopay-rule-actions">
            <button class="btn btn-sm ${rule.isActive ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="AutopayManager.toggleRule('${rule.id}')">
              ${rule.isActive ? 'Pause' : 'Activate'}
            </button>
            ${rule.conditionType === 'manual' ? `
            <button class="btn btn-sm btn-success" onclick="AutopayManager.manualTriggerRule('${rule.id}')">
              Trigger Now
            </button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="AutopayManager.deleteRule('${rule.id}')">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleRule(ruleId) {
    const rule = this.autopayRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.isActive = !rule.isActive;
    
    if (rule.isActive) {
      this.startRuleMonitoring(rule);
      ToastManager.show(`Autopay rule "${rule.description}" activated`, 'success');
    } else {
      // Stop monitoring
      const intervalId = this.activeMonitors.get(ruleId);
      if (intervalId) {
        clearInterval(intervalId);
        this.activeMonitors.delete(ruleId);
      }
      ToastManager.show(`Autopay rule "${rule.description}" paused`, 'info');
    }

    this.saveAutopayRules();
    this.refreshAutopayInterface();
  },

  async manualTriggerRule(ruleId) {
    const rule = this.autopayRules.find(r => r.id === ruleId);
    if (!rule) return;

    await this.triggerPayment(rule, 'Manual trigger');
  },

  async deleteRule(ruleId) {
    if (!confirm('Are you sure you want to delete this autopay rule?')) return;

    // Stop monitoring
    const intervalId = this.activeMonitors.get(ruleId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeMonitors.delete(ruleId);
    }

    // Remove from rules
    this.autopayRules = this.autopayRules.filter(r => r.id !== ruleId);
    
    await this.saveAutopayRules();
    this.refreshAutopayInterface();
    
    ToastManager.show('Autopay rule deleted', 'info');
  },

  startGlobalMonitoring() {
    // Start global monitoring for all active rules
    this.autopayRules.forEach(rule => {
      if (rule.isActive) {
        this.startRuleMonitoring(rule);
      }
    });
    
    console.log('💰 Global autopay monitoring started');
  },

  // x402 Protocol Event Handlers
  handleX402Event(eventType, eventData = {}) {
    console.log(`💰 x402 event received: ${eventType}`, eventData);
    
    // Find rules that match this event type
    const matchingRules = this.autopayRules.filter(rule => 
      rule.isActive && 
      rule.conditionType === 'x402' && 
      rule.x402Event === eventType
    );
    
    // Trigger payments for matching rules
    matchingRules.forEach(rule => {
      this.triggerPayment(rule, `x402 event: ${eventType}`);
    });
    
    if (matchingRules.length > 0) {
      console.log(`💰 Triggered ${matchingRules.length} autopay rules for x402 event: ${eventType}`);
    }
  },

  // Manual x402 event triggering for testing
  manualTriggerX402Event(eventType) {
    console.log(`💰 Manually triggering x402 event: ${eventType}`);
    this.handleX402Event(eventType, { manual: true, timestamp: Date.now() });
    ToastManager.show(`x402 event "${eventType}" triggered manually`, 'info');
  },

  // Check if wallet is actually connected
  isWalletConnected() {
    // Check WalletConnectionManager first
    if (window.WalletConnectionManager && window.WalletConnectionManager.connectedWallet) {
      return true;
    }
    
    // Check AppState as fallback
    if (window.AppState && window.AppState.walletConnected) {
      return true;
    }
    
    return false;
  }
};

// Create AutopayMonitor alias for backward compatibility
window.AutopayMonitor = {
  manualTriggerX402Event: (eventType) => AutopayManager.manualTriggerX402Event(eventType)
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other managers to initialize
  setTimeout(() => {
    AutopayManager.init();
  }, 1000);
});

// Export for use in other modules
window.AutopayManager = AutopayManager;