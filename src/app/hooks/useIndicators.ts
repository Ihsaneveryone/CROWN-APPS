import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Indicator } from '../types';
import { toast } from 'sonner';

// OFFLINE-FIRST: Load from localStorage immediately
const getInitialData = (branchId: string): Indicator[] | undefined => {
  try {
    const cached = localStorage.getItem(`indicators_${branchId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still fresh (less than 24 hours)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) { // 6 hours fresh cache!
        console.log('⚡ Indicators loaded from cache instantly');
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return undefined;
};

// Custom hook untuk indicators dengan React Query
export function useIndicators(branchId: string) {
  const queryClient = useQueryClient();

  // Query untuk get indicators - OFFLINE FIRST!
  const query = useQuery({
    queryKey: ['indicators', branchId],
    queryFn: async () => {
      console.log('🔄 Fetching indicators from API...');
      const data = await api.getIndicators(branchId);
      
      // Save to localStorage for instant next load
      try {
        localStorage.setItem(`indicators_${branchId}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        console.log('✅ Indicators cached to localStorage');
      } catch (e) {
        console.error('Cache write error:', e);
      }
      
      return data;
    },
    // INSTANT LOADING: Use cached data immediately
    initialData: () => getInitialData(branchId),
    // Keep data SUPER FRESH for 6 hours (minimize refetch)
    staleTime: 6 * 60 * 60 * 1000, // 6 hours - extend for less refetch!
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!branchId,
    // NO REFETCH - completely offline-first for max speed!
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Turn off for instant load!
  });

  // Mutation untuk update indicators - OPTIMISTIC UPDATE
  const updateMutation = useMutation({
    mutationFn: (indicators: Indicator[]) => api.updateIndicators(branchId, indicators),
    // OPTIMISTIC UPDATE: Update UI immediately before API call
    onMutate: async (newIndicators) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['indicators', branchId] });

      // Snapshot the previous value
      const previousIndicators = queryClient.getQueryData(['indicators', branchId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['indicators', branchId], newIndicators);

      // Update localStorage immediately
      try {
        localStorage.setItem(`indicators_${branchId}`, JSON.stringify({
          data: newIndicators,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Cache write error:', e);
      }

      // Return a context with the previous value
      return { previousIndicators };
    },
    onSuccess: () => {
      toast.success('Indikator berhasil diupdate!');
    },
    onError: (error, newIndicators, context) => {
      // Rollback on error
      if (context?.previousIndicators) {
        queryClient.setQueryData(['indicators', branchId], context.previousIndicators);
      }
      console.error('Update indicators error:', error);
      toast.error('Gagal update indikator!');
    },
  });

  return {
    indicators: query.data || [],
    isLoading: false, // NEVER show loading if we have initialData from cache!
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    updateIndicators: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch: query.refetch,
  };
}

// Hook untuk prefetch (preload) indicators
export function usePrefetchIndicators() {
  const queryClient = useQueryClient();

  return (branchId: string) => {
    // Check if already in cache
    const cached = getInitialData(branchId);
    if (cached) {
      queryClient.setQueryData(['indicators', branchId], cached);
    }
    
    queryClient.prefetchQuery({
      queryKey: ['indicators', branchId],
      queryFn: () => api.getIndicators(branchId),
      staleTime: 2 * 60 * 60 * 1000,
    });
  };
}