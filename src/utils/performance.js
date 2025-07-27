// Performance monitoring utilities

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  const vitals = {
    FCP: null,  // First Contentful Paint
    LCP: null,  // Largest Contentful Paint
    FID: null,  // First Input Delay
    CLS: null   // Cumulative Layout Shift
  };

  // Track FCP
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        vitals.FCP = entry.startTime;
        console.log('FCP:', entry.startTime);
      }
    }
  });
  observer.observe({ entryTypes: ['paint'] });

  // Track LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    vitals.LCP = lastEntry.startTime;
    console.log('LCP:', lastEntry.startTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Track FID
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      vitals.FID = entry.processingStart - entry.startTime;
      console.log('FID:', vitals.FID);
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Track CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        vitals.CLS = clsValue;
        console.log('CLS:', clsValue);
      }
    }
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // Analytics tracking removed
}

// Resource loading performance
export function trackResourceTiming() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');

    console.log('Navigation Timing:', {
      DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
      TCP: navigation.connectEnd - navigation.connectStart,
      Request: navigation.responseStart - navigation.requestStart,
      Response: navigation.responseEnd - navigation.responseStart,
      DOM: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      Load: navigation.loadEventEnd - navigation.loadEventStart
    });

    // Track slow resources
    const slowResources = resources.filter(resource => resource.duration > 1000);
    if (slowResources.length > 0) {
      console.warn('Slow resources:', slowResources.map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize
      })));
    }
  });
}

// Memory usage tracking
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = performance.memory;
  console.log('Memory Usage:', {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
  });
}

// Image loading performance
export function trackImageLoading() {
  if (typeof window === 'undefined') return;

  const imageObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.initiatorType === 'img') {
        const loadTime = entry.responseEnd - entry.startTime;
        if (loadTime > 500) { // Slow image threshold
          console.warn('Slow image:', {
            url: entry.name,
            loadTime: Math.round(loadTime),
            size: entry.transferSize
          });
        }
      }
    }
  });
  imageObserver.observe({ entryTypes: ['resource'] });
}

// Initialize all tracking
export function initPerformanceTracking() {
  if (typeof window === 'undefined') return;

  trackWebVitals();
  trackResourceTiming();
  trackMemoryUsage();
  trackImageLoading();

  // Track performance every 30 seconds
  setInterval(() => {
    trackMemoryUsage();
  }, 30000);
}