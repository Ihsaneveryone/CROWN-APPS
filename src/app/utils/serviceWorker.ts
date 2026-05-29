// 🚀 Service Worker Registration for EXTREME performance
// NOTE: Service Worker is optional - app works perfectly without it!

export async function registerServiceWorker() {
  // Skip Service Worker in Figma Make environment (not supported)
  if (window.location.hostname.includes('figma.site')) {
    console.log('ℹ️  Service Worker skipped (Figma environment)');
    console.log('✅ App uses localStorage caching instead - still VERY fast!');
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      // Check if service-worker.js exists first
      const swCheck = await fetch('/service-worker.js', { method: 'HEAD' }).catch(() => null);
      
      if (!swCheck || !swCheck.ok) {
        console.log('ℹ️  Service Worker not available (file not found)');
        console.log('✅ App uses localStorage caching instead - still VERY fast!');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker update found!');
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New Service Worker installed! Refresh to use new version.');
              
              // Optionally show notification to user
              if (confirm('Update tersedia! Refresh halaman untuk menggunakan versi terbaru?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.log('ℹ️  Service Worker registration skipped:', (error as Error).message);
      console.log('✅ App uses localStorage caching instead - still VERY fast!');
      return null;
    }
  } else {
    console.log('ℹ️  Service Worker not supported in this browser');
    console.log('✅ App uses localStorage caching instead - still VERY fast!');
    return null;
  }
}

// Unregister service worker (for debugging)
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('🗑️ Service Worker unregistered');
    }
  }
}

// Check if offline
export function isOffline(): boolean {
  return !navigator.onLine;
}

// Wait for online
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}

// Request persistent storage (prevent cache eviction)
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`📦 Persistent storage: ${isPersisted ? 'Granted' : 'Denied'}`);
    return isPersisted;
  }
  return false;
}

// Estimate storage usage
export async function estimateStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (used / quota) * 100 : 0;
    
    console.log(`💾 Storage: ${(used / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${percentUsed.toFixed(1)}%)`);
    
    return { used, quota, percentUsed };
  }
  return { used: 0, quota: 0, percentUsed: 0 };
}