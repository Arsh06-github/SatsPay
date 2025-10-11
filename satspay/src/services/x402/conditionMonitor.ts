import { AutopayCondition } from '../../types/x402';

// Condition monitoring service for x402 autopay
export class ConditionMonitor {
  private static conditionCache = new Map<string, { result: boolean; timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 minute cache

  /**
   * Start monitoring a specific condition (called by AutopayService)
   */
  static async startMonitoring(ruleId: string, condition: string): Promise<void> {
    console.log(`Starting monitoring for rule ${ruleId} with condition: ${condition}`);
    // Note: The actual monitoring is handled by AutopayService's browser-compatible scheduling
    // This method is kept for compatibility and future enhancements
  }
  
  /**
   * Stop monitoring a specific condition (called by AutopayService)
   */
  static async stopMonitoring(ruleId: string): Promise<void> {
    console.log(`Stopping monitoring for rule: ${ruleId}`);
    // Clear any cached results for this rule
    this.conditionCache.delete(ruleId);
  }
  
  /**
   * Evaluate if a condition is currently met
   */
  static async evaluateCondition(condition: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.conditionCache.get(condition);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.result;
      }

      console.log(`Evaluating condition: ${condition}`);
      
      // Parse the condition
      const parsedCondition = this.parseCondition(condition);
      if (!parsedCondition) {
        console.error(`Invalid condition format: ${condition}`);
        return false;
      }

      // Evaluate based on condition type
      let result = false;
      switch (parsedCondition.type) {
        case 'time':
          result = await this.evaluateTimeCondition(parsedCondition);
          break;
        case 'price':
          result = await this.evaluatePriceCondition(parsedCondition);
          break;
        case 'event':
          result = await this.evaluateEventCondition(parsedCondition);
          break;
        default:
          console.error(`Unknown condition type: ${parsedCondition.type}`);
          result = false;
      }

      // Cache the result
      this.conditionCache.set(condition, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error(`Error evaluating condition "${condition}":`, error);
      return false;
    }
  }

  /**
   * Parse a condition string into a structured format
   */
  private static parseCondition(condition: string): AutopayCondition | null {
    try {
      // Remove extra whitespace and convert to lowercase for parsing
      const cleanCondition = condition.trim().toLowerCase();

      // Time-based conditions
      // Examples: "every hour", "daily at 9am", "weekly on monday", "monthly on 1st"
      if (cleanCondition.includes('every') || cleanCondition.includes('daily') || 
          cleanCondition.includes('weekly') || cleanCondition.includes('monthly')) {
        return {
          type: 'time',
          value: cleanCondition
        };
      }

      // Price-based conditions
      // Examples: "btc price > 50000", "btc price < 30000", "btc price = 45000"
      const priceMatch = cleanCondition.match(/btc\s+price\s*([><=]+)\s*(\d+(?:\.\d+)?)/);
      if (priceMatch) {
        const operator = priceMatch[1].includes('>') ? 'greater' : 
                        priceMatch[1].includes('<') ? 'less' : 'equal';
        return {
          type: 'price',
          value: priceMatch[2],
          operator
        };
      }

      // Event-based conditions
      // Examples: "transaction received", "wallet connected", "balance changed"
      if (cleanCondition.includes('transaction') || cleanCondition.includes('wallet') || 
          cleanCondition.includes('balance') || cleanCondition.includes('received')) {
        return {
          type: 'event',
          value: cleanCondition
        };
      }

      // Default to time-based if no specific pattern matches
      return {
        type: 'time',
        value: cleanCondition
      };
    } catch (error) {
      console.error('Error parsing condition:', error);
      return null;
    }
  }

  /**
   * Evaluate time-based conditions
   */
  private static async evaluateTimeCondition(condition: AutopayCondition): Promise<boolean> {
    try {
      const now = new Date();
      const value = condition.value.toLowerCase();

      // Simple time-based conditions for demo
      if (value.includes('every hour')) {
        // Trigger at the start of every hour (minute 0)
        return now.getMinutes() === 0;
      }

      if (value.includes('daily')) {
        // Extract time if specified, default to midnight
        const timeMatch = value.match(/(\d{1,2})(am|pm)/);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          if (timeMatch[2] === 'pm' && hour !== 12) hour += 12;
          if (timeMatch[2] === 'am' && hour === 12) hour = 0;
          
          return now.getHours() === hour && now.getMinutes() === 0;
        }
        // Default to midnight
        return now.getHours() === 0 && now.getMinutes() === 0;
      }

      if (value.includes('weekly')) {
        // Check if it's the specified day and time
        const dayMatch = value.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
        if (dayMatch) {
          const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            .indexOf(dayMatch[1]);
          return now.getDay() === targetDay && now.getHours() === 0 && now.getMinutes() === 0;
        }
      }

      if (value.includes('monthly')) {
        // Check if it's the first day of the month
        return now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0;
      }

      // For demo purposes, trigger every 5 minutes for any unrecognized time condition
      return now.getMinutes() % 5 === 0;
    } catch (error) {
      console.error('Error evaluating time condition:', error);
      return false;
    }
  }

  /**
   * Evaluate price-based conditions
   */
  private static async evaluatePriceCondition(condition: AutopayCondition): Promise<boolean> {
    try {
      // In a real implementation, you would fetch the current BTC price from an API
      // For demo purposes, we'll use a mock price that changes over time
      const mockPrice = this.getMockBitcoinPrice();
      const targetPrice = parseFloat(condition.value);
      
      console.log(`Checking BTC price: $${mockPrice} ${condition.operator} $${targetPrice}`);

      switch (condition.operator) {
        case 'greater':
          return mockPrice > targetPrice;
        case 'less':
          return mockPrice < targetPrice;
        case 'equal':
          // Allow for small price variations (within 1%)
          return Math.abs(mockPrice - targetPrice) / targetPrice < 0.01;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error evaluating price condition:', error);
      return false;
    }
  }

  /**
   * Evaluate event-based conditions
   */
  private static async evaluateEventCondition(condition: AutopayCondition): Promise<boolean> {
    try {
      const value = condition.value.toLowerCase();

      // For demo purposes, simulate some events
      if (value.includes('transaction received')) {
        // Randomly trigger to simulate receiving transactions
        return Math.random() < 0.1; // 10% chance per check
      }

      if (value.includes('wallet connected')) {
        // Check if any wallet is currently connected
        // This would need to be integrated with the wallet store
        return true; // Assume wallet is connected for demo
      }

      if (value.includes('balance changed')) {
        // This would require tracking balance changes over time
        // For demo, trigger occasionally
        return Math.random() < 0.05; // 5% chance per check
      }

      // Default to false for unrecognized events
      return false;
    } catch (error) {
      console.error('Error evaluating event condition:', error);
      return false;
    }
  }

  /**
   * Get a mock Bitcoin price that changes over time (for demo purposes)
   */
  private static getMockBitcoinPrice(): number {
    // Create a price that oscillates around $45,000 with some randomness
    const basePrice = 45000;
    const timeVariation = Math.sin(Date.now() / 100000) * 5000; // Slow oscillation
    const randomVariation = (Math.random() - 0.5) * 2000; // Random noise
    
    return Math.round(basePrice + timeVariation + randomVariation);
  }

  /**
   * Clear all cached condition results
   */
  static clearCache(): void {
    this.conditionCache.clear();
    console.log('Condition cache cleared');
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { size: number; entries: Array<{ condition: string; result: boolean; age: number }> } {
    const now = Date.now();
    const entries = Array.from(this.conditionCache.entries()).map(([condition, data]) => ({
      condition,
      result: data.result,
      age: now - data.timestamp
    }));

    return {
      size: this.conditionCache.size,
      entries
    };
  }

  /**
   * Validate a condition string format
   */
  static validateCondition(condition: string): { valid: boolean; error?: string } {
    try {
      const parsed = this.parseCondition(condition);
      if (!parsed) {
        return { valid: false, error: 'Unable to parse condition format' };
      }

      // Additional validation based on condition type
      switch (parsed.type) {
        case 'price':
          if (!parsed.operator || !parsed.value) {
            return { valid: false, error: 'Price conditions must specify operator and value' };
          }
          if (isNaN(parseFloat(parsed.value))) {
            return { valid: false, error: 'Price value must be a valid number' };
          }
          break;
        case 'time':
          if (!parsed.value) {
            return { valid: false, error: 'Time conditions must specify a time pattern' };
          }
          break;
        case 'event':
          if (!parsed.value) {
            return { valid: false, error: 'Event conditions must specify an event type' };
          }
          break;
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }
}