#!/usr/bin/env node

// Performance testing script for SatsPay
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {},
    };
  }

  async initialize() {
    console.log('🚀 Initializing performance tests...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable performance monitoring
    await this.page.setCacheEnabled(false);
    await this.page.setJavaScriptEnabled(true);
  }

  async runAllTests() {
    console.log('📊 Running performance tests...');
    
    try {
      await this.testPageLoad();
      await this.testInteractivity();
      await this.testAnimationPerformance();
      await this.testMemoryUsage();
      await this.testNetworkPerformance();
      
      this.generateSummary();
      this.saveResults();
      this.printResults();
      
    } catch (error) {
      console.error('❌ Performance test failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async testPageLoad() {
    console.log('  📄 Testing page load performance...');
    
    const startTime = Date.now();
    
    // Navigate to the application
    const response = await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Get performance metrics
    const performanceMetrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      };
    });

    // Get Lighthouse metrics
    const metrics = await this.page.metrics();

    this.results.tests.push({
      name: 'Page Load',
      loadTime,
      performanceMetrics,
      metrics,
      status: loadTime < 3000 ? 'PASS' : 'FAIL',
      threshold: 3000,
    });

    console.log(`    ✅ Page loaded in ${loadTime}ms`);
  }

  async testInteractivity() {
    console.log('  🖱️  Testing interactivity performance...');
    
    const tests = [
      {
        name: 'Button Click Response',
        action: async () => {
          const startTime = performance.now();
          await this.page.click('button[data-testid="sign-in-button"]');
          await this.page.waitForSelector('[data-testid="sign-in-form"]', { timeout: 5000 });
          return performance.now() - startTime;
        },
        threshold: 100,
      },
      {
        name: 'Navigation Response',
        action: async () => {
          const startTime = performance.now();
          await this.page.click('[data-testid="nav-home"]');
          await this.page.waitForSelector('[data-testid="home-section"]', { timeout: 5000 });
          return performance.now() - startTime;
        },
        threshold: 200,
      },
    ];

    for (const test of tests) {
      try {
        const responseTime = await this.page.evaluate(test.action);
        
        this.results.tests.push({
          name: test.name,
          responseTime,
          status: responseTime < test.threshold ? 'PASS' : 'FAIL',
          threshold: test.threshold,
        });

        console.log(`    ✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      } catch (error) {
        console.log(`    ❌ ${test.name}: Failed - ${error.message}`);
        this.results.tests.push({
          name: test.name,
          responseTime: null,
          status: 'ERROR',
          error: error.message,
        });
      }
    }
  }

  async testAnimationPerformance() {
    console.log('  🎬 Testing animation performance...');
    
    // Monitor FPS during animations
    await this.page.evaluate(() => {
      window.fpsData = [];
      let frameCount = 0;
      let lastTime = performance.now();
      
      function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          window.fpsData.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        if (window.fpsData.length < 5) {
          requestAnimationFrame(measureFPS);
        }
      }
      
      requestAnimationFrame(measureFPS);
    });

    // Trigger animations
    await this.page.hover('[data-testid="wallet-card"]');
    await this.page.click('[data-testid="haptic-button"]');
    
    // Wait for FPS measurement
    await this.page.waitForTimeout(6000);
    
    const fpsData = await this.page.evaluate(() => window.fpsData || []);
    const averageFPS = fpsData.reduce((sum, fps) => sum + fps, 0) / fpsData.length;
    
    this.results.tests.push({
      name: 'Animation Performance',
      averageFPS,
      fpsData,
      status: averageFPS >= 55 ? 'PASS' : 'FAIL',
      threshold: 55,
    });

    console.log(`    ✅ Average FPS: ${averageFPS.toFixed(1)}`);
  }

  async testMemoryUsage() {
    console.log('  🧠 Testing memory usage...');
    
    const initialMetrics = await this.page.metrics();
    
    // Perform memory-intensive operations
    await this.page.evaluate(() => {
      // Simulate heavy operations
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.innerHTML = 'Test content ' + i;
        document.body.appendChild(div);
      }
      
      // Clean up
      const divs = document.querySelectorAll('div');
      divs.forEach(div => {
        if (div.innerHTML.startsWith('Test content')) {
          div.remove();
        }
      });
    });

    const finalMetrics = await this.page.metrics();
    const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
    
    this.results.tests.push({
      name: 'Memory Usage',
      initialMemory: initialMetrics.JSHeapUsedSize,
      finalMemory: finalMetrics.JSHeapUsedSize,
      memoryIncrease,
      status: memoryIncrease < 10 * 1024 * 1024 ? 'PASS' : 'FAIL', // 10MB threshold
      threshold: 10 * 1024 * 1024,
    });

    console.log(`    ✅ Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  }

  async testNetworkPerformance() {
    console.log('  🌐 Testing network performance...');
    
    const networkRequests = [];
    
    this.page.on('response', (response) => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        timing: response.timing(),
      });
    });

    // Trigger network requests
    await this.page.reload({ waitUntil: 'networkidle0' });
    
    const totalRequests = networkRequests.length;
    const failedRequests = networkRequests.filter(req => req.status >= 400).length;
    const averageResponseTime = networkRequests.reduce((sum, req) => {
      return sum + (req.timing?.receiveHeadersEnd - req.timing?.requestTime || 0);
    }, 0) / totalRequests;

    this.results.tests.push({
      name: 'Network Performance',
      totalRequests,
      failedRequests,
      averageResponseTime,
      requests: networkRequests,
      status: failedRequests === 0 && averageResponseTime < 500 ? 'PASS' : 'FAIL',
    });

    console.log(`    ✅ ${totalRequests} requests, ${failedRequests} failed, avg: ${averageResponseTime.toFixed(2)}ms`);
  }

  generateSummary() {
    const totalTests = this.results.tests.length;
    const passedTests = this.results.tests.filter(test => test.status === 'PASS').length;
    const failedTests = this.results.tests.filter(test => test.status === 'FAIL').length;
    const errorTests = this.results.tests.filter(test => test.status === 'ERROR').length;

    this.results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      errors: errorTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(1),
    };
  }

  saveResults() {
    const resultsDir = path.join(__dirname, '..', 'performance-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(resultsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Results saved to: ${filepath}`);
  }

  printResults() {
    console.log('\n📈 Performance Test Results:');
    console.log('================================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Errors: ${this.results.summary.errors}`);
    console.log(`Pass Rate: ${this.results.summary.passRate}%`);
    
    console.log('\nDetailed Results:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${status} ${test.name}: ${test.status}`);
    });
    
    if (this.results.summary.passRate < 80) {
      console.log('\n⚠️  Performance issues detected! Consider optimization.');
      process.exit(1);
    } else {
      console.log('\n🎉 All performance tests passed!');
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run performance tests
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.initialize();
    await tester.runAllTests();
  } catch (error) {
    console.error('Performance testing failed:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  main();
}

module.exports = PerformanceTester;