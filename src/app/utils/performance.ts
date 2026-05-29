// 🚀 PERFORMANCE MONITORING - Track and optimize everything!

interface PerformanceMetrics {
  loadTime: number;
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  bytesTransferred: number;
  bytesFromCache: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    bytesTransferred: 0,
    bytesFromCache: 0,
  };

  private startTime: number = Date.now();

  // Track API call
  trackAPICall(bytes: number, fromCache: boolean = false) {
    this.metrics.apiCalls++;
    
    if (fromCache) {
      this.metrics.cacheHits++;
      this.metrics.bytesFromCache += bytes;
      console.log(`⚡ Cache HIT - Saved ${(bytes / 1024).toFixed(2)} KB`);
    } else {
      this.metrics.cacheMisses++;
      this.metrics.bytesTransferred += bytes;
      console.log(`📡 Network - Transferred ${(bytes / 1024).toFixed(2)} KB`);
    }
  }

  // Get cache hit rate
  getCacheHitRate(): number {
    if (this.metrics.apiCalls === 0) return 0;
    return (this.metrics.cacheHits / this.metrics.apiCalls) * 100;
  }

  // Get data savings
  getDataSavings(): number {
    const total = this.metrics.bytesTransferred + this.metrics.bytesFromCache;
    if (total === 0) return 0;
    return (this.metrics.bytesFromCache / total) * 100;
  }

  // Get metrics
  getMetrics(): PerformanceMetrics & {
    uptime: number;
    cacheHitRate: number;
    dataSavings: number;
  } {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      cacheHitRate: this.getCacheHitRate(),
      dataSavings: this.getDataSavings(),
    };
  }

  // Print summary
  printSummary() {
    const metrics = this.getMetrics();
    
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('═══════════════════════════════════');
    console.log(`⏱️  Uptime: ${(metrics.uptime / 1000).toFixed(1)}s`);
    console.log(`📡 API Calls: ${metrics.apiCalls}`);
    console.log(`⚡ Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
    console.log(`💾 Data from Cache: ${(metrics.bytesFromCache / 1024).toFixed(2)} KB`);
    console.log(`📤 Data from Network: ${(metrics.bytesTransferred / 1024).toFixed(2)} KB`);
    console.log(`💰 Data Savings: ${metrics.dataSavings.toFixed(1)}%`);
    console.log('═══════════════════════════════════\n');
  }

  // Reset metrics
  reset() {
    this.metrics = {
      loadTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      bytesTransferred: 0,
      bytesFromCache: 0,
    };
    this.startTime = Date.now();
    console.log('🔄 Performance metrics reset');
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Measure function execution time
export function measureTime<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = Date.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = Date.now() - start;
      console.log(`⏱️  ${name}: ${duration}ms`);
      return value;
    }) as T;
  } else {
    const duration = Date.now() - start;
    console.log(`⏱️  ${name}: ${duration}ms`);
    return result;
  }
}

// Get network speed estimate
export async function estimateNetworkSpeed(): Promise<{
  speed: number; // KB/s
  type: 'fast' | 'medium' | 'slow' | 'very-slow';
}> {
  if (!navigator.onLine) {
    return { speed: 0, type: 'very-slow' };
  }

  // Use Network Information API if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink; // Mbps
    
    console.log(`📡 Network: ${effectiveType}, ${downlink} Mbps`);
    
    const speedKBps = downlink * 125; // Convert Mbps to KB/s
    
    let type: 'fast' | 'medium' | 'slow' | 'very-slow';
    if (speedKBps > 500) type = 'fast'; // > 4 Mbps
    else if (speedKBps > 100) type = 'medium'; // > 800 Kbps
    else if (speedKBps > 20) type = 'slow'; // > 160 Kbps
    else type = 'very-slow'; // < 160 Kbps
    
    return { speed: speedKBps, type };
  }
  
  // Fallback: Estimate based on simple ping test
  const start = Date.now();
  try {
    // Fetch a tiny file (1x1 pixel)
    await fetch('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
      method: 'GET',
      cache: 'no-cache',
    });
    
    const duration = Date.now() - start;
    const speedKBps = 1 / (duration / 1000); // Very rough estimate
    
    let type: 'fast' | 'medium' | 'slow' | 'very-slow';
    if (duration < 50) type = 'fast';
    else if (duration < 200) type = 'medium';
    else if (duration < 500) type = 'slow';
    else type = 'very-slow';
    
    return { speed: speedKBps, type };
  } catch (error) {
    return { speed: 5, type: 'very-slow' };
  }
}

// Optimize based on network speed
export async function optimizeForNetwork(): Promise<{
  imageQuality: number;
  cacheStrategy: 'aggressive' | 'normal' | 'minimal';
  prefetch: boolean;
}> {
  const { speed, type } = await estimateNetworkSpeed();
  
  let config = {
    imageQuality: 0.3,
    cacheStrategy: 'aggressive' as const,
    prefetch: true,
  };
  
  switch (type) {
    case 'fast':
      config = {
        imageQuality: 0.7,
        cacheStrategy: 'normal',
        prefetch: true,
      };
      break;
      
    case 'medium':
      config = {
        imageQuality: 0.5,
        cacheStrategy: 'normal',
        prefetch: true,
      };
      break;
      
    case 'slow':
      config = {
        imageQuality: 0.3,
        cacheStrategy: 'aggressive',
        prefetch: false,
      };
      break;
      
    case 'very-slow':
      config = {
        imageQuality: 0.2, // EXTREME compression!
        cacheStrategy: 'aggressive',
        prefetch: false,
      };
      break;
  }
  
  console.log(`🎯 Network Optimization: ${type} (${speed.toFixed(1)} KB/s)`, config);
  
  return config;
}

// Log performance metrics periodically
setInterval(() => {
  performanceMonitor.printSummary();
}, 5 * 60 * 1000); // Every 5 minutes

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
  (window as any).estimateNetworkSpeed = estimateNetworkSpeed;
  (window as any).optimizeForNetwork = optimizeForNetwork;
}
