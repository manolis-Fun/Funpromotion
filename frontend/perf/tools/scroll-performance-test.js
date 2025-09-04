// Scroll Performance Test
// This script measures the performance impact of the header scroll collapse

function measureScrollPerformance() {
  console.log('=== Scroll Performance Test ===');
  
  let frameCount = 0;
  let droppedFrames = 0;
  let startTime = performance.now();
  let lastFrameTime = startTime;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' && entry.name.includes('scroll')) {
        console.log(`Scroll handler took: ${entry.duration.toFixed(2)}ms`);
      }
    }
  });
  observer.observe({ entryTypes: ['measure'] });

  function measureFrameRate() {
    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTime;
    
    frameCount++;
    if (timeSinceLastFrame > 16.67) { // 60fps = 16.67ms per frame
      droppedFrames++;
    }
    
    lastFrameTime = now;
    
    // Stop after 3 seconds
    if (now - startTime < 3000) {
      requestAnimationFrame(measureFrameRate);
    } else {
      const totalTime = now - startTime;
      const fps = (frameCount / totalTime) * 1000;
      const dropPercentage = (droppedFrames / frameCount) * 100;
      
      console.log(`\n=== Results ===`);
      console.log(`Total frames: ${frameCount}`);
      console.log(`Average FPS: ${fps.toFixed(1)}`);
      console.log(`Dropped frames: ${droppedFrames} (${dropPercentage.toFixed(1)}%)`);
      console.log(`Duration: ${(totalTime / 1000).toFixed(1)}s`);
    }
  }
  
  // Start measuring
  requestAnimationFrame(measureFrameRate);
  
  // Simulate scroll events
  let scrollPosition = 0;
  const scrollInterval = setInterval(() => {
    scrollPosition += 10;
    window.scrollTo(0, scrollPosition);
    
    if (scrollPosition > 300) {
      clearInterval(scrollInterval);
    }
  }, 16);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 4000);
  });
}

// Run the test
if (typeof window !== 'undefined') {
  // Wait for page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      measureScrollPerformance();
    }, 1000);
  });
}

export default measureScrollPerformance;