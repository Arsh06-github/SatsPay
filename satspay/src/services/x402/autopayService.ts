import { AutopayRule, AutopayExecution } from '../../types/x402';
import { useX402Store } from '../../stores/x402Store';
import { useTransactionStore } from '../../stores/transactionStore';
import { useWalletStore } from '../../stores/walletStore';
import { useAuthStore } from '../../stores/authStore';
import { WalletService } from '../bitcoin/walletService';
import TransactionService from '../bitcoin/transactionService';
import { ConditionMonitor } from './conditionMonitor';

// Browser-compatible scheduling interface
interface ScheduledTask {
  id: string;
  interval: number;
  callback: () => void;
  intervalId?: NodeJS.Timeout;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

// Browser-compatible task scheduler
class BrowserTaskScheduler {
  static createTask(id: string, intervalMs: number, callback: () => void): ScheduledTask {
    const task: ScheduledTask = {
      id,
      interval: intervalMs,
      callback,
      isRunning: false,
      start() {
        if (!this.isRunning) {
          this.intervalId = setInterval(this.callback, this.interval);
          this.isRunning = true;
        }
      },
      stop() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = undefined;
          this.isRunning = false;
        }
      },
      destroy() {
        this.stop();
      }
    };
    return task;
  }
}

// x402 autopay service using browser-compatible scheduling
export class AutopayService {
  private static scheduledTasks = new Map<string, ScheduledTask>();
  private static isInitialized = false;

  /**
   * Initialize the autopay service and start monitoring active rules
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing AutopayService...');
    
    // Start monitoring all active autopay rules
    await this.startMonitoringActiveRules();
    
    this.isInitialized = true;
    console.log('AutopayService initialized successfully');
  }

  /**
   * Start monitoring all active autopay rules
   */
  private static async startMonitoringActiveRules(): Promise<void> {
    try {
      const x402Store = useX402Store.getState();
      const activeRules = x402Store.getActiveRules();
      
      console.log(`Starting monitoring for ${activeRules.length} active autopay rules`);
      
      for (const rule of activeRules) {
        await this.startMonitoringRule(rule);
      }
    } catch (error) {
      console.error('Error starting monitoring for active rules:', error);
    }
  }

  /**
   * Create a new autopay rule and start monitoring it
   */
  static async createAutopayRule(
    recipientWalletId: string,
    amount: number,
    condition: string
  ): Promise<string | null> {
    try {
      console.log(`Creating autopay rule: ${amount} BTC to ${recipientWalletId} when ${condition}`);
      
      // Validate inputs
      if (!recipientWalletId || amount <= 0 || !condition) {
        throw new Error('Invalid autopay rule parameters');
      }

      // Create rule in store
      const x402Store = useX402Store.getState();
      const ruleId = Date.now().toString();
      
      const rule: Omit<AutopayRule, 'id' | 'createdAt'> = {
        recipientWalletId,
        amount,
        condition,
        isActive: true
      };

      x402Store.createAutopayRule(rule);
      
      // Start monitoring the new rule
      const createdRule: AutopayRule = {
        ...rule,
        id: ruleId,
        createdAt: new Date()
      };
      
      await this.startMonitoringRule(createdRule);
      
      console.log(`Autopay rule created successfully with ID: ${ruleId}`);
      return ruleId;
    } catch (error) {
      console.error('Error creating autopay rule:', error);
      return null;
    }
  }

  /**
   * Activate an existing autopay rule
   */
  static async activateAutopayRule(ruleId: string): Promise<boolean> {
    try {
      console.log(`Activating autopay rule: ${ruleId}`);
      
      const x402Store = useX402Store.getState();
      const rule = x402Store.autopayRules.find(r => r.id === ruleId);
      
      if (!rule) {
        console.error(`Autopay rule ${ruleId} not found`);
        return false;
      }

      // Activate in store
      x402Store.activateRule(ruleId);
      
      // Start monitoring
      await this.startMonitoringRule({ ...rule, isActive: true });
      
      console.log(`Autopay rule ${ruleId} activated successfully`);
      return true;
    } catch (error) {
      console.error(`Error activating autopay rule ${ruleId}:`, error);
      return false;
    }
  }

  /**
   * Deactivate an existing autopay rule
   */
  static async deactivateAutopayRule(ruleId: string): Promise<boolean> {
    try {
      console.log(`Deactivating autopay rule: ${ruleId}`);
      
      const x402Store = useX402Store.getState();
      x402Store.deactivateRule(ruleId);
      
      // Stop monitoring
      await this.stopMonitoringRule(ruleId);
      
      console.log(`Autopay rule ${ruleId} deactivated successfully`);
      return true;
    } catch (error) {
      console.error(`Error deactivating autopay rule ${ruleId}:`, error);
      return false;
    }
  }

  /**
   * Start monitoring a specific autopay rule
   */
  private static async startMonitoringRule(rule: AutopayRule): Promise<void> {
    try {
      if (!rule.isActive) {
        console.log(`Rule ${rule.id} is not active, skipping monitoring`);
        return;
      }

      // Stop existing monitoring if any
      await this.stopMonitoringRule(rule.id);

      console.log(`Starting monitoring for rule ${rule.id}: ${rule.condition}`);
      
      // Create a task that runs every minute to check conditions
      const task = BrowserTaskScheduler.createTask(
        rule.id,
        60000, // 60 seconds
        async () => {
          try {
            await this.checkAndExecuteRule(rule);
          } catch (error) {
            console.error(`Error checking rule ${rule.id}:`, error);
          }
        }
      );

      // Store the task
      this.scheduledTasks.set(rule.id, task);
      
      // Start the task
      task.start();
      
      console.log(`Monitoring started for rule ${rule.id}`);
    } catch (error) {
      console.error(`Error starting monitoring for rule ${rule.id}:`, error);
    }
  }

  /**
   * Stop monitoring a specific autopay rule
   */
  private static async stopMonitoringRule(ruleId: string): Promise<void> {
    try {
      const task = this.scheduledTasks.get(ruleId);
      if (task) {
        task.stop();
        task.destroy();
        this.scheduledTasks.delete(ruleId);
        console.log(`Stopped monitoring for rule ${ruleId}`);
      }
    } catch (error) {
      console.error(`Error stopping monitoring for rule ${ruleId}:`, error);
    }
  }

  /**
   * Check if a rule's condition is met and execute payment if so
   */
  private static async checkAndExecuteRule(rule: AutopayRule): Promise<void> {
    try {
      // Check if condition is met
      const conditionMet = await ConditionMonitor.evaluateCondition(rule.condition);
      
      if (!conditionMet) {
        return; // Condition not met, continue monitoring
      }

      console.log(`Condition met for rule ${rule.id}, executing payment...`);
      
      // Execute the autopay
      const execution = await this.executeAutopay(rule);
      
      if (execution.success) {
        // Update last triggered time
        const x402Store = useX402Store.getState();
        x402Store.updateLastTriggered(rule.id);
        
        console.log(`Autopay executed successfully for rule ${rule.id}`);
        
        // Optionally notify user (this would be handled by UI components)
        this.notifyPaymentTriggered(rule, execution);
      } else {
        console.error(`Autopay execution failed for rule ${rule.id}:`, execution.error);
      }
    } catch (error) {
      console.error(`Error checking and executing rule ${rule.id}:`, error);
    }
  }

  /**
   * Execute an autopay transaction
   */
  private static async executeAutopay(rule: AutopayRule): Promise<AutopayExecution> {
    const execution: AutopayExecution = {
      ruleId: rule.id,
      executedAt: new Date(),
      success: false
    };

    try {
      // Get current user
      const authStore = useAuthStore.getState();
      const currentUser = authStore.user;
      
      if (!currentUser) {
        execution.error = 'No authenticated user found';
        return execution;
      }

      // Get connected wallet
      const walletStore = useWalletStore.getState();
      const connectedWallets = walletStore.connectedWallets;
      
      if (connectedWallets.length === 0) {
        execution.error = 'No connected wallet found';
        return execution;
      }

      // Use the first connected wallet
      const senderWallet = connectedWallets[0];
      
      // Check balance
      const balance = await WalletService.getBalance(senderWallet.id);
      if (balance < rule.amount) {
        execution.error = `Insufficient balance: ${balance} < ${rule.amount}`;
        return execution;
      }

      // Get sender address
      const senderAddress = await WalletService.getWalletAddress(senderWallet.id);
      if (!senderAddress) {
        execution.error = 'Could not get sender wallet address';
        return execution;
      }

      // Create autopay transaction record with 'autopay' status
      const transaction = await TransactionService.createAutopayTransaction(
        currentUser.id,
        senderWallet.id,
        rule.amount,
        rule.recipientWalletId,
        senderAddress,
        rule.id
      );

      execution.transactionId = transaction.id;
      
      // Update transaction store to reflect the new autopay transaction
      const transactionStore = useTransactionStore.getState();
      await transactionStore.fetchTransactions({
        user_id: currentUser.id,
        limit: 50
      });

      execution.success = true;
      
      console.log(`Autopay transaction created: ${transaction.id}`);
      
      // Simulate transaction processing (in real implementation, this would be actual Bitcoin network interaction)
      setTimeout(async () => {
        try {
          // Simulate successful transaction completion
          await TransactionService.markTransactionCompleted(
            transaction.id,
            `autopay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          );
          
          // Refresh transaction store
          await transactionStore.fetchTransactions({
            user_id: currentUser.id,
            limit: 50
          });
          
          console.log(`Autopay transaction ${transaction.id} marked as completed`);
        } catch (error) {
          console.error(`Error completing autopay transaction ${transaction.id}:`, error);
          
          // Mark as failed if completion fails
          try {
            await TransactionService.markTransactionFailed(transaction.id);
            await transactionStore.fetchTransactions({
              user_id: currentUser.id,
              limit: 50
            });
          } catch (failError) {
            console.error(`Error marking transaction as failed:`, failError);
          }
        }
      }, 2000); // 2 second delay to simulate network processing
      
      return execution;
    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error executing autopay:', error);
      return execution;
    }
  }

  /**
   * Notify that a payment has been triggered (placeholder for UI notification)
   */
  private static notifyPaymentTriggered(rule: AutopayRule, execution: AutopayExecution): void {
    // This would typically trigger a UI notification
    // For now, just log the event
    console.log(`🔔 Payment triggered: ${rule.amount} BTC sent to ${rule.recipientWalletId}`);
    console.log(`Transaction ID: ${execution.transactionId}`);
    
    // In a real app, you might dispatch an event or update a notification store
    // window.dispatchEvent(new CustomEvent('autopay-triggered', { detail: { rule, execution } }));
  }

  /**
   * Get all scheduled tasks (for debugging)
   */
  static getScheduledTasks(): Map<string, ScheduledTask> {
    return new Map(this.scheduledTasks);
  }

  /**
   * Stop all monitoring and cleanup
   */
  static async shutdown(): Promise<void> {
    console.log('Shutting down AutopayService...');
    
    // Stop all scheduled tasks
    for (const [ruleId, task] of Array.from(this.scheduledTasks.entries())) {
      try {
        task.stop();
        task.destroy();
        console.log(`Stopped monitoring for rule ${ruleId}`);
      } catch (error) {
        console.error(`Error stopping task for rule ${ruleId}:`, error);
      }
    }
    
    this.scheduledTasks.clear();
    this.isInitialized = false;
    
    console.log('AutopayService shutdown complete');
  }

  /**
   * Restart monitoring for all active rules (useful after configuration changes)
   */
  static async restart(): Promise<void> {
    console.log('Restarting AutopayService...');
    await this.shutdown();
    await this.initialize();
  }

  /**
   * Get autopay execution history for a specific rule
   */
  static async getAutopayHistory(ruleId: string): Promise<AutopayExecution[]> {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll return an empty array as this is primarily for monitoring
      console.log(`Getting autopay history for rule ${ruleId}`);
      return [];
    } catch (error) {
      console.error(`Error getting autopay history for rule ${ruleId}:`, error);
      return [];
    }
  }

  /**
   * Get statistics about autopay executions
   */
  static async getAutopayStats(): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalAmountSent: number;
  }> {
    try {
      // Get current user
      const authStore = useAuthStore.getState();
      const currentUser = authStore.user;
      
      if (!currentUser) {
        return {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          totalAmountSent: 0
        };
      }

      // Get autopay transactions from transaction service
      const autopayTransactions = await TransactionService.getAutopayTransactions(currentUser.id);
      
      const stats = autopayTransactions.reduce((acc, transaction) => {
        acc.totalExecutions++;
        if (transaction.status === 'completed') {
          acc.successfulExecutions++;
          acc.totalAmountSent += transaction.amount;
        } else if (transaction.status === 'failed') {
          acc.failedExecutions++;
        }
        return acc;
      }, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalAmountSent: 0
      });

      return stats;
    } catch (error) {
      console.error('Error getting autopay stats:', error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalAmountSent: 0
      };
    }
  }

  /**
   * Check if a rule can be executed (has sufficient balance, etc.)
   */
  static async canExecuteRule(rule: AutopayRule): Promise<{ canExecute: boolean; reason?: string }> {
    try {
      // Get current user
      const authStore = useAuthStore.getState();
      const currentUser = authStore.user;
      
      if (!currentUser) {
        return { canExecute: false, reason: 'No authenticated user' };
      }

      // Check if rule is active
      if (!rule.isActive) {
        return { canExecute: false, reason: 'Rule is not active' };
      }

      // Get connected wallet
      const walletStore = useWalletStore.getState();
      const connectedWallets = walletStore.connectedWallets;
      
      if (connectedWallets.length === 0) {
        return { canExecute: false, reason: 'No connected wallet' };
      }

      // Check balance
      const senderWallet = connectedWallets[0];
      const balance = await WalletService.getBalance(senderWallet.id);
      
      if (balance < rule.amount) {
        return { 
          canExecute: false, 
          reason: `Insufficient balance: ${balance} BTC < ${rule.amount} BTC` 
        };
      }

      return { canExecute: true };
    } catch (error) {
      console.error('Error checking if rule can be executed:', error);
      return { canExecute: false, reason: 'Error checking rule execution capability' };
    }
  }

  /**
   * Manually trigger an autopay rule (for testing or immediate execution)
   */
  static async manuallyTriggerRule(ruleId: string): Promise<AutopayExecution> {
    try {
      console.log(`Manually triggering autopay rule: ${ruleId}`);
      
      const x402Store = useX402Store.getState();
      const rule = x402Store.autopayRules.find(r => r.id === ruleId);
      
      if (!rule) {
        return {
          ruleId,
          executedAt: new Date(),
          success: false,
          error: 'Rule not found'
        };
      }

      // Check if rule can be executed
      const canExecute = await this.canExecuteRule(rule);
      if (!canExecute.canExecute) {
        return {
          ruleId,
          executedAt: new Date(),
          success: false,
          error: canExecute.reason
        };
      }

      // Execute the autopay
      const execution = await this.executeAutopay(rule);
      
      if (execution.success) {
        // Update last triggered time
        x402Store.updateLastTriggered(ruleId);
        
        // Notify about manual trigger
        this.notifyPaymentTriggered(rule, execution);
      }
      
      return execution;
    } catch (error) {
      console.error(`Error manually triggering rule ${ruleId}:`, error);
      return {
        ruleId,
        executedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}