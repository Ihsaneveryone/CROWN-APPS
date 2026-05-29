/**
 * Version Check System
 * Auto-detect when code is updated and prompt user to refresh
 */

// Current app version - UPDATE INI SETIAP DEPLOY BARU!
export const APP_VERSION = '1.0.1'; // ← Bump ini setiap update code

const VERSION_CHECK_INTERVAL = 60000; // Check every 60 seconds
const VERSION_STORAGE_KEY = 'app_version';

/**
 * Initialize version check system
 */
export function initVersionCheck() {
  // Save current version
  const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

  if (!storedVersion) {
    // First time load
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    console.log('🎉 App version:', APP_VERSION);
    return;
  }

  // Check if version changed
  if (storedVersion !== APP_VERSION) {
    console.log('🔄 App version changed!');
    console.log('  Old:', storedVersion);
    console.log('  New:', APP_VERSION);

    // Clear ALL caches
    console.log('🧹 Clearing all caches due to version update...');

    // Clear localStorage (keep only auth data)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== 'app_version' && !key.includes('auth') && !key.includes('user')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Update stored version
    localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);

    console.log(`✅ Cleared ${keysToRemove.length} cache items`);
    console.log('✅ Version updated to', APP_VERSION);

    // Show notification to user
    showUpdateNotification();
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideDown 0.3s ease-out;
  `;

  notification.innerHTML = `
    <span style="font-size: 24px;">✨</span>
    <div>
      <div style="font-weight: 600; margin-bottom: 4px;">Update Available!</div>
      <div style="font-size: 12px; opacity: 0.9;">Aplikasi telah diupdate. Cache dibersihkan otomatis.</div>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Start periodic version check (check if server has new version)
 * This is optional - for now we just use the version in code
 */
export function startVersionMonitoring() {
  // For now, we just check on page load
  // Future: Could fetch version.json from server periodically
  initVersionCheck();
}
