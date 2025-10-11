import React, { useState, useEffect } from 'react';
import Card3D from '../../animations/Card3D';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import { useX402Store } from '../../../stores/x402Store';
import { useTransactionStore } from '../../../stores/transactionStore';
import { AutopayService } from '../../../services/x402/autopayService';
import { ConditionMonitor } from '../../../services/x402/conditionMonitor';
import { AutopayRule } from '../../../types/x402';
import AutopayUtils from '../../../utils/autopayUtils';

const X402: React.FC = () => {
  const {
    autopayRules,
    createAutopayRule,
    activateRule,
    deactivateRule,
    deleteRule,
    getActiveRules,
    getRuleStats
  } = useX402Store();

  const { transactions } = useTransactionStore();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipientWalletId: '',
    amount: '',
    condition: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Listen for autopay triggered events
  useEffect(() => {
    const handleAutopayTriggered = (event: CustomEvent) => {
      const { rule, execution } = event.detail;
      setNotification({
        message: `Payment triggered: ${rule.amount} BTC sent to ${rule.recipientWalletId}`,
        type: 'success'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener('autopay-triggered', handleAutopayTriggered as EventListener);
    return () => {
      window.removeEventListener('autopay-triggered', handleAutopayTriggered as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recipientWalletId.trim()) {
      errors.recipientWalletId = 'Recipient wallet ID is required';
    }

    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be a positive number';
      }
    }

    if (!formData.condition.trim()) {
      errors.condition = 'Condition is required';
    } else {
      // Validate condition format
      const validation = ConditionMonitor.validateCondition(formData.condition);
      if (!validation.valid) {
        errors.condition = validation.error || 'Invalid condition format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ruleId = await AutopayService.createAutopayRule(
        formData.recipientWalletId,
        parseFloat(formData.amount),
        formData.condition
      );

      if (ruleId) {
        setNotification({
          message: 'Autopay rule created successfully!',
          type: 'success'
        });
        
        // Reset form and close modal
        setFormData({ recipientWalletId: '', amount: '', condition: '' });
        setIsFormOpen(false);
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Failed to create autopay rule',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating autopay rule:', error);
      setNotification({
        message: 'Error creating autopay rule',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRule = async (rule: AutopayRule) => {
    try {
      if (rule.isActive) {
        await AutopayService.deactivateAutopayRule(rule.id);
        setNotification({
          message: 'Autopay rule deactivated',
          type: 'info'
        });
      } else {
        await AutopayService.activateAutopayRule(rule.id);
        setNotification({
          message: 'Autopay rule activated',
          type: 'success'
        });
      }
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error toggling rule:', error);
      setNotification({
        message: 'Error updating rule status',
        type: 'error'
      });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this autopay rule?')) {
      deleteRule(ruleId);
      setNotification({
        message: 'Autopay rule deleted',
        type: 'info'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleManualTrigger = async (ruleId: string) => {
    try {
      setNotification({
        message: 'Triggering autopay rule...',
        type: 'info'
      });

      const execution = await AutopayService.manuallyTriggerRule(ruleId);
      
      if (execution.success) {
        setNotification({
          message: `Autopay triggered successfully! Transaction ID: ${execution.transactionId}`,
          type: 'success'
        });
      } else {
        setNotification({
          message: `Failed to trigger autopay: ${execution.error}`,
          type: 'error'
        });
      }
      
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error manually triggering autopay:', error);
      setNotification({
        message: 'Error triggering autopay rule',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };



  const getConditionExamples = (): string[] => {
    return [
      'every hour',
      'daily at 9am',
      'weekly on monday',
      'monthly on 1st',
      'btc price > 50000',
      'btc price < 30000',
      'transaction received'
    ];
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-success-100 border border-success-200 text-success-800' :
          notification.type === 'error' ? 'bg-error-100 border border-error-200 text-error-800' :
          'bg-primary-100 border border-primary-200 text-primary-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Autopay Setup Form */}
      <Card3D intensity="medium" className="transform-gpu">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-secondary-900">
              x402 Autopay Setup
            </h2>
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              size="md"
            >
              Create New Rule
            </Button>
          </div>
          
          <div className="text-secondary-600 space-y-4">
            <p className="text-sm">
              Set up automated Bitcoin payments that trigger when specific conditions are met.
              Configure recipient, amount, and trigger conditions for seamless autopay functionality.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-secondary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{getRuleStats().total}</div>
                <div className="text-sm text-secondary-600">Total Rules</div>
              </div>
              <div className="p-4 bg-success-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600">{getRuleStats().active}</div>
                <div className="text-sm text-secondary-600">Active Rules</div>
              </div>
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{getRuleStats().triggered}</div>
                <div className="text-sm text-secondary-600">Triggered</div>
              </div>
              <div className="p-4 bg-warning-50 rounded-lg">
                <div className="text-2xl font-bold text-warning-600">
                  {AutopayUtils.filterAutopayTransactions(transactions).length}
                </div>
                <div className="text-sm text-secondary-600">Autopay Txns</div>
              </div>
            </div>
          </div>
        </div>
      </Card3D>
      
      {/* Active Autopay Rules */}
      <Card3D intensity="subtle" glowEffect className="transform-gpu">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary-900 mb-4">
            Autopay Rules
          </h2>
          
          <div className="space-y-3">
            {autopayRules.length === 0 ? (
              <div className="text-center py-8 text-primary-600">
                <p className="text-lg mb-2">No autopay rules configured</p>
                <p className="text-sm">Create your first autopay rule to get started with automated payments.</p>
              </div>
            ) : (
              AutopayUtils.sortRulesByPriority(autopayRules).map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    AutopayUtils.shouldHighlightRule(rule)
                      ? 'bg-primary-50 border-primary-300 shadow-md'
                      : rule.isActive
                      ? 'bg-success-50 border-success-200 hover:bg-success-100'
                      : 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-secondary-900">
                        {rule.amount} BTC → {rule.recipientWalletId}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive
                          ? 'bg-success-100 text-success-800'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-secondary-600">
                      <span className="font-medium">Condition:</span> {AutopayUtils.formatConditionForDisplay(rule.condition)}
                    </div>
                    {rule.lastTriggered && (
                      <div className="text-xs text-secondary-500">
                        Last triggered: {AutopayUtils.getTimeSinceLastTrigger(rule)}
                      </div>
                    )}
                    <div className="text-xs text-secondary-500">
                      Autopay transactions: {AutopayUtils.filterAutopayTransactions(transactions).filter(tx => tx.autopay_rule_id === rule.id).length}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {rule.isActive && (
                      <Button
                        onClick={() => handleManualTrigger(rule.id)}
                        variant="primary"
                        size="sm"
                      >
                        Trigger Now
                      </Button>
                    )}
                    <Button
                      onClick={() => handleToggleRule(rule)}
                      variant={rule.isActive ? 'warning' : 'success'}
                      size="sm"
                    >
                      {rule.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteRule(rule.id)}
                      variant="error"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card3D>

      {/* Create Autopay Rule Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create Autopay Rule"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recipient Wallet ID"
            name="recipientWalletId"
            value={formData.recipientWalletId}
            onChange={handleInputChange}
            placeholder="Enter recipient wallet ID or address"
            error={formErrors.recipientWalletId}
            required
          />
          
          <Input
            label="Amount (BTC)"
            name="amount"
            type="number"
            step="0.00000001"
            min="0"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.001"
            error={formErrors.amount}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-secondary-700">
              Trigger Condition
            </label>
            <textarea
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              placeholder="e.g., every hour, btc price > 50000, daily at 9am"
              className={`block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none ${
                formErrors.condition ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
              }`}
              rows={3}
              required
            />
            {formErrors.condition && (
              <p className="text-sm text-error-600">{formErrors.condition}</p>
            )}
            
            <div className="mt-2">
              <p className="text-xs text-secondary-500 mb-1">Example conditions:</p>
              <div className="flex flex-wrap gap-1">
                {getConditionExamples().map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, condition: example }))}
                    className="px-2 py-1 text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setIsFormOpen(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default X402;