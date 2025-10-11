/**
 * Transaction Manager
 * Handles transaction history and management
 */

const TransactionManager = {
  transactions: [],
  currentFilter: 'all',
  currentSort: 'newest',

  init() {
    this.bindEvents();
    this.loadTransactions();
    this.refreshDisplay();
    console.log('TransactionManager initialized');
  },

  bindEvents() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
          this.setFilter(filter);
        }
      });
    });

    // Sort dropdown
    const sortSelect = document.getElementById('transaction-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.setSort(e.target.value);
      });
    }

    // Search input
    const searchInput = document.getElementById('transaction-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(() => {
        this.refreshDisplay();
      }, 300));
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clear-all-transactions');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllTransactions());
    }
  },

  async loadTransactions() {
    try {
      const savedTransactions = await StorageManager.load('satspay_transactions');
      this.transactions = savedTransactions || [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.transactions = [];
    }
  },

  async saveTransactions() {
    try {
      await StorageManager.save('satspay_transactions', this.transactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  async addTransaction(transaction) {
    this.transactions.unshift(transaction); // Add to beginning
    await this.saveTransactions();
    this.refreshDisplay();
  },

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update filter button states
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.refreshDisplay();
  },

  setSort(sort) {
    this.currentSort = sort;
    this.refreshDisplay();
  },

  refreshDisplay() {
    const filteredTransactions = this.getFilteredTransactions();
    const sortedTransactions = this.getSortedTransactions(filteredTransactions);
    
    this.renderTransactions(sortedTransactions);
    this.updateStats();
  },

  getFilteredTransactions() {
    const searchTerm = document.getElementById('transaction-search')?.value.toLowerCase() || '';
    
    let filtered = this.transactions;

    // Apply status filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === this.currentFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm) ||
        tx.recipient.toLowerCase().includes(searchTerm) ||
        tx.sender.toLowerCase().includes(searchTerm) ||
        tx.id.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  },

  getSortedTransactions(transactions) {
    const sorted = [...transactions];

    switch (this.currentSort) {
      case 'newest':
        return sorted.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return sorted.sort((a, b) => a.timestamp - b.timestamp);
      case 'amount-high':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount-low':
        return sorted.sort((a, b) => a.amount - b.amount);
      default:
        return sorted;
    }
  },

  renderTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="no-transactions">
          <div class="no-transactions-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path>
            </svg>
          </div>
          <h3>No transactions found</h3>
          <p>Your transaction history will appear here</p>
        </div>
      `;
      return;
    }

    const transactionHTML = transactions.map(tx => this.renderTransactionItem(tx)).join('');
    container.innerHTML = transactionHTML;
  },

  renderTransactionItem(transaction) {
    const statusClass = `status-${transaction.status}`;
    const typeIcon = this.getTypeIcon(transaction.type);
    const amountDisplay = transaction.type === 'send' ? `-${Utils.formatCurrency(transaction.amount, 'BTC')}` : `+${Utils.formatCurrency(transaction.amount, 'BTC')}`;
    const amountClass = transaction.type === 'send' ? 'amount-negative' : 'amount-positive';

    return `
      <div class="transaction-item glass-card" data-transaction-id="${transaction.id}">
        <div class="transaction-icon ${transaction.type}">
          ${typeIcon}
        </div>
        <div class="transaction-details">
          <div class="transaction-header">
            <h4 class="transaction-description">${transaction.description}</h4>
            <span class="transaction-status ${statusClass}">${transaction.status}</span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-date">${Utils.formatDate(transaction.timestamp)}</span>
            <span class="transaction-id">ID: ${transaction.id.substring(0, 8)}...</span>
          </div>
          <div class="transaction-addresses">
            <div class="address-item">
              <span class="address-label">From:</span>
              <span class="address-value">${this.truncateAddress(transaction.sender)}</span>
            </div>
            <div class="address-item">
              <span class="address-label">To:</span>
              <span class="address-value">${this.truncateAddress(transaction.recipient)}</span>
            </div>
          </div>
        </div>
        <div class="transaction-amount ${amountClass}">
          ${amountDisplay}
        </div>
      </div>
    `;
  },

  getTypeIcon(type) {
    const icons = {
      send: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7,7 17,7 17,17"></polyline>
      </svg>`,
      receive: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="17" y1="7" x2="7" y2="17"></line>
        <polyline points="17,17 7,17 7,7"></polyline>
      </svg>`,
      faucet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7 10v12"></path>
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
      </svg>`,
      autopay: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v6m0 6v6"></path>
        <path d="m15 9-3-3-3 3"></path>
        <path d="m15 15-3 3-3-3"></path>
      </svg>`
    };

    return icons[type] || icons.send;
  },

  truncateAddress(address) {
    if (!address || address.length <= 20) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
  },

  updateStats() {
    const totalTransactions = this.transactions.length;
    const completedTransactions = this.transactions.filter(tx => tx.status === 'completed').length;
    const pendingTransactions = this.transactions.filter(tx => tx.status === 'pending').length;
    const failedTransactions = this.transactions.filter(tx => tx.status === 'failed').length;

    // Update stat displays
    const totalEl = document.getElementById('total-transactions');
    const completedEl = document.getElementById('completed-transactions');
    const pendingEl = document.getElementById('pending-transactions');
    const failedEl = document.getElementById('failed-transactions');

    if (totalEl) totalEl.textContent = totalTransactions;
    if (completedEl) completedEl.textContent = completedTransactions;
    if (pendingEl) pendingEl.textContent = pendingTransactions;
    if (failedEl) failedEl.textContent = failedTransactions;
  },

  async clearAllTransactions() {
    if (this.transactions.length === 0) {
      ToastManager.show('No transactions to clear', 'info');
      return;
    }

    if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
      this.transactions = [];
      await this.saveTransactions();
      this.refreshDisplay();
      ToastManager.show('All transactions cleared', 'success');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  TransactionManager.init();
});

// Export for use in other modules
window.TransactionManager = TransactionManager;