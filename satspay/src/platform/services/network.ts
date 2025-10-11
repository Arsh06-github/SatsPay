// Cross-platform network service
import { PLATFORM_INFO } from '../adapters/platform';

export interface NetworkRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | FormData;
  timeout?: number;
}

export interface NetworkResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Cross-platform network service
 */
export class CrossPlatformNetwork {
  private static defaultTimeout = 30000; // 30 seconds

  /**
   * Make HTTP request
   */
  static async request<T = any>(
    url: string, 
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = options;

    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as unknown as T;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        };
      } else {
        // React Native implementation would use fetch or axios
        // For now, throw error as placeholder
        throw new Error('Native network requests not implemented');
      }
    } catch (error) {
      console.error('Network request error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get<T = any>(
    url: string, 
    headers?: Record<string, string>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  static async post<T = any>(
    url: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT request
   */
  static async put<T = any>(
    url: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(
    url: string, 
    headers?: Record<string, string>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }

  /**
   * Check network connectivity
   */
  static async isConnected(): Promise<boolean> {
    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using navigator.onLine and a test request
        if (!navigator.onLine) {
          return false;
        }

        // Test with a lightweight request
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        return true;
      } else {
        // React Native implementation would use @react-native-community/netinfo
        // For now, assume connected
        return true;
      }
    } catch (error) {
      console.error('Network connectivity check error:', error);
      return false;
    }
  }

  /**
   * Download file
   */
  static async downloadFile(url: string, filename?: string): Promise<boolean> {
    try {
      if (PLATFORM_INFO.isWeb) {
        // Web implementation using blob and download link
        const response = await fetch(url);
        const blob = await response.blob();
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return true;
      } else {
        // React Native implementation would use react-native-fs
        console.log('Native file download not implemented');
        return false;
      }
    } catch (error) {
      console.error('File download error:', error);
      return false;
    }
  }

  /**
   * Upload file
   */
  static async uploadFile(
    url: string, 
    file: File | Blob, 
    fieldName: string = 'file',
    additionalFields?: Record<string, string>
  ): Promise<NetworkResponse> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      return this.request(url, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}