/**
 * Enhanced localStorage Management System
 * Provides robust data persistence with serialization, validation, backup, and recovery
 */

class EnhancedStorageManager {
  constructor() {
    this.storagePrefix = 'satspay_';
    this.version = '1.0.0';
    this.maxRetries = 3;
    this.backupKey = `${this.storagePrefix}backup`;
    this.metadataKey = `${this.storagePrefix}metadata`;
    
    // Initialize metadata if not exists
    this.initializeMetadata();
  }

  /**
   * Initialize storage metadata
   */
  initializeMetadata() {
    try {
      const metadata = this.getMetadata();
      if (!metadata) {
        this.setMetadata({
          version: this.version,
          createdAt: Date.now(),
          lastBackup: null,
          dataKeys: []
        });
      }
    } catch (error) {
      console.error('Failed to initialize metadata:', error);
    }
  }

  /**
   * Get storage metadata
   */
  getMetadata() {
    try {
      const data = localStorage.getItem(this.metadataKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }

  /**
   * Set storage metadata
   */
  setMetadata(metadata) {
    try {
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
      return true;
    } catch (error) {
      console.error('Failed to set metadata:', error);
      return false;
    }
  }

  /**
   * Enhanced data serialization with validation
   */
  serialize(data) {
    try {
      // Validate data before serialization
      if (data === undefined) {
        throw new Error('Cannot serialize undefined value');
      }

      // Handle different data types
      const serializedData = {
        type: this.getDataType(data),
        value: data,
        timestamp: Date.now(),
        version: this.version
      };

      return JSON.stringify(serializedData);
    } catch (error) {
      console.error('Serialization error:', error);
      throw new Error(`Failed to serialize data: ${error.message}`);
    }
  }

  /**
   * Enhanced data deserialization with validation
   */
  deserialize(serializedData) {
    try {
      if (!serializedData) {
        return null;
      }

      const parsed = JSON.parse(serializedData);
      
      // Validate structure
      if (!parsed.hasOwnProperty('value') || !parsed.hasOwnProperty('timestamp')) {
        // Handle legacy data format
        return serializedData.startsWith('{') || serializedData.startsWith('[') 
          ? JSON.parse(serializedData) 
          : serializedData;
      }

      // Version compatibility check
      if (parsed.version && parsed.version !== this.version) {
        console.warn(`Data version mismatch: ${parsed.version} vs ${this.version}`);
      }

      return parsed.value;
    } catch (error) {
      console.error('Deserialization error:', error);
      // Try to return raw data as fallback
      try {
        return JSON.parse(serializedData);
      } catch {
        return serializedData;
      }
    }
  }

  /**
   * Get data type for validation
   */
  getDataType(data) {
    if (data === null) return 'null';
    if (Array.isArray(data)) return 'array';
    return typeof data;
  }

  /**
   * Enhanced save with retry mechanism and validation
   */
  async save(key, data, options = {}) {
    const { 
      retries = this.maxRetries, 
      backup = true, 
      validate = true 
    } = options;

    // Validate key
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key: must be a non-empty string');
    }

    // Add prefix to key
    const fullKey = key.startsWith(this.storagePrefix) ? key : `${this.storagePrefix}${key}`;

    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Check storage quota before saving
        if (validate && !this.checkStorageQuota()) {
          throw new Error('Storage quota exceeded');
        }

        // Create backup if requested
        if (backup && attempt === 0) {
          await this.createBackup(fullKey);
        }

        // Serialize and save data
        const serializedData = this.serialize(data);
        localStorage.setItem(fullKey, serializedData);

        // Update metadata
        this.updateDataKeysList(fullKey);

        // Validate save was successful
        if (validate) {
          const savedData = localStorage.getItem(fullKey);
          if (!savedData) {
            throw new Error('Data was not saved successfully');
          }
        }

        return true;

      } catch (error) {
        lastError = error;
        console.warn(`Save attempt ${attempt + 1} failed:`, error.message);
        
        // Wait before retry (exponential backoff)
        if (attempt < retries - 1) {
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    console.error(`Failed to save data after ${retries} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Enhanced load with validation and error recovery
   */
  async load(key, options = {}) {
    const { 
      defaultValue = null, 
      validate = true,
      useBackup = true 
    } = options;

    // Add prefix to key
    const fullKey = key.startsWith(this.storagePrefix) ? key : `${this.storagePrefix}${key}`;

    try {
      const serializedData = localStorage.getItem(fullKey);
      
      if (!serializedData) {
        return defaultValue;
      }

      const data = this.deserialize(serializedData);

      // Validate data if requested
      if (validate && !this.validateData(data)) {
        throw new Error('Data validation failed');
      }

      return data;

    } catch (error) {
      console.error(`Failed to load data for key ${fullKey}:`, error);

      // Try to recover from backup
      if (useBackup) {
        try {
          const backupData = await this.recoverFromBackup(fullKey);
          if (backupData !== null) {
            console.info(`Recovered data from backup for key: ${fullKey}`);
            return backupData;
          }
        } catch (backupError) {
          console.error('Backup recovery failed:', backupError);
        }
      }

      return defaultValue;
    }
  }

  /**
   * Remove data with backup
   */
  async remove(key, options = {}) {
    const { backup = true } = options;
    const fullKey = key.startsWith(this.storagePrefix) ? key : `${this.storagePrefix}${key}`;

    try {
      // Create backup before removal
      if (backup) {
        await this.createBackup(fullKey);
      }

      localStorage.removeItem(fullKey);
      this.removeFromDataKeysList(fullKey);
      return true;

    } catch (error) {
      console.error(`Failed to remove data for key ${fullKey}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data with backup
   */
  async clearAll(options = {}) {
    const { backup = true, confirm = true } = options;

    if (confirm && !window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return false;
    }

    try {
      // Create full backup before clearing
      if (backup) {
        await this.createFullBackup();
      }

      const metadata = this.getMetadata();
      const dataKeys = metadata?.dataKeys || [];

      // Remove all data keys
      dataKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove key ${key}:`, error);
        }
      });

      // Clear metadata
      localStorage.removeItem(this.metadataKey);

      // Reinitialize
      this.initializeMetadata();

      return true;

    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Create backup for specific key
   */
  async createBackup(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return false;

      const backupData = this.getBackupData() || {};
      backupData[key] = {
        data: data,
        timestamp: Date.now()
      };

      localStorage.setItem(this.backupKey, JSON.stringify(backupData));
      
      // Update metadata
      const metadata = this.getMetadata();
      if (metadata) {
        metadata.lastBackup = Date.now();
        this.setMetadata(metadata);
      }

      return true;

    } catch (error) {
      console.error(`Failed to create backup for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Create full backup of all data
   */
  async createFullBackup() {
    try {
      const metadata = this.getMetadata();
      const dataKeys = metadata?.dataKeys || [];
      const backupData = {};

      dataKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            backupData[key] = {
              data: data,
              timestamp: Date.now()
            };
          }
        } catch (error) {
          console.warn(`Failed to backup key ${key}:`, error);
        }
      });

      localStorage.setItem(this.backupKey, JSON.stringify(backupData));
      
      // Update metadata
      if (metadata) {
        metadata.lastBackup = Date.now();
        this.setMetadata(metadata);
      }

      return true;

    } catch (error) {
      console.error('Failed to create full backup:', error);
      return false;
    }
  }

  /**
   * Recover data from backup
   */
  async recoverFromBackup(key) {
    try {
      const backupData = this.getBackupData();
      if (!backupData || !backupData[key]) {
        return null;
      }

      const backup = backupData[key];
      const data = this.deserialize(backup.data);

      // Restore the data
      localStorage.setItem(key, backup.data);
      this.updateDataKeysList(key);

      return data;

    } catch (error) {
      console.error(`Failed to recover from backup for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get backup data
   */
  getBackupData() {
    try {
      const data = localStorage.getItem(this.backupKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get backup data:', error);
      return null;
    }
  }

  /**
   * Validate data integrity
   */
  validateData(data) {
    try {
      // Basic validation - can be extended based on data type
      if (data === null || data === undefined) {
        return true; // null/undefined are valid
      }

      // Check for circular references
      JSON.stringify(data);
      
      return true;
    } catch (error) {
      console.error('Data validation failed:', error);
      return false;
    }
  }

  /**
   * Check storage quota
   */
  checkStorageQuota() {
    try {
      // Estimate current usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      // Check if we're approaching the limit (assume 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const usagePercentage = (totalSize / maxSize) * 100;

      if (usagePercentage > 90) {
        console.warn(`Storage usage is at ${usagePercentage.toFixed(1)}%`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Failed to check storage quota:', error);
      return true; // Assume it's okay if we can't check
    }
  }

  /**
   * Update data keys list in metadata
   */
  updateDataKeysList(key) {
    try {
      const metadata = this.getMetadata();
      if (metadata) {
        if (!metadata.dataKeys.includes(key)) {
          metadata.dataKeys.push(key);
          this.setMetadata(metadata);
        }
      }
    } catch (error) {
      console.error('Failed to update data keys list:', error);
    }
  }

  /**
   * Remove key from data keys list
   */
  removeFromDataKeysList(key) {
    try {
      const metadata = this.getMetadata();
      if (metadata) {
        metadata.dataKeys = metadata.dataKeys.filter(k => k !== key);
        this.setMetadata(metadata);
      }
    } catch (error) {
      console.error('Failed to remove from data keys list:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const metadata = this.getMetadata();
      let totalSize = 0;
      let keyCount = 0;

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.storagePrefix)) {
          totalSize += localStorage[key].length;
          keyCount++;
        }
      }

      return {
        totalSize,
        keyCount,
        lastBackup: metadata?.lastBackup,
        version: metadata?.version,
        createdAt: metadata?.createdAt
      };

    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export data for external backup
   */
  async exportData() {
    try {
      const metadata = this.getMetadata();
      const dataKeys = metadata?.dataKeys || [];
      const exportData = {
        metadata: metadata,
        data: {},
        exportedAt: Date.now()
      };

      dataKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            exportData.data[key] = data;
          }
        } catch (error) {
          console.warn(`Failed to export key ${key}:`, error);
        }
      });

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from external backup
   */
  async importData(exportedData, options = {}) {
    const { overwrite = false, validate = true } = options;

    try {
      const importData = JSON.parse(exportedData);
      
      if (!importData.data || !importData.metadata) {
        throw new Error('Invalid import data format');
      }

      // Validate import data
      if (validate) {
        if (!this.validateImportData(importData)) {
          throw new Error('Import data validation failed');
        }
      }

      // Create backup before import
      await this.createFullBackup();

      // Import data
      for (const [key, data] of Object.entries(importData.data)) {
        if (!overwrite && localStorage.getItem(key)) {
          console.warn(`Skipping existing key: ${key}`);
          continue;
        }

        localStorage.setItem(key, data);
        this.updateDataKeysList(key);
      }

      // Update metadata
      const currentMetadata = this.getMetadata();
      const importedMetadata = importData.metadata;
      
      if (currentMetadata && importedMetadata) {
        currentMetadata.lastImport = Date.now();
        currentMetadata.importedVersion = importedMetadata.version;
        this.setMetadata(currentMetadata);
      }

      return true;

    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Validate import data
   */
  validateImportData(importData) {
    try {
      // Check required fields
      if (!importData.metadata || !importData.data || !importData.exportedAt) {
        return false;
      }

      // Check data structure
      if (typeof importData.data !== 'object') {
        return false;
      }

      // Validate each data entry
      for (const [key, data] of Object.entries(importData.data)) {
        if (typeof key !== 'string' || typeof data !== 'string') {
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Import data validation error:', error);
      return false;
    }
  }
}

// Create global instance
const enhancedStorageManager = new EnhancedStorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedStorageManager;
} else if (typeof window !== 'undefined') {
  window.EnhancedStorageManager = EnhancedStorageManager;
  window.enhancedStorageManager = enhancedStorageManager;
}