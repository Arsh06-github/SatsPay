import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AutopayRule {
  id: string;
  recipientWalletId: string;
  amount: number;
  condition: string;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

interface X402State {
  autopayRules: AutopayRule[];
  isLoading: boolean;
  createAutopayRule: (rule: Omit<AutopayRule, 'id' | 'createdAt'>) => void;
  activateRule: (id: string) => void;
  deactivateRule: (id: string) => void;
  updateLastTriggered: (id: string) => void;
  deleteRule: (id: string) => void;
  getActiveRules: () => AutopayRule[];
  getRuleById: (id: string) => AutopayRule | undefined;
  updateRule: (id: string, updates: Partial<AutopayRule>) => void;
  getTriggeredRules: () => AutopayRule[];
  getRuleStats: () => {
    total: number;
    active: number;
    triggered: number;
    inactive: number;
  };
}

export const useX402Store = create<X402State>()(
  persist(
    (set, get) => ({
      autopayRules: [],
      isLoading: false,
      
      createAutopayRule: (ruleData) => {
        const rule: AutopayRule = {
          ...ruleData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        set(state => ({
          autopayRules: [...state.autopayRules, rule]
        }));
      },
      
      activateRule: (id: string) => {
        set(state => ({
          autopayRules: state.autopayRules.map(rule =>
            rule.id === id ? { ...rule, isActive: true } : rule
          )
        }));
      },
      
      deactivateRule: (id: string) => {
        set(state => ({
          autopayRules: state.autopayRules.map(rule =>
            rule.id === id ? { ...rule, isActive: false } : rule
          )
        }));
      },
      
      updateLastTriggered: (id: string) => {
        set(state => ({
          autopayRules: state.autopayRules.map(rule =>
            rule.id === id ? { ...rule, lastTriggered: new Date() } : rule
          )
        }));
      },
      
      deleteRule: (id: string) => {
        set(state => ({
          autopayRules: state.autopayRules.filter(rule => rule.id !== id)
        }));
      },
      
      getActiveRules: () => {
        const { autopayRules } = get();
        return autopayRules.filter(rule => rule.isActive);
      },

      getRuleById: (id: string) => {
        const { autopayRules } = get();
        return autopayRules.find(rule => rule.id === id);
      },

      updateRule: (id: string, updates: Partial<AutopayRule>) => {
        set(state => ({
          autopayRules: state.autopayRules.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
          )
        }));
      },

      getTriggeredRules: () => {
        const { autopayRules } = get();
        return autopayRules.filter(rule => rule.lastTriggered);
      },

      getRuleStats: () => {
        const { autopayRules } = get();
        return {
          total: autopayRules.length,
          active: autopayRules.filter(rule => rule.isActive).length,
          triggered: autopayRules.filter(rule => rule.lastTriggered).length,
          inactive: autopayRules.filter(rule => !rule.isActive).length
        };
      },
    }),
    {
      name: 'x402-storage',
      partialize: (state) => ({ autopayRules: state.autopayRules }),
    }
  )
);