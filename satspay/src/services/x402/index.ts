import { AutopayService } from './autopayService';

// x402 service exports and initialization
export { AutopayService } from './autopayService';
export { ConditionMonitor } from './conditionMonitor';

// Auto-initialize the service when the module is loaded
let initializationPromise: Promise<void> | null = null;

export const initializeX402Services = async (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = AutopayService.initialize();
  return initializationPromise;
};

// Initialize on module load (but don't block)
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  setTimeout(() => {
    initializeX402Services().catch(error => {
      console.error('Failed to initialize x402 services:', error);
    });
  }, 1000); // Delay to ensure stores are ready
}