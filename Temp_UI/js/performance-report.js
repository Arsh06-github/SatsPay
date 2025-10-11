/**
 * Performance Report Generator for SatsPay Application
 * Generates comprehensive performance and optimization reports
 */

class PerformanceReportGenerator {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    this.resourceMetrics = [];
    this.userInteractionMetrics = [];
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    console.log('📊 Initializing Performance Report Generator...');
    
    // Measure initial load metrics
    this.measureLoadMetrics();
    
    // Set up performance observers
    this.setupPerformanceObservers();
    
    // Monitor user interactions
    this.monitorUserInteractions();
    
    // Set up resource monitoring
    this.monitorResources();
    
    // Generate report after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.generatePerformanceReport();
      }, 2000);
    });
    
    console.log('✅ Performance Report Generator initialized');
  }

  /**
   * Measure initial load metrics
   */
  measureLoadMetrics() {
    // DOM Content Loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = Date.now() - this.startTime;
      });
    } else {
      this.metrics.domContentLoaded = 0; // Already loaded
    }

    // Window load
    window.addEventListener('load', () => {
      this.metrics.loadTime = Date.now() - this.startTime;
    });
  }

  /**
   * Set up performance observers
   */
  setupPerformanceObservers() {
    // Paint metrics
    if ('PerformanceObserver' in window) {
      try {
        // First Paint and First Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.metrics.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              this.metrics.cumulativeLayoutShift += entry.value;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.warn('Some performance observers not supported:', error);
      }
    }
  }

  /**
   * Monitor user interactions
   */
  monitorUserInteractions() {
    const interactionTypes = ['click', 'keydown', 'scroll', 'touchstart'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Measure interaction response time
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.userInteractionMetrics.push({
            type,
            target: event.target.tagName,
            responseTime,
            timestamp: Date.now()
          });
          
          // Keep only recent metrics
          if (this.userInteractionMetrics.length > 100) {
            this.userInteractionMetrics.shift();
          }
        });
      }, { passive: true });
    });
  }

  /**
   * Monitor resources
   */
  monitorResources() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.resourceMetrics.push({
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize || 0,
              duration: entry.duration,
              startTime: entry.startTime
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      
      // Core Web Vitals
      coreWebVitals: this.getCoreWebVitals(),
      
      // Load Performance
      loadPerformance: this.getLoadPerformance(),
      
      // Runtime Performance
      runtimePerformance: this.getRuntimePerformance(),
      
      // Resource Performance
      resourcePerformance: this.getResourcePerformance(),
      
      // User Experience Metrics
      userExperience: this.getUserExperienceMetrics(),
      
      // Browser Compatibility
      browserCompatibility: this.getBrowserCompatibility(),
      
      // Recommendations
      recommendations: this.generateRecommendations()
    };

    // Log report summary
    this.logReportSummary(report);
    
    // Store report
    this.storeReport(report);
    
    return report;
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    return {
      largestContentfulPaint: {
        value: this.metrics.largestContentfulPaint,
        rating: this.rateLCP(this.metrics.largestContentfulPaint),
        threshold: { good: 2500, needsImprovement: 4000 }
      },
      firstInputDelay: {
        value: this.metrics.firstInputDelay,
        rating: this.rateFID(this.metrics.firstInputDelay),
        threshold: { good: 100, needsImprovement: 300 }
      },
      cumulativeLayoutShift: {
        value: this.metrics.cumulativeLayoutShift,
        rating: this.rateCLS(this.metrics.cumulativeLayoutShift),
        threshold: { good: 0.1, needsImprovement: 0.25 }
      }
    };
  }

  /**
   * Get load performance metrics
   */
  getLoadPerformance() {
    return {
      domContentLoaded: this.metrics.domContentLoaded,
      windowLoad: this.metrics.loadTime,
      firstPaint: this.metrics.firstPaint,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      timeToInteractive: this.estimateTimeToInteractive()
    };
  }

  /**
   * Get runtime performance metrics
   */
  getRuntimePerformance() {
    const performanceOptimizer = window.performanceOptimizer;
    const stateManager = window.stateManager;
    
    return {
      navigationTimes: performanceOptimizer?.metrics.navigationTimes || [],
      stateUpdateTimes: performanceOptimizer?.metrics.stateUpdateTimes || [],
      storageOperationTimes: performanceOptimizer?.metrics.storageOperationTimes || [],
      memoryUsage: performanceOptimizer?.metrics.memoryUsage || [],
      userInteractions: this.analyzeUserInteractions()
    };
  }

  /**
   * Get resource performance metrics
   */
  getResourcePerformance() {
    const totalSize = this.resourceMetrics.reduce((sum, resource) => sum + resource.size, 0);
    const resourcesByType = this.groupResourcesByType();
    
    return {
      totalResources: this.resourceMetrics.length,
      totalSize: totalSize,
      resourcesByType: resourcesByType,
      slowestResources: this.getSlowestResources(),
      largestResources: this.getLargestResources()
    };
  }

  /**
   * Get user experience metrics
   */
  getUserExperienceMetrics() {
    const errorHandler = window.errorHandler;
    const compatibilityChecker = window.compatibilityChecker;
    
    return {
      errorCount: errorHandler?.errorLog.length || 0,
      errorsByType: errorHandler?.getErrorStatistics().errorsByType || {},
      browserCompatibility: compatibilityChecker?.calculateCompatibilityScore() || 0,
      averageInteractionTime: this.calculateAverageInteractionTime(),
      bounceRate: this.estimateBounceRate()
    };
  }

  /**
   * Get browser compatibility info
   */
  getBrowserCompatibility() {
    const compatibilityChecker = window.compatibilityChecker;
    
    if (compatibilityChecker) {
      return compatibilityChecker.getCompatibilityReport();
    }
    
    return {
      browser: { name: 'Unknown', version: 'Unknown' },
      compatibility: 0,
      warnings: []
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Core Web Vitals recommendations
    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'high',
        issue: 'Largest Contentful Paint is slow',
        recommendation: 'Optimize images, reduce server response time, eliminate render-blocking resources'
      });
    }
    
    if (this.metrics.firstInputDelay > 100) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'high',
        issue: 'First Input Delay is high',
        recommendation: 'Reduce JavaScript execution time, break up long tasks, use web workers'
      });
    }
    
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push({
        category: 'Core Web Vitals',
        priority: 'medium',
        issue: 'Cumulative Layout Shift is high',
        recommendation: 'Add size attributes to images, reserve space for dynamic content'
      });
    }
    
    // Resource recommendations
    const totalResourceSize = this.resourceMetrics.reduce((sum, r) => sum + r.size, 0);
    if (totalResourceSize > 2000000) { // 2MB
      recommendations.push({
        category: 'Resources',
        priority: 'medium',
        issue: 'Large total resource size',
        recommendation: 'Compress images, minify CSS/JS, implement lazy loading'
      });
    }
    
    // JavaScript recommendations
    const jsResources = this.resourceMetrics.filter(r => r.type === 'script');
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    if (totalJSSize > 500000) { // 500KB
      recommendations.push({
        category: 'JavaScript',
        priority: 'medium',
        issue: 'Large JavaScript bundle size',
        recommendation: 'Code splitting, tree shaking, remove unused dependencies'
      });
    }
    
    // Error recommendations
    const errorHandler = window.errorHandler;
    if (errorHandler && errorHandler.errorLog.length > 5) {
      recommendations.push({
        category: 'Errors',
        priority: 'high',
        issue: 'High error count detected',
        recommendation: 'Review and fix application errors, improve error handling'
      });
    }
    
    // Browser compatibility recommendations
    const compatibilityChecker = window.compatibilityChecker;
    if (compatibilityChecker && compatibilityChecker.calculateCompatibilityScore() < 80) {
      recommendations.push({
        category: 'Compatibility',
        priority: 'medium',
        issue: 'Browser compatibility issues detected',
        recommendation: 'Add polyfills, test on older browsers, provide fallbacks'
      });
    }
    
    return recommendations;
  }

  /**
   * Rating functions for Core Web Vitals
   */
  rateLCP(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  rateFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  rateCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Helper methods
   */
  estimateTimeToInteractive() {
    // Simple estimation based on load time and script execution
    return this.metrics.loadTime + 500; // Add 500ms buffer
  }

  analyzeUserInteractions() {
    if (this.userInteractionMetrics.length === 0) return {};
    
    const avgResponseTime = this.userInteractionMetrics.reduce((sum, metric) => 
      sum + metric.responseTime, 0) / this.userInteractionMetrics.length;
    
    const interactionsByType = {};
    this.userInteractionMetrics.forEach(metric => {
      if (!interactionsByType[metric.type]) {
        interactionsByType[metric.type] = [];
      }
      interactionsByType[metric.type].push(metric.responseTime);
    });
    
    return {
      totalInteractions: this.userInteractionMetrics.length,
      averageResponseTime: avgResponseTime,
      interactionsByType: interactionsByType
    };
  }

  groupResourcesByType() {
    const grouped = {};
    this.resourceMetrics.forEach(resource => {
      if (!grouped[resource.type]) {
        grouped[resource.type] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      grouped[resource.type].count++;
      grouped[resource.type].totalSize += resource.size;
      grouped[resource.type].totalDuration += resource.duration;
    });
    return grouped;
  }

  getSlowestResources() {
    return this.resourceMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  }

  getLargestResources() {
    return this.resourceMetrics
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
  }

  calculateAverageInteractionTime() {
    if (this.userInteractionMetrics.length === 0) return 0;
    
    const totalTime = this.userInteractionMetrics.reduce((sum, metric) => 
      sum + metric.responseTime, 0);
    
    return totalTime / this.userInteractionMetrics.length;
  }

  estimateBounceRate() {
    // Simple estimation based on time spent and interactions
    const timeSpent = Date.now() - this.startTime;
    const interactionCount = this.userInteractionMetrics.length;
    
    if (timeSpent < 5000 && interactionCount < 2) {
      return 'high'; // Likely bounce
    } else if (timeSpent > 30000 || interactionCount > 5) {
      return 'low'; // Engaged user
    }
    
    return 'medium';
  }

  /**
   * Log report summary
   */
  logReportSummary(report) {
    console.log('\n📊 PERFORMANCE REPORT SUMMARY');
    console.log('='.repeat(50));
    
    // Core Web Vitals
    console.log('🎯 Core Web Vitals:');
    console.log(`  LCP: ${report.coreWebVitals.largestContentfulPaint.value.toFixed(0)}ms (${report.coreWebVitals.largestContentfulPaint.rating})`);
    console.log(`  FID: ${report.coreWebVitals.firstInputDelay.toFixed(0)}ms (${report.coreWebVitals.firstInputDelay.rating})`);
    console.log(`  CLS: ${report.coreWebVitals.cumulativeLayoutShift.value.toFixed(3)} (${report.coreWebVitals.cumulativeLayoutShift.rating})`);
    
    // Load Performance
    console.log('\n⚡ Load Performance:');
    console.log(`  DOM Content Loaded: ${report.loadPerformance.domContentLoaded}ms`);
    console.log(`  Window Load: ${report.loadPerformance.windowLoad}ms`);
    console.log(`  First Contentful Paint: ${report.loadPerformance.firstContentfulPaint.toFixed(0)}ms`);
    
    // Resources
    console.log('\n📦 Resources:');
    console.log(`  Total Resources: ${report.resourcePerformance.totalResources}`);
    console.log(`  Total Size: ${(report.resourcePerformance.totalSize / 1024).toFixed(0)}KB`);
    
    // User Experience
    console.log('\n👤 User Experience:');
    console.log(`  Error Count: ${report.userExperience.errorCount}`);
    console.log(`  Browser Compatibility: ${report.userExperience.browserCompatibility}%`);
    console.log(`  Average Interaction Time: ${report.userExperience.averageInteractionTime.toFixed(2)}ms`);
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
        console.log(`     → ${rec.recommendation}`);
      });
    }
    
    console.log('='.repeat(50));
  }

  /**
   * Store performance report
   */
  storeReport(report) {
    if (window.enhancedStorageManager) {
      try {
        window.enhancedStorageManager.save('performance_report', report, { backup: false });
        console.log('📊 Performance report stored successfully');
      } catch (error) {
        console.warn('Failed to store performance report:', error);
      }
    }
  }

  /**
   * Export performance report
   */
  exportReport() {
    const report = this.generatePerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satspay-performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📊 Performance report exported');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.PerformanceReportGenerator = PerformanceReportGenerator;
  
  // Auto-initialize
  document.addEventListener('DOMContentLoaded', () => {
    const reportGenerator = new PerformanceReportGenerator();
    reportGenerator.init();
    window.performanceReportGenerator = reportGenerator;
  });
}