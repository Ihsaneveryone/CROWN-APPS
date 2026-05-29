import { QueryClient } from '@tanstack/react-query';

// SUPER OPTIMIZED Query client - WHATSAPP-LEVEL PERFORMANCE!
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ ULTRA LIGHTWEIGHT: Super aggressive caching untuk jaringan lemah
      staleTime: 15 * 60 * 1000, // 15 MENIT - data tetap fresh lebih lama (kurangi network request!)
      gcTime: 24 * 60 * 60 * 1000, // 24 JAM - keep in memory sepanjang hari

      // 🚀 OFFLINE-FIRST: Pakai cache dulu, network belakangan
      refetchOnWindowFocus: false, // TIDAK pernah refetch saat focus
      refetchOnMount: false, // Pakai cache SELALU!
      refetchOnReconnect: false, // TIDAK refetch saat online (hemat bandwidth!)

      // 💪 MINIMAL RETRY: Cepat failover ke cache
      retry: 1, // Hanya 1 retry untuk kecepatan maksimal
      retryDelay: 300, // 300ms delay - sangat cepat!

      // 🎯 OFFLINE-FIRST: Cache prioritas utama
      networkMode: 'offlineFirst',

      // ⚡ INSTANT: Gunakan data lama saat loading
      placeholderData: (previousData: any) => previousData,
    },
    mutations: {
      // 🔥 OPTIMISTIC UI: Update UI instant, sync belakangan
      retry: 1, // Hanya 1 retry
      retryDelay: 500, // 500ms delay
      networkMode: 'offlineFirst',

      // Silent errors - offline queue akan handle
      onError: (error) => {
        console.log('Mutation error (queued):', error);
      },
    },
  },
});

// Prefetch helper untuk instant loading
export const prefetchQueries = {
  indicators: (branchId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['indicators', branchId],
      staleTime: 5 * 60 * 1000,
    });
  },
  submissions: (branchId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['submissions', branchId],
      staleTime: 5 * 60 * 1000,
    });
  },
  settings: (branchId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['settings', branchId],
      staleTime: 5 * 60 * 1000,
    });
  },
};

// Clear old cache periodically (cleanup for memory) - OPTIMIZED: Less frequent
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  // Clear localStorage entries older than 24 hours
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('indicators_') || key.startsWith('settings_') || key.startsWith('submissions_')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && now - parsed.timestamp > maxAge) {
            localStorage.removeItem(key);
            console.log(`🧹 Cleaned old cache: ${key}`);
          }
        }
      } catch (e) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    }
  });
}, 6 * 60 * 60 * 1000); // OPTIMIZED: Run every 6 hours instead of 1 hour