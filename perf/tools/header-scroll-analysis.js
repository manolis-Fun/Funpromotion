// Header scroll performance analysis
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function analyzeHeaderScroll(url = 'http://localhost:3000') {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--enable-precise-memory-info']
  });
  const page = await browser.newPage();
  
  // Enable CDP domains
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');
  await client.send('Runtime.enable');
  
  // Set viewport to simulate mid-range device
  await page.setViewport({ width: 1366, height: 768 });
  
  // Start performance trace
  await page.tracing.start({ 
    path: path.join(__dirname, '..', 'baseline', 'header-scroll-trace.json'),
    screenshots: true,
    categories: ['devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline.frame']
  });
  
  // Navigate to page
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);
  
  // Inject performance monitoring
  await page.evaluate(() => {
    window.performanceMetrics = {
      scrollHandlerDurations: [],
      layoutRecalculations: 0,
      styleRecalculations: 0,
      paintCount: 0,
      compositeCount: 0,
      longTasks: []
    };
    
    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          window.performanceMetrics.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
    
    // Monitor layout/style recalculations
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      window.performanceMetrics.layoutRecalculations++;
      return originalGetBoundingClientRect.call(this);
    };
    
    // Track scroll handler duration
    let scrollHandlerStart = 0;
    const scrollHandler = (e) => {
      if (scrollHandlerStart) {
        const duration = performance.now() - scrollHandlerStart;
        window.performanceMetrics.scrollHandlerDurations.push(duration);
      }
      scrollHandlerStart = performance.now();
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  });
  
  // Perform scroll test
  console.log('Starting scroll test...');
  
  // Record initial metrics
  const initialMetrics = await client.send('Performance.getMetrics');
  
  // Scroll down slowly to trigger header collapse
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 20));
    await page.waitForTimeout(50);
  }
  
  // Wait for animations
  await page.waitForTimeout(500);
  
  // Scroll back up
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  // Get final metrics
  const finalMetrics = await client.send('Performance.getMetrics');
  const jsHeapUsed = await page.evaluate(() => performance.memory?.usedJSHeapSize);
  const customMetrics = await page.evaluate(() => window.performanceMetrics);
  
  // Stop tracing
  await page.tracing.stop();
  
  // Capture screenshot of header state
  await page.screenshot({ 
    path: path.join(__dirname, '..', 'baseline', 'header-collapsed.png'),
    fullPage: false
  });
  
  await browser.close();
  
  // Process metrics
  const metricsMap = {};
  initialMetrics.metrics.forEach(m => { metricsMap[m.name] = { initial: m.value }; });
  finalMetrics.metrics.forEach(m => { 
    if (metricsMap[m.name]) {
      metricsMap[m.name].final = m.value;
      metricsMap[m.name].delta = m.value - metricsMap[m.name].initial;
    }
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    url,
    metrics: metricsMap,
    customMetrics,
    jsHeapUsed: Math.round(jsHeapUsed / 1048576) + ' MB',
    summary: {
      layoutCount: metricsMap.LayoutCount?.delta || 0,
      recalcStyleCount: metricsMap.RecalcStyleCount?.delta || 0,
      scriptDuration: Math.round(metricsMap.ScriptDuration?.delta * 1000) + ' ms',
      layoutDuration: Math.round(metricsMap.LayoutDuration?.delta * 1000) + ' ms',
      longTaskCount: customMetrics.longTasks.length,
      avgScrollHandlerDuration: customMetrics.scrollHandlerDurations.length > 0 
        ? Math.round(customMetrics.scrollHandlerDurations.reduce((a, b) => a + b) / customMetrics.scrollHandlerDurations.length * 100) / 100 
        : 0
    }
  };
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'baseline', 'header-analysis.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\nHeader Scroll Analysis Results:');
  console.log('--------------------------------');
  console.log('Layout operations during scroll:', results.summary.layoutCount);
  console.log('Style recalculations:', results.summary.recalcStyleCount);
  console.log('Script execution time:', results.summary.scriptDuration);
  console.log('Layout duration:', results.summary.layoutDuration);
  console.log('Long tasks detected:', results.summary.longTaskCount);
  console.log('Avg scroll handler duration:', results.summary.avgScrollHandlerDuration + ' ms');
  console.log(`\nFull results saved to: ${resultsPath}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  analyzeHeaderScroll().catch(console.error);
}

module.exports = { analyzeHeaderScroll };