// Performance monitoring and optimization utilities
import { useEffect, useRef, useState, useCallback } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  renderTime: number;
  componentCount: number;
  networkLatency?: number;
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fps: 60,
    renderTime: 0,
    componentCount: 0,
  };
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private frameCount = 0;
  private lastTime = performance.now();
  private rafId?: number;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start() {
    this.measureFPS();
    this.measureMemory();
    this.measureNetworkLatency();
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.metrics));
  }

  private measureFPS() {
    const measure = () => {
      this.frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        this.notifyObservers();
      }
      
      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  private measureMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
  }

  private async measureNetworkLatency() {
    try {
      const start = performance.now();
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
      const end = performance.now();
      this.metrics.networkLatency = Math.round(end - start);
    } catch (error) {
      console.warn('Failed to measure network latency:', error);
    }
  }

  updateRenderTime(time: number) {
    this.metrics.renderTime = time;
    this.notifyObservers();
  }

  updateComponentCount(count: number) {
    this.metrics.componentCount = count;
    this.notifyObservers();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    componentCount: 0,
  });

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.start();
    
    const unsubscribe = monitor.subscribe(setMetrics);
    
    return () => {
      unsubscribe();
      monitor.stop();
    };
  }, []);

  return metrics;
}

// Hook for measuring component render time
export function useRenderTime(componentName?: string) {
  const renderStartTime = useRef<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      monitor.updateRenderTime(renderTime);
      
      if (componentName && renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  });
}

// Hook for detecting performance issues
export function usePerformanceWarnings() {
  const metrics = usePerformanceMonitor();
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const newWarnings: string[] = [];

    if (metrics.fps < 30) {
      newWarnings.push('Low FPS detected. Consider reducing animations or optimizing renders.');
    }

    if (metrics.renderTime > 50) {
      newWarnings.push('Slow render time detected. Consider optimizing component logic.');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      newWarnings.push('High memory usage detected. Check for memory leaks.');
    }

    if (metrics.networkLatency && metrics.networkLatency > 1000) {
      newWarnings.push('High network latency detected. Consider optimizing API calls.');
    }

    setWarnings(newWarnings);
  }, [metrics]);

  return warnings;
}

// Performance optimization utilities
export class PerformanceOptimizer {
  // Debounce function for expensive operations
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for frequent events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memoization for expensive calculations
  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Batch DOM updates
  static batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  // Optimize images for performance
  static optimizeImage(src: string, width?: number, height?: number): string {
    // This would integrate with image optimization services
    // For now, return original src
    return src;
  }
}

// React hooks for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T>(callback);
  const lastRan = useRef<number>(0);

  useEffect(() => {
    throttledCallback.current = callback;
  });

  return useCallback(((...args: Parameters<T>) => {
    if (lastRan.current === 0) {
      throttledCallback.current?.(...args);
      lastRan.current = Date.now();
    } else {
      const timerId = setTimeout(() => {
        if (Date.now() - lastRan.current >= delay) {
          throttledCallback.current?.(...args);
          lastRan.current = Date.now();
        }
      }, delay - (Date.now() - lastRan.current));
      
      // Clear previous timer if exists
      clearTimeout(timerId);
    }
  }) as T, [delay]);
}

// Memory leak detection
export function useMemoryLeakDetection(componentName: string) {
  const mountTime = useRef<number>(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountTime.current = Date.now();
    
    // Check for memory leaks every 30 seconds
    intervalId.current = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
        
        if (memoryUsage > 150) { // More than 150MB
          console.warn(`Potential memory leak in ${componentName}. Memory usage: ${memoryUsage.toFixed(2)}MB`);
        }
      }
    }, 30000);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      
      const unmountTime = Date.now();
      const componentLifetime = unmountTime - (mountTime.current || 0);
      
      if (componentLifetime > 300000) { // More than 5 minutes
        console.info(`Long-lived component ${componentName} unmounted after ${componentLifetime}ms`);
      }
    };
  }, [componentName]);
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Use string-based dynamic import to avoid TypeScript module resolution issues
      const analyzerModuleName = 'webpack-bundle-analyzer';
      
      // @ts-ignore - Dynamic import for optional dev dependency
      import(analyzerModuleName).then((module: any) => {
        console.log('Bundle analyzer available. Run with ANALYZE=true to analyze bundle size.');
      }).catch(() => {
        console.log('Bundle analyzer not available in this environment.');
      });
    } catch (error) {
      console.log('Bundle analyzer not available in this environment.');
    }
  }
}

// Performance testing utilities
export class PerformanceTester {
  static async measureAsyncOperation<T>(
    operation: () => Promise<T>,
    name: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  }

  static measureSyncOperation<T>(
    operation: () => T,
    name: string
  ): { result: T; duration: number } {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  }

  static async runPerformanceTest(
    testName: string,
    testFunction: () => Promise<void> | void,
    iterations: number = 100
  ): Promise<{ average: number; min: number; max: number }> {
    const durations: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFunction();
      const end = performance.now();
      durations.push(end - start);
    }
    
    const average = durations.reduce((sum, duration) => sum + duration, 0) / iterations;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    console.log(`Performance test "${testName}":`, {
      average: `${average.toFixed(2)}ms`,
      min: `${min.toFixed(2)}ms`,
      max: `${max.toFixed(2)}ms`,
      iterations,
    });
    
    return { average, min, max };
  }
}