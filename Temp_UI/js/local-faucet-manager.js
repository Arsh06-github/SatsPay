/**
 * Local Faucet Manager
 * Handles Bitcoin faucet functionality for testing
 */

const LocalFaucetManager = {
  faucetAmount: 0.012, // BTC per claim
  cooldownTime: 30000, // 30 seconds cooldown
  lastClaimTime: 0,
  usageCount: 0,
  totalReceived: 0,

  init() {
    this.bindEvents();
    this.loadFaucetData();
    this.refreshFaucetDisplay();
    console.log('LocalFaucetManager initialized');
  },

  bindEvents() {
    const faucetBtn = document.getElementById('faucet-btn');
    if (faucetBtn) {
      faucetBtn.addEventListener('click', () => this.claimBitcoin());
    }
  },

  async loadFaucetData() {
    try {
      const faucetData = await StorageManager.load('satspay_faucet');
      if (faucetData) {
        this.usageCount = faucetData.usageCount || 0;
        this.totalReceived = faucetData.totalReceived || 0;
        this.lastClaimTime = faucetData.lastClaimTime || 0;
      }
    } catch (error) {
      console.error('Error loading faucet data:', error);
    }
  },

  async saveFaucetData() {
    try {
      await StorageManager.save('satspay_faucet', {
        usageCount: this.usageCount,
        totalReceived: this.totalReceived,
        lastClaimTime: this.lastClaimTime
      });
    } catch (error) {
      console.error('Error saving faucet data:', error);
    }
  },

  async claimBitcoin() {
    // Check if wallet is connected
    if (!WalletConnectionManager.isWalletConnected()) {
      ToastManager.show('Please connect a wallet first', 'warning');
      return;
    }

    // Check cooldown
    const now = Date.now();
    const timeSinceLastClaim = now - this.lastClaimTime;
    
    if (timeSinceLastClaim < this.cooldownTime) {
      const remainingTime = Math.ceil((this.cooldownTime - timeSinceLastClaim) / 1000);
      ToastManager.show(`Please wait ${remainingTime} seconds before claiming again`, 'warning');
      return;
    }

    try {
      LoadingManager.show('Claiming Bitcoin...');

      // Simulate faucet delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update faucet stats
      this.usageCount++;
      this.totalReceived += this.faucetAmount;
      this.lastClaimTime = now;

      // Update wallet balance
      const currentWallet = WalletConnectionManager.getConnectedWallet();
      if (currentWallet && currentWallet.balance) {
        const newBalance = {
          btc: currentWallet.balance.btc + this.faucetAmount,
          usd: (currentWallet.balance.btc + this.faucetAmount) * 45000 // Approximate BTC to USD
        };

        await WalletConnectionManager.updateBalance(newBalance);
      }

      // Create faucet transaction record
      const transaction = {
        id: Utils.generateId(),
        type: 'faucet',
        amount: this.faucetAmount,
        recipient: currentWallet.address,
        sender: 'Bitcoin Faucet',
        status: 'completed',
        timestamp: now,
        description: 'Bitcoin Faucet Claim'
      };

      // Save transaction
      if (window.TransactionManager) {
        await TransactionManager.addTransaction(transaction);
      }

      // Save faucet data
      await this.saveFaucetData();

      // Update displays
      this.refreshFaucetDisplay();
      
      LoadingManager.hide();
      ToastManager.show(`Successfully claimed ${this.faucetAmount} BTC!`, 'success');

    } catch (error) {
      console.error('Error claiming Bitcoin:', error);
      LoadingManager.hide();
      ToastManager.show('Failed to claim Bitcoin', 'error');
    }
  },

  refreshFaucetDisplay() {
    // Update usage count
    const usageCountEl = document.getElementById('faucet-usage-count');
    if (usageCountEl) {
      usageCountEl.textContent = this.usageCount;
    }

    // Update total received
    const totalReceivedEl = document.getElementById('faucet-total-received');
    if (totalReceivedEl) {
      totalReceivedEl.textContent = Utils.formatCurrency(this.totalReceived, 'BTC');
    }

    // Update cooldown display
    this.updateCooldownDisplay();
  },

  updateCooldownDisplay() {
    const faucetBtn = document.getElementById('faucet-btn');
    const cooldownEl = document.getElementById('faucet-cooldown');
    const timerEl = document.getElementById('cooldown-timer');

    if (!faucetBtn || !cooldownEl || !timerEl) return;

    const now = Date.now();
    const timeSinceLastClaim = now - this.lastClaimTime;
    const remainingCooldown = this.cooldownTime - timeSinceLastClaim;

    if (remainingCooldown > 0) {
      // Show cooldown
      faucetBtn.style.display = 'none';
      cooldownEl.classList.remove('hidden');
      
      const remainingSeconds = Math.ceil(remainingCooldown / 1000);
      timerEl.textContent = `${remainingSeconds}s`;

      // Update timer every second
      setTimeout(() => this.updateCooldownDisplay(), 1000);
    } else {
      // Show faucet button
      faucetBtn.style.display = 'flex';
      cooldownEl.classList.add('hidden');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LocalFaucetManager.init();
});

// Export for use in other modules
window.LocalFaucetManager = LocalFaucetManager;