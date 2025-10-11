// Cross-platform storage service
import { PLATFORM_SERVICES } from '../adapters/platform';

/**
 * Cross-platform storage service that abstracts localStorage/AsyncStorage
 */
export class CrossPlatformStorage {
  /**
   * Get item from storage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await PLATFORM_SERVICES.storage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  static async setItem(key: string, value: string): Promise<boolean> {
    try {
      await PLATFORM_SERVICES.storage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await PLATFORM_SERVICES.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<boolean> {
    try {
      await PLATFORM_SERVICES.storage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get JSON object from storage
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Storage getObject error:', error);
      return null;
    }
  }

  /**
   * Set JSON object in storage
   */
  static async setObject<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.setItem(key, jsonString);
    } catch (error) {
      console.error('Storage setObject error:', error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('Storage hasItem error:', error);
      return false;
    }
  }

  /**
   * Get multiple items from storage
   */
  static async getMultiple(keys: string[]): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};
    
    try {
      await Promise.all(
        keys.map(async (key) => {
          result[key] = await this.getItem(key);
        })
      );
      return result;
    } catch (error) {
      console.error('Storage getMultiple error:', error);
      return result;
    }
  }

  /**
   * Set multiple items in storage
   */
  static async setMultiple(items: Record<string, string>): Promise<boolean> {
    try {
      const promises = Object.entries(items).map(([key, value]) =>
        this.setItem(key, value)
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Storage setMultiple error:', error);
      return false;
    }
  }
}