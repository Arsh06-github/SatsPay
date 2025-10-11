/**
 * Payment Manager
 * Handles Bitcoin payment functionality
 */

const PaymentManager = {
  currentBalance: { btc: 0, usd: 0 },

  init() {
    this.bindEvents();
    this.refreshPaymentInterface();
    console.log('PaymentManager initialized');
  },

  bindEvents() {
    // Go to home button
    const goHomeBtn = document.getElementById('go-to-home-btn');
    if (goHomeBtn) {
      goHomeBtn.addEventListener('click', () => {
        Router.push('home');
      });
    }

    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
    }

    // Real-time validation
    const recipientInput = document.getElementById('payment-recipient');
    const amountInput = document.getElementById('payment-amount');

    if (recipientInput) {
      recipientInput.addEventListener('input', () => this.validateRecipient());
    }

    if (amountInput) {
      amountInput.addEventListener('input', () => this.validateAmount());
    }
  },

  refreshPaymentInterface() {
    const isWalletConnected = WalletConnectionManager.isWalletConnected();
    
    // Show/hide appropriate sections
    const walletCheckSection = document.getElementById('wallet-check-section');
    const paymentInterface = document.getElementById('payment-interface');

    if (isWalletConnected) {
      if (walletCheckSection) walletCheckSection.style.display = 'none';
      if (paymentInterface) paymentInterface.classList.remove('hidden');
      
      this.updateBalanceDisplay();
    } else {
      if (walletCheckSection) walletCheckSection.style.display = 'block';
      if (paymentInterface) paymentInterface.classList.add('hidden');
    }
  },

  updateBalanceDisplay() {
    const connectedWallet = WalletConnectionManager.getConnectedWallet();
    if (!connectedWallet || !connectedWallet.balance) return;

    this.currentBalance = connectedWallet.balance;

    // Update balance display elements
    const btcBalanceEl = document.getElementById('current-btc-balance');
    const usdBalanceEl = document.getElementById('current-usd-balance');

    if (btcBalanceEl) {
      btcBalanceEl.textContent = Utils.formatCurrency(this.currentBalance.btc, 'BTC');
    }

    if (usdBalanceEl) {
      usdBalanceEl.textContent = `$${Utils.formatCurrency(this.currentBalance.usd, 'USD')}`;
    }
  },

  validateRecipient() {
    const recipientInput = document.getElementById('payment-recipient');
    const errorEl = document.getElementById('recipient-error');
    
    if (!recipientInput || !errorEl) return false;

    const recipient = recipientInput.value.trim();
    
    if (!recipient) {
      errorEl.textContent = '';
      recipientInput.classList.remove('error', 'valid');
      return false;
    }

    // Basic wallet address validation
    const isValid = this.isValidWalletAddress(recipient);
    
    if (isValid) {
      errorEl.textContent = '';
      recipientInput.classList.remove('error');
      recipientInput.classList.add('valid');
      return true;
    } else {
      errorEl.textContent = 'Please enter a valid wallet address';
      recipientInput.classList.remove('valid');
      recipientInput.classList.add('error');
      return false;
    }
  },

  validateAmount() {
    const amountInput = document.getElementById('payment-amount');
    const errorEl = document.getElementById('amount-error');
    
    if (!amountInput || !errorEl) return false;

    const amount = parseFloat(amountInput.value);
    
    if (!amount || isNaN(amount)) {
      errorEl.textContent = '';
      amountInput.classList.remove('error', 'valid');
      return false;
    }

    if (amount <= 0) {
      errorEl.textContent = 'Amount must be greater than 0';
      amountInput.classList.remove('valid');
      amountInput.classList.add('error');
      return false;
    }

    if (amount > this.currentBalance.btc) {
      errorEl.textContent = 'Insufficient balance';
      amountInput.classList.remove('valid');
      amountInput.classList.add('error');
      return false;
    }

    errorEl.textContent = '';
    amountInput.classList.remove('error');
    amountInput.classList.add('valid');
    return true;
  },

  async handlePayment(event) {
    event.preventDefault();

    // Validate form
    const isRecipientValid = this.validateRecipient();
    const isAmountValid = this.validateAmount();

    if (!isRecipientValid || !isAmountValid) {
      ToastManager.show('Please fix the form errors', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const recipient = formData.get('recipient').trim();
    const amount = parseFloat(formData.get('amount'));

    try {
      LoadingManager.show('Processing payment...');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create transaction
      const transaction = {
        id: Utils.generateId(),
        type: 'send',
        amount: amount,
        recipient: recipient,
        sender: WalletConnectionManager.getConnectedWallet().address,
        status: 'completed',
        timestamp: Date.now(),
        description: `Payment to ${recipient.substring(0, 10)}...`
      };

      // Update balance
      const newBalance = {
        btc: this.currentBalance.btc - amount,
        usd: (this.currentBalance.btc - amount) * 45000 // Approximate BTC to USD
      };

      await WalletConnectionManager.updateBalance(newBalance);

      // Save transaction
      if (window.TransactionManager) {
        await TransactionManager.addTransaction(transaction);
      }

      // Update display
      this.updateBalanceDisplay();

      // Reset form
      event.target.reset();
      this.clearValidationStates();

      LoadingManager.hide();
      ToastManager.show(`Payment of ${Utils.formatCurrency(amount, 'BTC')} sent successfully!`, 'success');

    } catch (error) {
      console.error('Error processing payment:', error);
      LoadingManager.hide();
      ToastManager.show('Payment failed. Please try again.', 'error');
    }
  },

  clearValidationStates() {
    const inputs = document.querySelectorAll('#payment-form .form-input');
    inputs.forEach(input => {
      input.classList.remove('error', 'valid');
    });

    const errors = document.querySelectorAll('#payment-form .form-error');
    errors.forEach(error => {
      error.textContent = '';
    });
  },

  isValidWalletAddress(address) {
    // Basic validation for different wallet address formats
    if (!address || address.length < 10) return false;

    // Bitcoin address patterns
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy P2PKH and P2SH
      /^bc1[a-z0-9]{39,59}$/, // Bech32 P2WPKH and P2WSH
      /^bc1p[a-z0-9]{58}$/, // Bech32m P2TR
      /^wallet_[a-z0-9]+$/ // Our custom wallet IDs
    ];

    return patterns.some(pattern => pattern.test(address));
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PaymentManager.init();
});

// Export for use in other modules
window.PaymentManager = PaymentManager;