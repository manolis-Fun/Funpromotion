# Performance Diagnosis Plan

## Repository Analysis Summary
- **Framework**: Next.js 14.0.4 with App Router
- **Key Issue**: Header collapse lag on scroll (Navbar component at src/components/layout/navbar.jsx)
- **Project Type**: SSG with client-side interactions
- **Package Manager**: yarn

## Identified Performance Concerns

### Header Component Analysis
The Navbar component (line 129 in navbar.jsx) has several performance issues:

1. **Non-passive scroll listener** (lines 31-39)
   - Scroll event fires on main thread without throttling
   - Updates state on every scroll event
   
2. **Complex conditional rendering** (line 129)
   - Multiple CSS transitions and opacity changes
   - Height animations that trigger layout recalculation

3. **Multiple client components** in layout
   - Header, Navbar, and Providers are all client components
   - Large hydration boundary

## Hypotheses for Header Lag

### H1: Main Thread Blocking - Scroll Handler
- **Symptom**: Jank during scroll
- **Tool**: Chrome Performance Profiler
- **Metric**: Long Task duration, FPS drops
- **Check**: Record scrolling, look for yellow/red bars in main thread

### H2: Layout Thrashing - CSS Transitions
- **Symptom**: Visual stutter on collapse
- **Tool**: Chrome DevTools Performance Monitor
- **Metric**: Layout recalculations per second
- **Check**: Enable Layout Shift Regions, record scroll

### H3: React Re-render Cascade
- **Symptom**: Multiple component updates on scroll
- **Tool**: React Developer Tools Profiler
- **Metric**: Component render count and duration
- **Check**: Profile during scroll, check render waterfall

### H4: Large Initial Bundle
- **Symptom**: Slow hydration affecting interactivity
- **Tool**: Next.js Bundle Analyzer
- **Metric**: JS bundle size, especially for header components
- **Check**: ANALYZE=true yarn build

### H5: Non-optimized CSS Properties
- **Symptom**: GPU acceleration not utilized
- **Tool**: Chrome Rendering tab
- **Metric**: Paint and composite counts
- **Check**: Check for transform vs top/height animations

## Measurement Tools & Commands

1. **Lighthouse**
   ```bash
   npx lighthouse http://localhost:3000 --output=json --output-path=./perf/baseline/lighthouse.json
   ```

2. **Bundle Analysis**
   ```bash
   ANALYZE=true yarn build
   ```

3. **Web Vitals Collection**
   - Create custom script to measure INP during scroll
   - Log CLS during header collapse

4. **Performance Trace**
   - Manual Chrome DevTools recording
   - Focus on first 5 seconds after load + scroll action

## Acceptance Criteria

1. **Visual**: No perceptible lag on header collapse (tested on mid-range device)
2. **INP**: < 200ms during scroll interactions
3. **FPS**: Maintain 60fps during scroll
4. **CLS**: < 0.1 during header transitions
5. **Bundle Size**: No increase > 5KB for fixes

## Fix Priority (Expected)

1. Implement passive scroll listeners with throttling
2. Convert CSS transitions to GPU-accelerated transforms
3. Memoize header component to prevent unnecessary re-renders
4. Consider moving more logic to server components
5. Implement will-change hints for animated properties

## Next Steps

1. Run baseline measurements
2. Create performance trace of the issue
3. Analyze data and confirm root cause
4. Implement targeted fixes
5. Verify improvements with same tools