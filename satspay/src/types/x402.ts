export interface AutopayRule {
  id: string;
  recipientWalletId: string;
  amount: number;
  condition: string;
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface AutopayCondition {
  type: 'time' | 'price' | 'event';
  value: string;
  operator?: 'greater' | 'less' | 'equal';
}

export interface AutopayExecution {
  ruleId: string;
  executedAt: Date;
  transactionId?: string;
  success: boolean;
  error?: string;
}