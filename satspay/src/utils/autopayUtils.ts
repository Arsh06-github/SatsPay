import { AutopayRule } from '../types/x402';
import { Transaction } from '../types/transaction';

/**
 * Utility functions for autopay functionality
 */
export class AutopayUtils {
  /**
   * Check if a transaction is an autopay transaction
   */
  static isAutopayTransaction(transaction: Transaction): boolean {
    return transaction.status === 'autopay' || !!transaction.autopay_rule_id;
  }

  /**
   * Get autopay transactions from a list of transactions
   */
  static filterAutopayTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.filter(this.isAutopayTransaction);
  }

  /**
   * Group autopay transactions by rule ID
   */
  static groupTransactionsByRule(transactions: Transaction[]): Record<string, Transaction[]> {
    const autopayTransactions = this.filterAutopayTransactions(transactions);
    
    return autopayTransactions.reduce((groups, transaction) => {
      const ruleId = transaction.autopay_rule_id || 'unknown';
      if (!groups[ruleId]) {
        groups[ruleId] = [];
      }
      groups[ruleId].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }

  /**
   * Calculate total amount sent through autopay
   */
  static calculateTotalAutopayAmount(transactions: Transaction[]): number {
    const autopayTransactions = this.filterAutopayTransactions(transactions);
    return autopayTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((total, tx) => total + tx.amount, 0);
  }

  /**
   * Get autopay success rate
   */
  static getAutopaySuccessRate(transactions: Transaction[]): number {
    const autopayTransactions = this.filterAutopayTransactions(transactions);
    if (autopayTransactions.length === 0) return 0;
    
    const successfulTransactions = autopayTransactions.filter(tx => tx.status === 'completed');
    return (successfulTransactions.length / autopayTransactions.length) * 100;
  }

  /**
   * Format condition for display
   */
  static formatConditionForDisplay(condition: string): string {
    // Capitalize first letter and make it more readable
    const formatted = condition.charAt(0).toUpperCase() + condition.slice(1);
    
    // Replace common patterns with more readable versions
    return formatted
      .replace(/btc price/gi, 'BTC Price')
      .replace(/>/g, ' > ')
      .replace(/</g, ' < ')
      .replace(/=/g, ' = ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate autopay rule data
   */
  static validateAutopayRule(rule: Partial<AutopayRule>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.recipientWalletId || rule.recipientWalletId.trim().length === 0) {
      errors.push('Recipient wallet ID is required');
    }

    if (!rule.amount || rule.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!rule.condition || rule.condition.trim().length === 0) {
      errors.push('Condition is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a human-readable description of an autopay rule
   */
  static generateRuleDescription(rule: AutopayRule): string {
    const formattedCondition = this.formatConditionForDisplay(rule.condition);
    return `Send ${rule.amount} BTC to ${rule.recipientWalletId} when ${formattedCondition.toLowerCase()}`;
  }

  /**
   * Check if a rule should be highlighted (recently triggered, etc.)
   */
  static shouldHighlightRule(rule: AutopayRule): boolean {
    if (!rule.lastTriggered) return false;
    
    // Highlight if triggered within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(rule.lastTriggered) > oneHourAgo;
  }

  /**
   * Get time since last trigger
   */
  static getTimeSinceLastTrigger(rule: AutopayRule): string | null {
    if (!rule.lastTriggered) return null;
    
    const now = new Date();
    const lastTriggered = new Date(rule.lastTriggered);
    const diffMs = now.getTime() - lastTriggered.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Sort rules by priority (active first, then by last triggered)
   */
  static sortRulesByPriority(rules: AutopayRule[]): AutopayRule[] {
    return [...rules].sort((a, b) => {
      // Active rules first
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // Then by last triggered (most recent first)
      if (a.lastTriggered && b.lastTriggered) {
        return new Date(b.lastTriggered).getTime() - new Date(a.lastTriggered).getTime();
      }
      if (a.lastTriggered && !b.lastTriggered) return -1;
      if (!a.lastTriggered && b.lastTriggered) return 1;
      
      // Finally by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

export default AutopayUtils;