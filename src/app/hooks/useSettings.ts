import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { BranchSettings } from '../types';
import { toast } from 'sonner';

// OFFLINE-FIRST: Load from localStorage immediately
const getInitialData = (branchId: string): BranchSettings | undefined => {
  try {
    const cached = localStorage.getItem(`settings_${branchId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) { // 6 hours fresh cache!
        console.log('⚡ Settings loaded from cache instantly');
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return undefined;
};

// Custom hook untuk settings dengan React Query
export function useSettings(branchId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['settings', branchId],
    queryFn: async () => {
      console.log('🔄 Fetching settings from API...');
      const data = await api.getSettings(branchId);
      
      // Save to localStorage
      try {
        localStorage.setItem(`settings_${branchId}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        console.log('✅ Settings cached to localStorage');
      } catch (e) {
        console.error('Cache write error:', e);
      }
      
      return data;
    },
    initialData: () => getInitialData(branchId),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours - extend for less refetch!
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!branchId,
    // NO REFETCH - completely offline-first for max speed!
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Turn off for instant load!
  });

  const updateMutation = useMutation({
    mutationFn: (settings: BranchSettings) => api.updateSettings(branchId, settings),
    // OPTIMISTIC UPDATE
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['settings', branchId] });
      const previousSettings = queryClient.getQueryData(['settings', branchId]);
      queryClient.setQueryData(['settings', branchId], newSettings);
      
      // Update localStorage immediately
      try {
        localStorage.setItem(`settings_${branchId}`, JSON.stringify({
          data: newSettings,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Cache write error:', e);
      }
      
      return { previousSettings };
    },
    onSuccess: () => {
      toast.success('Settings berhasil diupdate!');
    },
    onError: (error, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['settings', branchId], context.previousSettings);
      }
      console.error('Update settings error:', error);
      toast.error('Gagal update settings!');
    },
  });

  return {
    settings: query.data,
    isLoading: false, // NEVER show loading if we have initialData from cache!
    isFetching: query.isFetching,
    isError: query.isError,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch: query.refetch,
  };
}