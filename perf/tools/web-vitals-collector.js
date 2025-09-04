// Web Vitals collector for performance measurements
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function collectWebVitals(url = 'http://localhost:3000') {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport to simulate mid-range device
  await page.setViewport({ width: 1366, height: 768 });
  
  // Collect Web Vitals
  const vitals = {};
  
  // Inject Web Vitals library
  await page.evaluateOnNewDocument(() => {
    window.webVitalsData = {};
    
    // Web Vitals collection script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    script.onload = () => {
      webVitals.onCLS((metric) => { window.webVitalsData.CLS = metric; });
      webVitals.onFID((metric) => { window.webVitalsData.FID = metric; });
      webVitals.onLCP((metric) => { window.webVitalsData.LCP = metric; });
      webVitals.onTTFB((metric) => { window.webVitalsData.TTFB = metric; });
      webVitals.onINP((metric) => { window.webVitalsData.INP = metric; });
    };
    document.head.appendChild(script);
  });
  
  // Navigate to the page
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait for initial render
  await page.waitForTimeout(2000);
  
  // Simulate scroll for INP measurement
  await page.evaluate(() => {
    window.scrollEvents = [];
    let scrollCount = 0;
    
    const scrollHandler = () => {
      scrollCount++;
      window.scrollEvents.push({
        timestamp: performance.now(),
        scrollY: window.scrollY,
        count: scrollCount
      });
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  });
  
  // Perform scroll actions
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(100);
  }
  
  // Scroll back up to trigger header collapse
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  
  // Collect all metrics
  const metrics = await page.evaluate(() => {
    return {
      webVitals: window.webVitalsData,
      scrollEvents: window.scrollEvents,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length,
        memory: performance.memory ? {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576)
        } : null
      }
    };
  });
  
  await browser.close();
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(__dirname, '..', 'baseline', `web-vitals-${timestamp}.json`);
  
  await fs.writeFile(resultsPath, JSON.stringify(metrics, null, 2));
  
  console.log('Web Vitals collected:');
  console.log('- LCP:', metrics.webVitals.LCP?.value || 'Not measured');
  console.log('- FID:', metrics.webVitals.FID?.value || 'Not measured');
  console.log('- CLS:', metrics.webVitals.CLS?.value || 'Not measured');
  console.log('- INP:', metrics.webVitals.INP?.value || 'Not measured');
  console.log('- TTFB:', metrics.webVitals.TTFB?.value || 'Not measured');
  console.log(`\nResults saved to: ${resultsPath}`);
  
  return metrics;
}

// Run if called directly
if (require.main === module) {
  collectWebVitals().catch(console.error);
}

module.exports = { collectWebVitals };