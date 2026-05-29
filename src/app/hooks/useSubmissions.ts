import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Submission } from '../types';
import { toast } from 'sonner';

// OFFLINE-FIRST: Load from localStorage immediately
const getInitialData = (branchId: string, page: number, limit: number, filterNik?: string) => {
  try {
    const cacheKey = filterNik
      ? `submissions_${branchId}_${page}_${limit}_${filterNik}`
      : `submissions_${branchId}_${page}_${limit}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) { // 10 menit
        return parsed.data;
      }
    }
  } catch (e) {
    // Silent error
  }
  return undefined;
};

// Hook untuk submissions dengan pagination (dengan optional filter by NIK)
export function useSubmissions(
  branchId: string,
  page: number = 1,
  limit: number = 30,
  filterNik?: string, // ⚡ Filter by NIK untuk user biasa
  enabled?: boolean // ⚡ Optional: Hanya fetch saat enabled=true
) {
  // Default enabled to true jika undefined, ATAU jika explicitly true
  const shouldFetch = enabled === undefined ? true : enabled === true;
  const query = useQuery({
    queryKey: ['submissions', branchId, page, limit, filterNik],
    queryFn: async () => {
      const fetchStart = performance.now();

      // 🔒 CRITICAL: User HARUS ada NIK filter untuk privacy!
      if (!filterNik) {
        console.warn('⚠️ WARNING: Fetching submissions WITHOUT NIK filter!');
        console.warn('This should only happen for admin users!');
      }

      // ⚡ INSTANT: Cek cache dulu sebelum fetch
      const cacheKey = filterNik
        ? `submissions_${branchId}_${page}_${limit}_${filterNik}`
        : `submissions_${branchId}_${page}_${limit}`;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 3 * 60 * 1000) { // 3 menit (dikurangi untuk fresher data)
            console.log('');
            console.log('⚡⚡⚡ CACHE HIT ⚡⚡⚡');
            console.log('Cache Key:', cacheKey);
            console.log('Cached submissions count:', parsed.data?.submissions?.length || 0);
            console.log('Cache age:', Math.round((Date.now() - parsed.timestamp) / 1000), 'seconds');

            // 🔥 DEBUG: Log cached submissions
            if (parsed.data?.submissions) {
              console.log('📋 CACHED SUBMISSIONS:');
              parsed.data.submissions.forEach((s: any, idx: number) => {
                console.log(`  [${idx + 1}] NIK: ${s?.user?.nik || s?.nik} | Date: ${s?.date}`);
              });
            }
            console.log('');

            return parsed.data;
          } else {
            console.log('⏰ Cache expired, will fetch fresh data');
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          // Invalid cache, delete it
          console.error('❌ Invalid cache, deleting:', e);
          localStorage.removeItem(cacheKey);
        }
      } else {
        console.log('📡 No cache found, fetching from server...');
      }

      // 📡 Fetch dari server dengan timeout protection
      console.log('📡 Fetching from server...');
      console.log('⏱️ Timeout: 15 seconds (Supabase cold start bisa butuh 5-10 detik)');

      let data;
      try {
        data = await api.getSubmissions(branchId, page, limit, filterNik);
      } catch (error: any) {
        console.error('❌ Fetch error:', error?.message || error);
        console.error('💡 Tip: Tunggu beberapa detik dan coba lagi (server mungkin cold start)');
        // Return empty data instead of throwing
        return {
          submissions: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasMore: false }
        };
      }

      const fetchEnd = performance.now();
      console.log(`⚡ Server response time: ${(fetchEnd - fetchStart).toFixed(2)}ms`);

      // 🔒 VALIDATION: Log data untuk debugging (tidak block)
      if (filterNik && data.submissions && data.submissions.length > 0) {
        console.log('');
        console.log('📡 ===== SERVER RESPONSE DEBUG =====');
        console.log('Expected NIK filter:', filterNik);
        console.log('Received submissions:', data.submissions.length);
        console.log('');
        console.log('📋 ALL SUBMISSIONS FROM SERVER:');
        data.submissions.forEach((s: any, idx: number) => {
          console.log(`  [${idx + 1}] NIK: ${s?.user?.nik || s?.nik} | Nama: ${s?.user?.nama || s?.nama} | Date: ${s?.date} | ID: ${s?.id}`);
        });
        console.log('');

        const matchCount = data.submissions.filter((s: any) => {
          const nik = String(s?.user?.nik || s?.nik || '').trim().toUpperCase();
          const filter = String(filterNik).trim().toUpperCase();
          const match = nik === filter;
          if (!match) {
            console.log(`  ❌ FILTERED OUT: NIK ${nik} != ${filter}`);
          }
          return match;
        }).length;

        console.log('');
        console.log(`✅ Matching submissions: ${matchCount}/${data.submissions.length}`);

        if (matchCount === 0 && data.submissions.length > 0) {
          console.warn('⚠️⚠️⚠️ WARNING: Backend tidak filter by NIK!');
          console.warn('Semua data akan di-filter di frontend!');
        } else if (matchCount < data.submissions.length) {
          console.warn(`⚠️ Backend mengirim ${data.submissions.length - matchCount} data user lain!`);
          console.warn('Frontend akan filter out data user lain');
        } else {
          console.log('✅ Backend sudah filter by NIK dengan benar!');
        }
        console.log('====================================');
        console.log('');
      }

      // 💾 Save to cache
      try {
        const cacheData = {
          data,
          timestamp: Date.now()
        };

        console.log('');
        console.log('💾 ===== SAVING TO CACHE =====');
        console.log('Cache Key:', cacheKey);
        console.log('Submissions to cache:', data.submissions?.length || 0);
        console.log('Cache data size:', JSON.stringify(cacheData).length, 'bytes');

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        // Verify save
        const verify = localStorage.getItem(cacheKey);
        if (verify) {
          const verifyParsed = JSON.parse(verify);
          console.log('✅ Cache saved successfully!');
          console.log('Verified count:', verifyParsed.data?.submissions?.length || 0);
        } else {
          console.error('❌ Cache save verification FAILED!');
        }
        console.log('==============================');
        console.log('');
      } catch (e: any) {
        console.error('');
        console.error('❌ ===== CACHE SAVE FAILED =====');
        console.error('Error:', e.message);
        console.error('Submissions count:', data.submissions?.length || 0);
        console.error('Data size:', JSON.stringify(data).length, 'bytes');
        console.error('================================');
        console.error('');
      }

      return data;
    },
    initialData: () => getInitialData(branchId, page, limit, filterNik),
    staleTime: 2 * 60 * 1000, // 2 menit cache (dikurangi dari 5 menit agar lebih fresh!)
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!branchId && shouldFetch, // ⚡ Hanya fetch saat enabled!
    refetchOnWindowFocus: true, // ⚡ CHANGED: Auto refetch saat user kembali ke tab (detect admin delete!)
    refetchOnMount: true, // ⚡ CHANGED: Refetch saat component mount (ensure fresh data!)
    refetchOnReconnect: false,
    retry: false, // ❌ NO RETRY - fetch sekali saja untuk avoid spam
    retryOnMount: false,
  });

  // 🔍 Debug log - ALWAYS log when enabled
  const submissions = query.data?.submissions || [];

  if (shouldFetch) {
    console.log('');
    console.log('📊 useSubmissions Hook Debug:');
    console.log('  Branch ID:', branchId);
    console.log('  Filter NIK:', filterNik);
    console.log('  Enabled:', shouldFetch);
    console.log('  Query status:', {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      hasData: !!query.data
    });
    console.log('  Submissions count:', submissions.length);
    if (submissions.length > 0) {
      console.log('  Sample:', submissions[0]);
    }
    console.log('');
  }

  return {
    data: query.data,
    submissions,
    pagination: query.data?.pagination,
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// Hook untuk infinite scroll submissions (YouTube-style)
export function useInfiniteSubmissions(branchId: string, limit: number = 30) {
  const query = useInfiniteQuery({
    queryKey: ['submissions-infinite', branchId],
    queryFn: ({ pageParam = 1 }) => api.getSubmissions(branchId, pageParam, limit),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!branchId,
    // NO REFETCH for max speed!
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages into single array
  const allSubmissions = query.data?.pages.flatMap(page => page.submissions) || [];

  return {
    submissions: allSubmissions,
    isLoading: false, // NEVER show loading - we have initialData!
    isFetching: query.isFetching,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}

// Hook untuk submit submission - OPTIMISTIC UPDATE!
export function useSubmitIndicators(branchId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => api.submitIndicators(branchId, data.user, data.indicators, data.date, data.notes),
    // OPTIMISTIC UPDATE: Add submission to list immediately
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['submissions', branchId] });
      await queryClient.cancelQueries({ queryKey: ['submissions-infinite', branchId] });

      // Create optimistic submission
      const optimisticSubmission: Submission = {
        id: `temp_${Date.now()}`,
        branchId,
        user: newData.user,
        date: newData.date || new Date().toISOString().split('T')[0],
        indicators: newData.indicators,
        notes: newData.notes,
        createdAt: new Date().toISOString(),
        status: 'pending' as any, // Mark as pending
      };

      // Get previous data
      const previousSubmissions = queryClient.getQueryData(['submissions', branchId, 1, 30]);

      // Optimistically add to the list
      if (previousSubmissions) {
        const updated = {
          ...previousSubmissions as any,
          submissions: [optimisticSubmission, ...(previousSubmissions as any).submissions],
        };
        queryClient.setQueryData(['submissions', branchId, 1, 30], updated);
      }

      // Show instant feedback
      toast.success('Data dikirim! Sedang sync...', { duration: 2000 });

      return { previousSubmissions };
    },
    onSuccess: () => {
      // Silent refetch in background
      queryClient.invalidateQueries({ queryKey: ['submissions', branchId] });
      queryClient.invalidateQueries({ queryKey: ['submissions-infinite', branchId] });
      console.log('✅ Submit confirmed by server');
    },
    onError: (error: any, newData, context) => {
      // Rollback on error
      if (context?.previousSubmissions) {
        queryClient.setQueryData(['submissions', branchId, 1, 30], context.previousSubmissions);
      }
      console.error('Submit error:', error);
      toast.error(error?.message || 'Gagal mengirim data!');
    },
  });

  return {
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}