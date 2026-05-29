import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { LogOut, ArrowLeft, TrendingUp, ShoppingCart, DollarSign, Phone, UserPlus, Shield, ThumbsUp, Target, Camera, History, Crown, AlertCircle, CheckCircle, Users, Package, Tag, Image, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Branch, Indicator, IndicatorData, Submission } from '../types';
import { api } from '../utils/api';
import { formatNumber, parseFormattedNumber, formatNumberInput } from '../utils/format';
import { draftManager } from '../utils/draft';
import { isOnline, debounce } from '../utils/retry';
import { compressImage } from '../utils/imageCompression';
import SubmitLoadingScreen from './SubmitLoadingScreen';
import { useIndicators } from '../hooks/useIndicators';
import { useSettings } from '../hooks/useSettings';
import { useSubmissions } from '../hooks/useSubmissions';
import { preSeedCache } from '../utils/preSeedCache';
import { queryClient } from '../lib/queryClient';
import { getIndicatorsByRole, DEFAULT_ROLE_INDICATORS, ROLE_DISPLAY_NAMES, ROLE_COLORS } from '../utils/roleIndicators';

interface StaffDashboardProps {
  user: any;
  branch: Branch;
  onLogout: () => void;
  onBack: () => void;
}

const iconMap: Record<string, any> = {
  TrendingUp, ShoppingCart, DollarSign, Phone, UserPlus, Shield, ThumbsUp, Target, Camera,
  Users, Package, Tag, Image, Sparkles
};

export default function StaffDashboard({ user, branch, onLogout, onBack }: StaffDashboardProps) {
  // State declarations FIRST!
  const [data, setData] = useState<Record<string, IndicatorData>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10); // 🔥 Limit awal: 10 data untuk ringan!
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // REACT QUERY: INSTANT loading dengan cache! No waiting!
  const { indicators: allIndicators, refetch: refetchIndicators } = useIndicators(branch.id);
  const { settings, refetch: refetchSettings } = useSettings(branch.id);

  // 🎯 Filter indicators by user role
  const indicators = useMemo(() => {
    if (!user?.role) {
      console.warn('⚠️ No user role:', { userRole: user?.role });
      return [];
    }

    console.log('🎯 Filtering indicators for role:', user.role);
    console.log('📊 Total indicators from backend:', allIndicators?.length || 0);

    // ✅ CRITICAL FIX: Check if backend indicators have role field
    const hasRoleField = allIndicators && allIndicators.length > 0 && allIndicators.some(ind => ind.role);

    if (!hasRoleField) {
      console.info('ℹ️ Backend indicators missing role field — using hardcoded defaults for role:', user.role);

      // ✅ SAFETY CHECK: Ensure DEFAULT_ROLE_INDICATORS exists
      if (!DEFAULT_ROLE_INDICATORS) {
        console.error('❌ CRITICAL: DEFAULT_ROLE_INDICATORS is undefined! Module not loaded properly.');
        toast.error('Error: Indicator config not loaded. Please refresh the page.', { duration: 5000 });
        return [];
      }

      // Use hardcoded indicators
      const hardcodedIndicators = DEFAULT_ROLE_INDICATORS[user.role];

      if (!hardcodedIndicators) {
        console.error('❌ CRITICAL: No hardcoded indicators for role:', user.role);
        toast.error(`Error: No indicators defined for role ${user.role}. Please contact support.`, { duration: 5000 });
        return [];
      }

      console.log('✅ Hardcoded indicators loaded:', hardcodedIndicators.length);

      return hardcodedIndicators;
    }

    // Use backend indicators if they have role field
    const filtered = getIndicatorsByRole(allIndicators, user.role);

    console.log('✅ Filtered indicators for role', user.role, ':', filtered.length);
    console.log('📋 Indicators:', filtered.map(i => `${i.name} (${i.role || 'no-role'})`));

    return filtered;
  }, [allIndicators, user?.role]);

  // 🔍 Check if user is admin (admin NIK = branch NIK)
  const isAdmin = user?.nik === branch.nik;

  // ⚡ SUPER OPTIMIZED: Hanya fetch saat history dialog dibuka!
  // 🔒 ADMIN: Fetch ALL data (no NIK filter)
  // 👤 USER: Fetch SEMUA data mereka (with NIK filter, NO DATE LIMIT!)
  const {
    submissions,
    isLoading: submissionsLoading,
    isFetching: submissionsFetching,
    isError: submissionsError,
    refetch: refetchSubmissions
  } = useSubmissions(
    branch.id,
    1,
    999999, // ← PENTING: Limit besar untuk ambil SEMUA data user (bukan cuma 100!)
    isAdmin ? undefined : user?.nik, // ← Admin: no filter, User: filter by NIK
    showHistory // ← Hanya fetch saat history dibuka!
  );

  // 🔥 LISTEN TO DELETE EVENTS dari Admin! (Multi-channel untuk ensure delivery!)
  useEffect(() => {
    const handleDeleteEvent = (deleteEvent: any) => {
      if (!deleteEvent || deleteEvent.branchId !== branch.id) return;

      console.log('');
      console.log('🔥🔥🔥 DELETE EVENT RECEIVED! 🔥🔥🔥');
      console.log('Admin deleted data from branch:', deleteEvent.branchId);
      console.log('Deleted IDs count:', deleteEvent.deletedIds?.length || 0);
      console.log('');

      console.log('✅ Event untuk branch ini! Force clear & refetch...');

      // Clear React Query cache
      queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });
      queryClient.removeQueries({ queryKey: ['submissions', branch.id] });

      // Clear localStorage cache
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.includes(`submissions_${branch.id}`)) {
          localStorage.removeItem(key);
          console.log(`  🗑️ Cleared: ${key}`);
        }
      }

      // Force refetch jika history sedang dibuka
      if (showHistory) {
        refetchSubmissions();
        console.log('✅ Submissions refetched! Data updated!');
      }

      toast.info('📢 Admin menghapus data. Tampilan diperbarui!', {
        duration: 3000
      });
    };

    // Method 1: localStorage event (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'delete_event' && e.newValue) {
        try {
          const deleteEvent = JSON.parse(e.newValue);
          handleDeleteEvent(deleteEvent);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    // Method 2: Custom Event (same-tab)
    const handleCustomEvent = (e: any) => {
      handleDeleteEvent(e.detail);
    };

    // Method 3: BroadcastChannel (modern browsers, cross-tab)
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('submissions-channel');
      channel.onmessage = (e) => {
        handleDeleteEvent(e.data);
      };
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('submissions-deleted', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('submissions-deleted', handleCustomEvent as EventListener);
      if (channel) channel.close();
    };
  }, [branch.id, showHistory, refetchSubmissions]);

  // 🔍 DEBUG: Log saat showHistory berubah
  useEffect(() => {
    if (showHistory) {
      // Reset display limit saat buka history (10 untuk ringan!)
      setDisplayLimit(10);

      console.log('');
      console.log('🔥🔥🔥 ===== RIWAYAT DIBUKA ===== 🔥🔥🔥');
      console.log('👤 User Role:', isAdmin ? '🔑 ADMIN' : '👤 USER');
      console.log('📊 Branch ID:', branch.id);
      console.log('👤 User NIK:', user?.nik);
      console.log('👤 User Nama:', user?.nama);
      console.log('🔍 Filter Mode:', isAdmin ? 'ALL DATA (no filter)' : `FILTERED by NIK: ${user?.nik}`);
      console.log('');
      console.log('📊 DATA RECEIVED:');
      console.log('   Total submissions:', submissions?.length || 0);
      console.log('   Loading:', submissionsLoading);
      console.log('   Fetching:', submissionsFetching);
      console.log('   Error:', submissionsError);
      console.log('');

      // 🔥 DEBUG: Log semua submission IDs dan NIKs
      if (submissions && submissions.length > 0) {
        console.log('📋 ALL SUBMISSIONS RECEIVED:');
        submissions.forEach((sub: any, idx: number) => {
          console.log(`   [${idx + 1}] ID: ${sub.id}`);
          console.log(`       NIK: ${sub?.user?.nik || sub?.nik}`);
          console.log(`       Nama: ${sub?.user?.nama || sub?.nama}`);
          console.log(`       Date: ${sub.date}`);
          console.log(`       CreatedAt: ${sub.createdAt}`);
          console.log(`       Score: ${sub.totalScore}`);
          console.log('');
        });
      } else {
        console.log('❌ NO SUBMISSIONS RECEIVED FROM SERVER!');
        console.log('   Possible reasons:');
        console.log('   1. Backend not returning data');
        console.log('   2. API timeout');
        console.log('   3. Wrong branch ID');
        console.log('   4. User has no submissions yet');
      }

      console.log('============================');
      console.log('');

      // 🔔 NOTIFIKASI: Beri tahu user saat loading
      if (submissionsLoading) {
        toast.loading('Memuat riwayat submission... Tunggu 5-15 detik', {
          id: 'loading-history',
          duration: 15000
        });
      }
    }
  }, [showHistory, submissions, user?.nik, branch.id, submissionsLoading, submissionsFetching, isAdmin]);

  // 🔔 NOTIFIKASI: Update status loading
  useEffect(() => {
    if (showHistory && !submissionsLoading && !submissionsFetching) {
      toast.dismiss('loading-history');

      if (submissionsError) {
        // Error already handled in error UI
      } else if (submissions && submissions.length > 0) {
        // Update last refresh time
        setLastRefreshTime(new Date());

        toast.success(`✅ Loaded ${submissions.length} submission`, {
          duration: 2000
        });
      }
    }
  }, [showHistory, submissionsLoading, submissionsFetching, submissions, submissionsError]);

  // Show loading ONLY if absolutely no data (first time ever)
  const isFirstTimeLoading = !indicators || !settings || !submissions;

  // Submit dengan catatan state
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notesReason, setNotesReason] = useState('');
  const [notesApproval, setNotesApproval] = useState('');
  const [notesAdminNik, setNotesAdminNik] = useState('');
  const [notesAdminNama, setNotesAdminNama] = useState('');

  // Draft and offline state
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ timestamp: number; date: string } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submission date - default hari ini, bisa diedit
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 📊 FILTER DATA + Load More
  const { allSubmissions, displayedSubmissions, hasMore, totalCount } = useMemo(() => {
    // ⚡ Skip processing jika history tidak dibuka
    if (!showHistory) {
      return { allSubmissions: [], displayedSubmissions: [], hasMore: false, totalCount: 0 };
    }

    if (!submissions || submissions.length === 0) {
      console.log('📊 No submissions data available');
      return { allSubmissions: [], displayedSubmissions: [], hasMore: false, totalCount: 0 };
    }

    console.log('');
    console.log('🔍 ===== RIWAYAT DISPLAY =====');
    console.log('👤 User Role:', isAdmin ? 'ADMIN 🔑' : 'USER 👤');
    console.log('📊 Total submissions from server:', submissions.length);

    // 🔒 PRIVACY CHECK untuk user biasa
    if (!isAdmin) {
      const allNiks = submissions.map((s: any) => s?.user?.nik || s?.nik);
      const uniqueNiks = [...new Set(allNiks)];

      if (uniqueNiks.length > 1) {
        console.log('🛡️ Frontend filter active - filtering out other users data');
        console.log('📊 Server sent:', submissions.length, 'submissions');
        console.log('🔒 Showing only NIK:', user?.nik);
      } else {
        console.log('✅ Backend filter working - received only user data');
      }
    }

    // 🛡️ FRONTEND FILTER: Hanya data user yang login (untuk user biasa)
    let filteredData = submissions;

    if (!isAdmin && user?.nik) {
      const userNik = String(user.nik).trim().toUpperCase();
      console.log('🛡️ ===== FRONTEND FILTER (PRIVACY PROTECTION) =====');
      console.log('👤 User NIK:', userNik);
      console.log('📊 Total submissions from server:', submissions.length);

      // Filter by NIK
      filteredData = submissions.filter((s: any) => {
        const subNik = String(s?.user?.nik || s?.nik || '').trim().toUpperCase();
        return subNik === userNik;
      });

      console.log('✅ After NIK filter:', filteredData.length);
      console.log('🗑️ Filtered out:', submissions.length - filteredData.length, 'submissions dari user lain');

      // 🔥 IMPORTANT: NO DATE FILTER! Show ALL user data regardless of date
      console.log('');
      console.log('📅 DATE FILTER: TIDAK AKTIF');
      console.log('✅ User akan melihat SEMUA data mereka (tidak ada batasan 5 hari!)');
      console.log('');

      // Show date range for debugging
      if (filteredData.length > 0) {
        const dates = filteredData.map((s: any) => new Date(s.date || s.createdAt));
        const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
        console.log('📅 Data range:');
        console.log('   Oldest:', oldestDate.toLocaleDateString('id-ID'));
        console.log('   Newest:', newestDate.toLocaleDateString('id-ID'));
        console.log('   Total days:', Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)));
      }
      console.log('====================================================');
      console.log('');
    }

    // Sort by date DESC (terbaru dulu)
    const sorted = [...filteredData].sort((a, b) =>
      new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );

    // 🔑 ADMIN: Limit untuk performa
    if (isAdmin) {
      console.log('🔑 ADMIN MODE: Limit', displayLimit, 'untuk performa');
      const limited = sorted.slice(0, displayLimit);
      console.log('✅ Showing:', limited.length, 'of', sorted.length);
      console.log('===================================');
      console.log('');
      return {
        allSubmissions: sorted,
        displayedSubmissions: limited,
        hasMore: sorted.length > displayLimit,
        totalCount: sorted.length
      };
    }

    // 👤 USER: Load More Pattern
    const displayed = sorted.slice(0, displayLimit);
    const hasMoreData = sorted.length > displayLimit;

    console.log('👤 USER MODE: Load More Pattern (Initial: 10, Increment: +10)');
    console.log('📦 Total data user ini (after filter):', sorted.length);
    console.log('📋 Currently displaying:', displayed.length);
    console.log('➕ Has more data:', hasMoreData);
    console.log('===================================');
    console.log('');

    return {
      allSubmissions: sorted,
      displayedSubmissions: displayed,
      hasMore: hasMoreData,
      totalCount: sorted.length
    };
  }, [submissions, showHistory, isAdmin, displayLimit, user?.nik]);

  // Alias untuk backward compatibility
  const mySubmissions = displayedSubmissions;

  // Initialize data when indicators loaded
  useEffect(() => {
    if (indicators.length > 0 && Object.keys(data).length === 0) {
      // Check draft first
      const draft = draftManager.loadDraft(branch.id, user?.nik || '');
      if (draft && !hasDraft) {
        setHasDraft(true);
        setDraftInfo(draftManager.getDraftInfo(branch.id, user?.nik || ''));
        return;
      }

      // Initialize fresh data
      const initialData: Record<string, IndicatorData> = {};
      indicators.forEach(ind => {
        initialData[ind.id] = {
          id: ind.id,
          value: undefined,
          photos: []
        };
      });
      setData(initialData);
    }
  }, [indicators, branch.id, user.nik]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Koneksi kembali! Memproses data yang tertunda...');
      api.processOfflineQueue().then((count) => {
        if (count > 0) {
          toast.success(`${count} data berhasil dikirim!`);
          // Refetch all data
          refetchIndicators();
          refetchSettings();
          refetchSubmissions();
        }
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error('Koneksi terputus! Data akan disimpan secara lokal.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (user?.nik) {
      draftManager.startAutoSave(branch.id, user.nik, () => data);

      return () => {
        draftManager.stopAutoSave();
      };
    }
  }, [branch.id, user.nik, data]);

  const restoreDraft = () => {
    const draft = draftManager.loadDraft(branch.id, user?.nik || '');
    if (draft) {
      setData(draft);
      toast.success('Draft berhasil dimuat!');
    }
    setHasDraft(false);
    setDraftInfo(null);
  };

  const discardDraft = () => {
    draftManager.clearDraft(branch.id, user?.nik || '');
    setHasDraft(false);
    setDraftInfo(null);
    toast.info('Draft dihapus');

    // Reset tanggal ke hari ini
    setSubmissionDate(new Date().toISOString().split('T')[0]);

    // Initialize fresh data
    const initialData: Record<string, IndicatorData> = {};
    indicators.forEach(ind => {
      initialData[ind.id] = {
        id: ind.id,
        value: undefined,
        photos: [],
        textValue: '',
        dropdownValue: '',
        checkboxValue: false
      };
    });
    setData(initialData);
  };

  // ⚡ OPTIMIZED: useMemo untuk calculateScore - tidak re-calculate setiap render!
  const scoreResult = useMemo(() => {
    let totalScore = 0;
    const scoreDetails: any[] = [];

    indicators.forEach(indicator => {
      const inputData = data[indicator.id];
      let score = 0;
      let percentage = 0;

      if (indicator.type === 'number' || indicator.type === 'number+photo') {
        const value = inputData?.value || 0;

        if (indicator.isSpecial) {
          // Handle special formulas
          if (indicator.id === 'proteksi') {
            score = Math.min(value * 10, indicator.weight);
            percentage = (score / indicator.weight) * 100;
          }
        } else if (indicator.targetValue) {
          percentage = Math.min((value / indicator.targetValue) * 100, 100);
        }

        if (!indicator.isSpecial || indicator.id !== 'proteksi') {
          score = (percentage / 100) * indicator.weight;
        }
      }

      if (indicator.type === 'photo' || indicator.type === 'number+photo') {
        const photos = inputData?.photos || [];
        const requiredPhotos = indicator.targetPhotos || 1;

        if (indicator.type === 'photo') {
          const photoPercentage = Math.min((photos.length / requiredPhotos) * 100, 100);
          score = (photoPercentage / 100) * indicator.weight;
          percentage = photoPercentage;
        } else if (indicator.type === 'number+photo') {
          // For number+photo, calculate combined score
          const photoPercentage = Math.min((photos.length / requiredPhotos) * 100, 100);
          // Average of number percentage and photo percentage
          const combinedPercentage = (percentage + photoPercentage) / 2;
          score = (combinedPercentage / 100) * indicator.weight;
          percentage = combinedPercentage;
        }
      }

      // Handle text type - full score if filled
      if (indicator.type === 'text') {
        const textValue = inputData?.textValue || '';
        if (textValue.trim().length > 0) {
          score = indicator.weight;
          percentage = 100;
        }
      }

      // Handle dropdown type - full score if selected
      if (indicator.type === 'dropdown') {
        const dropdownValue = inputData?.dropdownValue || '';
        if (dropdownValue) {
          score = indicator.weight;
          percentage = 100;
        }
      }

      // Handle checkbox type - full score if checked
      if (indicator.type === 'checkbox') {
        const checkboxValue = inputData?.checkboxValue || false;
        if (checkboxValue) {
          score = indicator.weight;
          percentage = 100;
        }
      }

      scoreDetails.push({
        indicatorId: indicator.id,
        score: Math.round(score * 10) / 10,
        percentage: Math.round(percentage * 10) / 10
      });

      totalScore += score;
    });

    return {
      total: Math.round(totalScore * 10) / 10,
      details: scoreDetails
    };
  }, [data, indicators]); // Re-calculate hanya saat data atau indicators berubah

  const totalScore = scoreResult.total;
  const minSubmitScore = settings?.minSubmitScore || 80;
  const canSubmit = totalScore >= minSubmitScore;

  // ⚡ OPTIMIZED: useMemo untuk helper functions
  const scoreColor = useMemo(() => {
    if (totalScore < minSubmitScore) return 'border-red-300 bg-red-50';
    if (totalScore >= 100) return 'border-blue-400 bg-blue-50';
    return 'border-green-300 bg-green-50';
  }, [totalScore, minSubmitScore]);

  const scoreBadge = useMemo(() => {
    if (totalScore < minSubmitScore) return 'bg-red-500';
    if (totalScore >= 100) return 'bg-blue-600';
    return 'bg-green-500';
  }, [totalScore, minSubmitScore]);

  const motivationMessage = useMemo(() => {
    if (totalScore < minSubmitScore) return `Minimal ${minSubmitScore}%`;
    if (totalScore >= 100) return `${user.nama} (${user.nik}), Kamu Luar Biasa, Pertahankan ya! 🎉`;
    return `${user.nama} (${user.nik}), Ayo Semangat kejar lagi ke Indikator 100%! 💪`;
  }, [totalScore, minSubmitScore, user.nama, user.nik]);

  const handleSubmitWithNotes = async () => {
    // Validate notes form
    if (!notesReason.trim()) {
      toast.error('Reason harus diisi!');
      return;
    }
    if (!notesApproval.trim()) {
      toast.error('Approval harus diisi!');
      return;
    }
    if (!notesAdminNik.trim()) {
      toast.error('NIK Admin harus diisi!');
      return;
    }
    if (!notesAdminNama.trim()) {
      toast.error('Nama Admin harus diisi!');
      return;
    }

    // Verify admin credentials
    if (notesAdminNik !== branch.nik || notesAdminNama.toUpperCase() !== branch.adminName.toUpperCase()) {
      toast.error('NIK atau Nama Admin tidak sesuai!');
      return;
    }

    // Save notes values
    const savedNotes = {
      reason: notesReason.trim(),
      approval: notesApproval.trim(),
      adminNik: notesAdminNik.trim(),
      adminNama: notesAdminNama.trim()
    };

    // 🔍 DEBUG: Log notes yang akan dikirim
    console.log('🔍 DEBUG - savedNotes:', savedNotes);
    console.log('🔍 DEBUG - notes fields:', {
      reason: savedNotes.reason,
      approval: savedNotes.approval,
      adminNik: savedNotes.adminNik,
      adminNama: savedNotes.adminNama
    });

    // CLOSE DIALOG FIRST so loading screen is visible
    setShowNotesDialog(false);
    setNotesReason('');
    setNotesApproval('');
    setNotesAdminNik('');
    setNotesAdminNama('');

    // ✅ START SUBMIT (NO OPTIMISTIC UPDATE - wait for server response)
    setIsSubmitting(true);

    try {
      // Compress images and convert to data URLs for storage
      const submissionData = await Promise.all(
        Object.values(data).map(async (indicatorData) => {
          try {
            // Guard: indicatorData itself bisa undefined/null
            if (!indicatorData || typeof indicatorData !== 'object') {
              return indicatorData;
            }

            // Guard: photos harus array dan non-empty
            const photos = Array.isArray(indicatorData.photos) ? indicatorData.photos : [];
            if (photos.length > 0) {
              const photoDataUrls = await Promise.all(
                photos.map(async (photoItem) => {
                  // Skip null/undefined entries
                  if (photoItem == null) {
                    return '';
                  }

                  // If already a string, return as is
                  if (typeof photoItem === 'string') {
                    return photoItem;
                  }

                  // If File/Blob, COMPRESS then convert
                  if (photoItem instanceof File || photoItem instanceof Blob) {
                    try {
                      // BALANCED compression: 500x500 @ 50%
                      const compressed = await compressImage(photoItem, {
                        maxWidth: 500,
                        maxHeight: 500,
                        quality: 0.5,
                      });
                      return compressed;
                    } catch (error) {
                      console.error('Image compression failed:', error);
                      return ''; // Skip this image
                    }
                  }

                  console.warn('Unknown photo item type:', typeof photoItem);
                  return '';
                })
              );
              return {
                ...indicatorData,
                photos: photoDataUrls.filter(url => typeof url === 'string' && url.length > 0)
              };
            }
            return indicatorData;
          } catch (error) {
            console.error('Error processing indicator data:', error);
            return indicatorData;
          }
        })
      );

      // 🕐 FIX: Use actual current time WITH TIMEZONE!
      const now = new Date(); // Current local time
      const selectedDate = new Date(submissionDate);

      // Set waktu ke waktu sekarang (jam submit yang sebenarnya!)
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

      // 🔥 IMPORTANT: Send CURRENT timestamp untuk backend validation
      const submittedAt = now.toISOString(); // Waktu SUBMIT yang sebenarnya (bukan pilihan tanggal)

      console.log('');
      console.log('🕐 ===== TIMESTAMP DEBUG =====');
      console.log('📅 Selected Date:', submissionDate); // YYYY-MM-DD
      console.log('🕐 Submit Time (NOW):', submittedAt); // Full timestamp
      console.log('🕐 Display Time:', now.toLocaleTimeString('id-ID'));
      console.log('============================');
      console.log('');

      const submission: Submission = {
        id: `${branch.id}_${user.nik}_${Date.now()}`,
        branchId: branch.id,
        user: {
          nik: user.nik,
          nama: user.nama,
          role: user.role
        },
        data: submissionData as any,
        totalScore: totalScore,
        scoreDetails: scoreResult.details,
        date: submissionDate, // YYYY-MM-DD only (untuk filter by date)
        createdAt: submittedAt, // 🔥 REAL submit time - jangan overwrite di backend!
        displayDate: selectedDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        notes: savedNotes
      };

      const success = await api.addSubmission(branch.id, submission);

      if (success) {
        // ✅ SUCCESS - Show message and reset form
        toast.success('Submit dengan catatan berhasil!');

        // Reset form to fresh state
        const freshData: Record<string, IndicatorData> = {};
        indicators.forEach(ind => {
          freshData[ind.id] = {
            id: ind.id,
            value: undefined,
            photos: [],
            textValue: '',
            dropdownValue: '',
            checkboxValue: false
          };
        });
        setData(freshData);

        // Reset tanggal ke hari ini
        setSubmissionDate(new Date().toISOString().split('T')[0]);

        // Clear draft
        draftManager.clearDraft(branch.id, user?.nik || '');

        // ⚡ INVALIDATE CACHE - Force refetch for instant update
        queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });

        // Refetch untuk update UI
        refetchSubmissions();
      } else {
        toast.error('Gagal submit!');
      }
    } catch (error: any) {
      console.error('Error submitting with notes:', error);

      // Clear, helpful error messages
      if (!navigator.onLine) {
        toast.error('Tidak ada koneksi internet. Data tersimpan dan akan dikirim otomatis saat online.', { duration: 6000 });
      } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        toast.error('Koneksi sangat lambat (sudah dicoba 3x dalam 60 detik). Data TERSIMPAN di offline queue dan akan dikirim otomatis saat koneksi membaik. Jangan khawatir, data tidak hilang!', { duration: 8000 });
      } else {
        toast.error('Gagal mengirim (sudah dicoba 3x). Data TERSIMPAN dan akan dikirim otomatis. Coba lagi nanti atau hubungi admin jika masih bermasalah.', { duration: 7000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // VALIDASI 1: Check minimal score
    if (!canSubmit) {
      toast.error(`Score minimal ${minSubmitScore}% untuk submit!`);
      return;
    }

    // VALIDASI 2: Check number+photo indicators - WAJIB diisi KEDUANYA!
    const missingNumberPhoto: string[] = [];
    indicators.forEach(indicator => {
      if (indicator.type === 'number+photo') {
        const inputData = data[indicator.id];
        const value = inputData?.value || 0;
        const photos = inputData?.photos || [];
        const requiredPhotos = indicator.targetPhotos || 1;

        // WAJIB: value harus > 0 DAN foto harus lengkap
        if (value <= 0 || photos.length < requiredPhotos) {
          missingNumberPhoto.push(indicator.name);
        }
      }
    });

    if (missingNumberPhoto.length > 0) {
      toast.error(
        `Indikator berikut WAJIB diisi lengkap (angka + foto):\n${missingNumberPhoto.join(', ')}`,
        { duration: 5000 }
      );
      return;
    }

    // 🔄 SHOW LOADING - Like before!
    setIsSubmitting(true);

    try {
      // Compress images first
      const submissionData = await Promise.all(
        Object.values(data).map(async (indicatorData) => {
          try {
            if (indicatorData.photos && indicatorData.photos.length > 0) {
              const photoDataUrls = await Promise.all(
                indicatorData.photos.map(async (photoItem) => {
                  if (typeof photoItem === 'string') return photoItem;

                  if (photoItem instanceof File || photoItem instanceof Blob) {
                    try {
                      // FAST compression: 400x400 @ 60% - Good balance!
                      const compressed = await compressImage(photoItem, {
                        maxWidth: 400,
                        maxHeight: 400,
                        quality: 0.6,
                      });
                      return compressed;
                    } catch (error) {
                      console.error('Image compression failed:', error);
                      return '';
                    }
                  }
                  return '';
                })
              );
              return {
                ...indicatorData,
                photos: photoDataUrls.filter((url: string) => url.length > 0)
              };
            }
            return indicatorData;
          } catch (error) {
            return indicatorData;
          }
        })
      );

      // 🕐 FIX: Use actual current time WITH TIMEZONE!
      const now = new Date(); // Current local time
      const selectedDate = new Date(submissionDate);

      // Set waktu ke waktu sekarang (jam submit yang sebenarnya!)
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

      // 🔥 IMPORTANT: Send CURRENT timestamp untuk backend validation
      const submittedAt = now.toISOString(); // Waktu SUBMIT yang sebenarnya (bukan pilihan tanggal)

      console.log('');
      console.log('🕐 ===== TIMESTAMP DEBUG =====');
      console.log('📅 Selected Date:', submissionDate); // YYYY-MM-DD
      console.log('🕐 Submit Time (NOW):', submittedAt); // Full timestamp
      console.log('🕐 Display Time:', now.toLocaleTimeString('id-ID'));
      console.log('============================');
      console.log('');

      // ✅ VALIDATION: Ensure user object is correct (prevent field corruption)
      if (!user || !user.nik || !user.nama || !user.role) {
        throw new Error('User session invalid! Please clear cache and login again.');
      }

      // ✅ VALIDATION: Ensure timestamps are correct
      if (!submissionDate || !submittedAt) {
        throw new Error('Invalid dates! Please refresh and try again.');
      }

      const submission: Submission = {
        id: `${branch.id}_${user.nik}_${Date.now()}`,
        branchId: branch.id,
        user: {
          nik: String(user.nik),          // ✅ Ensure string
          nama: String(user.nama),        // ✅ Ensure string
          role: user.role as UserRole     // ✅ Ensure correct type
        },
        data: submissionData as any,
        totalScore: totalScore,
        scoreDetails: scoreResult.details,
        date: submissionDate,             // ✅ YYYY-MM-DD only
        createdAt: submittedAt,           // ✅ ISO timestamp
        displayDate: selectedDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };

      // 🔍 DEBUG: Log submission before sending
      console.log('');
      console.log('📦 ===== SUBMISSION OBJECT =====');
      console.log('ID:', submission.id);
      console.log('User:', submission.user);
      console.log('Date:', submission.date);
      console.log('CreatedAt:', submission.createdAt);
      console.log('TotalScore:', submission.totalScore);
      console.log('================================');
      console.log('');

      // Upload to server
      const success = await api.addSubmission(branch.id, submission);

      if (success) {
        // ✅ SUCCESS - Show message and reset form
        toast.success(motivationMessage, { duration: 3000 });

        // Reset form to fresh state
        const freshData: Record<string, IndicatorData> = {};
        indicators.forEach(ind => {
          freshData[ind.id] = {
            id: ind.id,
            value: undefined,
            photos: [],
            textValue: '',
            dropdownValue: '',
            checkboxValue: false
          };
        });
        setData(freshData);

        // Reset tanggal ke hari ini
        setSubmissionDate(new Date().toISOString().split('T')[0]);

        // Clear draft
        draftManager.clearDraft(branch.id, user?.nik || '');

        // ⚡ INVALIDATE CACHE - Force refetch for instant update
        queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });

        // Refetch untuk update UI
        refetchSubmissions();
      } else {
        throw new Error('Submit failed');
      }
    } catch (error: any) {
      console.error('Submit error:', error);

      // Clear, helpful error messages
      if (!navigator.onLine) {
        toast.error('Tidak ada koneksi internet. Data tersimpan dan akan dikirim otomatis saat online.', { duration: 6000 });
      } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        toast.error('Koneksi sangat lambat (sudah dicoba 3x dalam 60 detik). Data TERSIMPAN di offline queue dan akan dikirim otomatis saat koneksi membaik. Jangan khawatir, data tidak hilang!', { duration: 8000 });
      } else {
        toast.error('Gagal mengirim (sudah dicoba 3x). Data TERSIMPAN dan akan dikirim otomatis. Coba lagi nanti atau hubungi admin jika masih bermasalah.', { duration: 7000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (indicatorId: string, value: number) => {
    // ⚡ OPTIMISTIC UPDATE: Update UI immediately (no waiting!)
    const newData = {
      ...data,
      [indicatorId]: {
        ...data[indicatorId],
        value
      }
    };

    // 🔄 AUTO-CALCULATE BASKET SIZE when Sales or Trx changes
    if (indicatorId === 'sales' || indicatorId === 'trx' || indicatorId === 'transaksi') {
      const salesValue = indicatorId === 'sales' ? value : (data['sales']?.value || 0);
      const trxValue = indicatorId === 'trx' ? value : (indicatorId === 'transaksi' ? value : (data['trx']?.value || data['transaksi']?.value || 0));

      // Calculate Basket Size = Sales / Trx
      const basketSize = trxValue > 0 ? Math.round(salesValue / trxValue) : 0;

      // Auto-update basket size
      newData['basket'] = {
        ...newData['basket'],
        value: basketSize
      };
      newData['basketSize'] = {
        ...newData['basketSize'],
        value: basketSize
      };
    }

    // ⚡ INSTANT UI UPDATE
    setData(newData);

    // 💾 DEBOUNCED SAVE: Save to draft after user stops typing (2 seconds)
    draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
  };

  const handleFileChange = (indicatorId: string, files: FileList | null, photoIndex?: number) => {
    if (files && files.length > 0) {
      const file = files[0]; // Always take first file
      const currentPhotos = data[indicatorId]?.photos || [];

      let newPhotos;
      if (photoIndex !== undefined) {
        // Replace specific index
        newPhotos = [...currentPhotos];
        newPhotos[photoIndex] = file;
      } else {
        // Legacy: replace all (for backward compatibility)
        newPhotos = Array.from(files);
      }

      const newData = {
        ...data,
        [indicatorId]: {
          ...data[indicatorId],
          photos: newPhotos
        }
      };

      // ⚡ INSTANT UI UPDATE
      setData(newData);

      // 💾 DEBOUNCED SAVE
      draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
    }
  };

  const handleRemovePhoto = (indicatorId: string, photoIndex: number) => {
    const currentPhotos = data[indicatorId]?.photos || [];
    const newPhotos = currentPhotos.filter((_, idx) => idx !== photoIndex);

    const newData = {
      ...data,
      [indicatorId]: {
        ...data[indicatorId],
        photos: newPhotos
      }
    };

    // ⚡ INSTANT UI UPDATE
    setData(newData);

    // 💾 DEBOUNCED SAVE
    draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
  };

  const handleTextChange = (indicatorId: string, textValue: string) => {
    const newData = {
      ...data,
      [indicatorId]: {
        ...data[indicatorId],
        textValue
      }
    };

    // ⚡ INSTANT UI UPDATE
    setData(newData);

    // 💾 DEBOUNCED SAVE
    draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
  };

  const handleDropdownChange = (indicatorId: string, dropdownValue: string) => {
    const newData = {
      ...data,
      [indicatorId]: {
        ...data[indicatorId],
        dropdownValue
      }
    };

    // ⚡ INSTANT UI UPDATE
    setData(newData);

    // 💾 DEBOUNCED SAVE
    draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
  };

  const handleCheckboxChange = (indicatorId: string, checkboxValue: boolean) => {
    const newData = {
      ...data,
      [indicatorId]: {
        ...data[indicatorId],
        checkboxValue
      }
    };

    // ⚡ INSTANT UI UPDATE
    setData(newData);

    // 💾 DEBOUNCED SAVE
    draftManager.saveDraftDebounced(branch.id, user?.nik || '', newData);
  };

  const getIndicatorScore = (indicatorId: string) => {
    const detail = scoreResult.details.find(d => d.indicatorId === indicatorId);
    return detail || { score: 0, percentage: 0 };
  };

  if (showHistory) {
    // ⚡ INSTANT STATS - Calculate on the fly (hanya untuk 10 data)
    const totalSubmissions = mySubmissions.length;
    const avgScore = totalSubmissions > 0
      ? Math.round(mySubmissions.reduce((sum, s) => sum + s.totalScore, 0) / totalSubmissions)
      : 0;
    const maxScore = totalSubmissions > 0
      ? Math.max(...mySubmissions.map(s => s.totalScore))
      : 0;
    const perfectScores = mySubmissions.filter(s => s.totalScore >= 100).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-2 md:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - RESPONSIVE */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-3 md:p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">
                    {isAdmin ? 'Riwayat Semua Staff' : 'Riwayat Saya'}
                  </h2>
                  {!isAdmin && totalCount > 0 && (
                    <p className="text-xs text-gray-500">
                      📊 Total: {totalCount} submission
                    </p>
                  )}
                </div>
                {submissionsFetching && !submissionsLoading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <Button variant="outline" onClick={() => setShowHistory(false)} className="h-8 md:h-10">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm">Kembali</span>
              </Button>
            </div>

            {/* Refresh Button Bar - Always visible */}
            <div className="flex gap-2 items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex flex-col gap-0.5">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {submissionsFetching ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-600 font-medium">Memperbarui data...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-600">✓</span>
                      <span>Data terbaru</span>
                    </>
                  )}
                </div>
                {lastRefreshTime && !submissionsFetching && (
                  <p className="text-[10px] text-gray-400">
                    Diperbarui: {lastRefreshTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('');
                    console.log('🔄🔄🔄 MANUAL REFRESH 🔄🔄🔄');
                    console.log('User:', user?.nama, '(', user?.nik, ')');
                    console.log('Fetching latest submissions...');
                    console.log('');

                    // Invalidate cache untuk force fetch fresh data
                    queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });

                    // Refetch
                    refetchSubmissions();

                    toast.info('🔄 Memuat data terbaru...', { duration: 2000 });
                  }}
                  disabled={submissionsFetching}
                  className="h-7 md:h-8 text-xs"
                >
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">↻</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('');
                    console.log('🗑️🗑️🗑️ CLEAR ALL CACHE (FULL) 🗑️🗑️🗑️');
                    console.log('Branch:', branch.id);
                    console.log('Clearing: indicators, settings, submissions, ALL caches');
                    console.log('');

                    // ✅ Clear ALL caches (indicators, settings, submissions, dll)
                    api.clearAllCaches();

                    // Clear React Query cache untuk force refetch SEMUA
                    queryClient.invalidateQueries({ queryKey: ['indicators', branch.id] });
                    queryClient.invalidateQueries({ queryKey: ['settings', branch.id] });
                    queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });
                    queryClient.removeQueries({ queryKey: ['submissions', branch.id] });

                    console.log('✅ All cache cleared!');
                    console.log('🔄 Refetching ALL data (indicators, settings, submissions)...');
                    console.log('');

                    // Refetch ALL data untuk dapat data terbaru
                    refetchIndicators();
                    refetchSettings();
                    refetchSubmissions();

                    toast.success('🗑️ All cache cleared! Getting latest data...', { duration: 3000 });
                  }}
                  disabled={submissionsFetching}
                  className="h-7 md:h-8 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Clear Cache</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-2 text-xs md:text-sm text-gray-600 flex items-center gap-2">
              {isAdmin && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full font-medium">
                  🔑 ADMIN
                </span>
              )}
              <span>{user.nama} ({user.nik})</span>
            </div>
          </div>

          {/* Stats Cards - INSTANT! */}
          {totalSubmissions > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
              <Card className="border-blue-200">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-gray-600 mb-1">Total Submit</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{totalSubmissions}</p>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-gray-600 mb-1">Rata-rata</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{avgScore}%</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-gray-600 mb-1">Tertinggi</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{maxScore}%</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs text-gray-600 mb-1">Perfect 💯</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-600">{perfectScores}x</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submissions List - INSTANT RENDER! */}
          <div className="space-y-2 md:space-y-3">
            {submissionsError ? (
              // Error state
              <Card className="border-red-300 bg-red-50">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium mb-2">Gagal Memuat Data</p>
                  <p className="text-sm text-red-600 mb-4">
                    Server timeout atau tidak dapat diakses. Ini bisa terjadi karena:
                  </p>
                  <ul className="text-xs text-left text-red-600 max-w-md mx-auto mb-4 space-y-1">
                    <li>• Server Supabase sedang cold start (butuh 5-10 detik)</li>
                    <li>• Koneksi internet lambat</li>
                    <li>• Backend belum selesai deploy</li>
                  </ul>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        console.log('🔄 Retry fetch submissions...');
                        refetchSubmissions();
                      }}
                      className="mt-2"
                    >
                      🔄 Coba Lagi
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('🗑️ Clearing cache and refetching...');
                        // Clear all cache for this branch
                        for (let i = localStorage.length - 1; i >= 0; i--) {
                          const key = localStorage.key(i);
                          if (key && key.includes(`submissions_${branch.id}`)) {
                            localStorage.removeItem(key);
                            console.log('Cleared:', key);
                          }
                        }
                        // Clear React Query cache
                        queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });
                        queryClient.removeQueries({ queryKey: ['submissions', branch.id] });
                        // Refetch
                        refetchSubmissions();
                        toast.success('Cache cleared! Fetching fresh data...');
                      }}
                      variant="outline"
                      className="mt-2"
                    >
                      🗑️ Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : submissionsLoading ? (
              // Loading state dengan prominent notification
              <div className="space-y-3">
                <Card className="border-blue-300 bg-blue-50 animate-pulse">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-700 font-bold text-lg mb-2">⏳ Memuat Data Riwayat...</p>
                    <p className="text-blue-600 text-sm mb-4">Server sedang memproses request</p>
                    <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
                      <p className="text-xs text-yellow-800 font-medium mb-1">💡 First Load bisa 5-15 detik</p>
                      <p className="text-xs text-yellow-700">Supabase Edge Function membutuhkan waktu cold start</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : mySubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Belum ada submission</p>
                  <p className="text-xs text-gray-400 mt-1">Submit data pertama Anda sekarang!</p>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-sm mx-auto">
                    <p className="text-xs text-blue-700 font-medium mb-2">
                      🔒 Privacy Terjaga
                    </p>
                    <p className="text-xs text-blue-600">
                      Riwayat ini hanya menampilkan <strong>data Anda sendiri</strong>. Data user lain tidak akan pernah muncul di sini.
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('🔄 Refresh submissions...');
                        refetchSubmissions();
                      }}
                      size="sm"
                    >
                      🔄 Refresh Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('');
                        console.log('🗑️🗑️🗑️ MANUAL CACHE CLEAR 🗑️🗑️🗑️');
                        console.log('Clearing all submission caches for branch:', branch.id);

                        let clearedCount = 0;
                        // Clear all cache for this branch
                        for (let i = localStorage.length - 1; i >= 0; i--) {
                          const key = localStorage.key(i);
                          if (key && key.includes(`submissions_${branch.id}`)) {
                            console.log('  Clearing:', key);
                            localStorage.removeItem(key);
                            clearedCount++;
                          }
                        }

                        console.log(`✅ Cleared ${clearedCount} localStorage entries`);

                        // Clear React Query cache
                        queryClient.invalidateQueries({ queryKey: ['submissions', branch.id] });
                        queryClient.removeQueries({ queryKey: ['submissions', branch.id] });
                        console.log('✅ Cleared React Query cache');

                        console.log('🔄 Fetching fresh data from server...');
                        console.log('');

                        // Refetch
                        refetchSubmissions();
                        toast.success('Cache cleared! Fetching fresh data...', { duration: 3000 });
                      }}
                      size="sm"
                    >
                      🗑️ Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              mySubmissions.map((sub, idx) => (
                <Card
                  key={sub.id || idx}
                  className={`transition-all hover:shadow-md ${
                    sub.status === 'pending'
                      ? 'border-blue-300 bg-blue-50'
                      : sub.status === 'failed'
                      ? 'border-red-300 bg-red-50'
                      : sub.totalScore >= 100
                      ? 'border-blue-200 bg-blue-50'
                      : ''
                  }`}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* User Info (Admin Only) */}
                        {isAdmin && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold text-purple-700">
                              👤 {sub.user?.nama || 'Unknown'} ({sub.user?.nik || 'N/A'})
                            </span>
                          </div>
                        )}

                        {/* Role Badge */}
                        {sub.user?.role && ROLE_DISPLAY_NAMES[sub.user.role] && (
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <span className="text-xs text-gray-600 font-medium">Role :</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold border ${ROLE_COLORS[sub.user.role]}`}>
                              {ROLE_DISPLAY_NAMES[sub.user.role]}
                            </span>
                          </div>
                        )}

                        {/* Date and Status */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs md:text-sm font-medium text-gray-700">
                            {sub.displayDate}
                          </p>
                          {sub.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full animate-pulse inline-flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                              Mengirim...
                            </span>
                          )}
                          {sub.status === 'failed' && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                              Gagal
                            </span>
                          )}
                          {sub.totalScore >= 100 && !sub.status && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full font-medium">
                              🏆 Perfect!
                            </span>
                          )}
                        </div>
                        
                        {/* Date & Time - Format: Hari (DD/MM/YYYY | HH:MM) */}
                        <p className="text-xs text-gray-500">
                          📅 {(() => {
                            // Gunakan createdAt (timestamp lengkap) bukan date (date-only)
                            const timestamp = sub.createdAt || sub.date;
                            const dateObj = new Date(timestamp);

                            // Cek apakah valid date
                            if (isNaN(dateObj.getTime())) {
                              console.error('❌ Invalid timestamp:', { timestamp, sub });
                              return 'Waktu tidak valid';
                            }

                            // Nama hari dalam bahasa Indonesia
                            const dayName = dateObj.toLocaleDateString('id-ID', {
                              weekday: 'long'
                            });

                            // Tanggal: DD/MM/YYYY
                            const dateStr = dateObj.toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });

                            // Waktu: HH:MM (tanpa detik)
                            const timeStr = dateObj.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            // Format: Hari (DD/MM/YYYY | HH:MM)
                            return `${dayName} (${dateStr} | ${timeStr})`;
                          })()}
                        </p>

                        {/* Notes if available */}
                        {sub.notes && sub.notes.reason && sub.notes.reason !== '-' && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs space-y-1">
                            <p className="font-semibold text-orange-800 mb-1">📝 Submit dengan Catatan</p>
                            <div className="space-y-0.5">
                              <p className="text-orange-700"><strong>Reason:</strong> {sub.notes.reason}</p>
                              {sub.notes.approval && sub.notes.approval !== '-' && (
                                <p className="text-orange-700"><strong>Approval:</strong> {sub.notes.approval}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Score Badge */}
                      <div className={`
                        px-3 md:px-4 py-2 rounded-full text-white font-bold flex-shrink-0 text-sm md:text-base
                        ${sub.totalScore >= 100 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 
                          sub.totalScore >= 80 ? 'bg-green-500' : 
                          'bg-red-500'}
                      `}>
                        {sub.totalScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Load More Button */}
          {!isAdmin && hasMore && totalSubmissions > 0 && (
            <div className="mt-4 space-y-3">
              <div className="text-center text-sm text-gray-600">
                Menampilkan <strong>{mySubmissions.length}</strong> dari <strong>{totalCount}</strong> submission
              </div>
              <Button
                onClick={() => {
                  console.log('🔽 Load more submissions...');
                  console.log('Current limit:', displayLimit);
                  console.log('New limit:', displayLimit + 10);
                  setDisplayLimit(prev => prev + 10);
                }}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                📥 Muat 10 Data Lagi
              </Button>
            </div>
          )}

          {/* Info: Semua data sudah ditampilkan */}
          {!isAdmin && !hasMore && totalSubmissions > 0 && totalSubmissions > 10 && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center">
              <p className="text-lg mb-2">✅</p>
              <p className="text-sm text-green-700 font-medium mb-1">
                Semua <strong>{totalCount}</strong> data Anda sudah ditampilkan
              </p>
              <p className="text-xs text-green-600">
                Tidak ada lagi data untuk dimuat
              </p>
            </div>
          )}

          {/* Info footer */}
          {totalSubmissions > 0 && (
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700 text-center flex items-center justify-center gap-2">
                  {submissionsFetching && !submissionsLoading && (
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {submissionsFetching && !submissionsLoading ? (
                    <>Memperbarui data...</>
                  ) : (
                    <>⚡ Data dimuat instant dari cache lokal</>
                  )}
                </div>
              </div>

              {/* Tips Box */}
              <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-semibold text-purple-900 mb-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  💡 Tips: Cek Update Data
                </p>
                <ul className="text-[11px] text-purple-700 space-y-1">
                  <li>• Klik <strong>"Refresh"</strong> untuk cek apakah ada submission baru</li>
                  <li>• Klik <strong>"Clear Cache"</strong> jika data tidak muncul lengkap</li>
                  <li>• Data auto-refresh saat buka riwayat atau kembali dari tab lain</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-2 md:p-4">
      {/* ���� SUBMIT LOADING SCREEN - RESTORED! */}
      {isSubmitting && <SubmitLoadingScreen />}

      <div className="max-w-4xl mx-auto">
        {/* Header - RESPONSIVE */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                <Crown className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  CROWN DAILY INDICATORS
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs md:text-sm text-gray-600">{user.nama} ({user.nik})</p>
                  {user.role && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold border ${ROLE_COLORS[user.role]}`}>
                      {ROLE_DISPLAY_NAMES[user.role]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <Button variant="outline" onClick={() => setShowHistory(true)} className="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4">
                <History className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Riwayat</span>
                <span className="sm:hidden">History</span>
              </Button>
              {/* Only show Back button if it's different from Logout (accessed from main page) */}
              {onBack !== onLogout && (
                <Button variant="outline" onClick={onBack} className="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4">
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">Kembali</span>
                </Button>
              )}
              <Button variant="outline" onClick={onLogout} className="text-xs md:text-sm h-8 md:h-10 px-2 md:px-4">
                <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Offline Indicator */}
        {isOffline && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Offline Mode</p>
              <p className="text-xs text-red-700">Data akan disimpan lokal dan dikirim otomatis saat online</p>
            </div>
          </div>
        )}

        {/* Draft Notification */}
        {hasDraft && draftInfo && (
          <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Draft Tersimpan</p>
                <p className="text-xs text-yellow-700 mb-2">
                  Terakhir disimpan: {new Date(draftInfo.timestamp).toLocaleString('id-ID')}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={restoreDraft}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white h-8 text-xs"
                  >
                    Pulihkan Draft
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={discardDraft}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-50 h-8 text-xs"
                  >
                    Hapus Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-save Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 flex items-center gap-2 text-xs text-blue-700">
          <CheckCircle className="w-4 h-4" />
          <span>Auto-save aktif - Data tersimpan otomatis setiap 30 detik</span>
        </div>

        {/* Score Card - RESPONSIVE */}
        <Card className={`mb-4 md:mb-6 border-2 ${scoreColor}`}>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-gray-600">Total Pencapaian</p>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(submissionDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {/* Tanggal Input - bisa diedit */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Tanggal Submit:</label>
                  <Input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full md:w-auto text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
              </div>
              <div className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${totalScore < minSubmitScore ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'} w-fit h-fit`}>
                {totalScore < minSubmitScore ? `Minimal ${minSubmitScore}%` : 'Siap Submit'}
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold mb-2">{totalScore}%</div>
            <div className={`h-3 md:h-4 rounded-full overflow-hidden ${scoreBadge}`}>
              <div className="h-full bg-white/30" style={{ width: `${100 - totalScore}%`, marginLeft: `${totalScore}%` }}></div>
            </div>
            {totalScore >= minSubmitScore && (
              <p className={`text-xs md:text-sm font-medium mt-2 ${totalScore >= 100 ? 'text-red-700' : 'text-green-700'}`}>
                {motivationMessage}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Indicators - RESPONSIVE - NO LOADING! INSTANT! */}
        <div className="space-y-3 md:space-y-4">
          {indicators.map((indicator) => {
            const Icon = iconMap[indicator.icon || 'Target'];
            const inputData = data[indicator.id] || { value: undefined, photos: [] };
            const score = getIndicatorScore(indicator.id);

            return (
              <Card key={indicator.id}>
                <CardHeader className="pb-2 md:pb-3 px-4 md:px-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-red-50 rounded-lg">
                      <Icon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{indicator.name}</CardTitle>
                      <p className="text-xs text-gray-600">
                        {indicator.type === 'photo' && `Target: ${indicator.targetPhotos} foto`}
                        {indicator.type === 'number' && indicator.targetValue && `Target: ${indicator.targetValue.toLocaleString('id-ID')}`}
                        {indicator.type === 'number+photo' && `Target: ${indicator.targetValue} + ${indicator.targetPhotos} foto`}
                        {indicator.type === 'text' && 'Target: Isi text'}
                        {indicator.type === 'dropdown' && 'Target: Pilih opsi'}
                        {indicator.type === 'checkbox' && 'Target: Centang checkbox'}
                        {indicator.isSpecial && indicator.specialFormula && ` | ${indicator.specialFormula}`}
                        {indicator.weight && ` | Bobot: ${indicator.weight}% (Maksimal)`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(indicator.type === 'number' || indicator.type === 'number+photo') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pencapaian {indicator.name}</label>
                      <Input
                        type="text"
                        placeholder={indicator.placeholder || `Masukkan nilai ${indicator.name.toLowerCase()}`}
                        value={inputData.value ? formatNumber(inputData.value) : ''}
                        onChange={(e) => {
                          const formatted = formatNumberInput(e.target.value);
                          const numValue = parseFormattedNumber(formatted);
                          handleInputChange(indicator.id, numValue);
                        }}
                        disabled={indicator.id === 'basket' || indicator.id === 'basketSize'}
                        className={(indicator.id === 'basket' || indicator.id === 'basketSize') ? 'bg-gray-100 cursor-not-allowed' : ''}
                      />
                      {(indicator.id === 'basket' || indicator.id === 'basketSize') && (
                        <p className="text-xs text-blue-600">
                          ✨ Otomatis: Sales ÷ Trx = {inputData.value ? formatNumber(inputData.value) : '0'}
                        </p>
                      )}
                      {indicator.targetValue && !(indicator.id === 'basket' || indicator.id === 'basketSize') && (
                        <p className="text-xs text-gray-500">Target: {formatNumber(indicator.targetValue)}</p>
                      )}
                    </div>
                  )}

                  {(indicator.type === 'photo' || indicator.type === 'number+photo') && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">{indicator.placeholder || 'Upload Foto Bukti'}</label>

                      {/* 📸 MULTIPLE PHOTO INPUTS - 1 button per foto! */}
                      {indicator.targetPhotos && indicator.targetPhotos > 1 ? (
                        // Multiple photos: Render individual buttons
                        <div className="space-y-2">
                          {Array.from({ length: indicator.targetPhotos }).map((_, photoIndex) => {
                            const photo = inputData.photos?.[photoIndex];
                            const hasPhoto = !!photo;

                            return (
                              <div key={photoIndex} className="space-y-1">
                                {/* Photo Button Label */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">
                                    📸 Foto {photoIndex + 1}
                                    {hasPhoto && <span className="text-green-600 ml-1">✓</span>}
                                  </span>
                                  {hasPhoto && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(indicator.id, photoIndex)}
                                      className="text-xs text-red-600 hover:text-red-800 underline"
                                    >
                                      Hapus
                                    </button>
                                  )}
                                </div>

                                {/* Photo Input */}
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(indicator.id, e.target.files, photoIndex)}
                                    className="flex-1"
                                  />
                                  {hasPhoto && (
                                    <span className="text-xs text-green-600 whitespace-nowrap">
                                      ✓ Uploaded
                                    </span>
                                  )}
                                </div>

                                {/* Photo Preview */}
                                {hasPhoto && photo && (
                                  <div className="mt-1">
                                    {typeof photo === 'string' && photo.startsWith('data:') && (
                                      <img
                                        src={photo}
                                        alt={`Foto ${photoIndex + 1}`}
                                        className="w-20 h-20 object-cover rounded border border-gray-300"
                                      />
                                    )}
                                    {typeof photo === 'string' && !photo.startsWith('data:') && (
                                      <p className="text-xs text-gray-500">Foto tersimpan</p>
                                    )}
                                    {(photo instanceof File || photo instanceof Blob) && (
                                      <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Foto ${photoIndex + 1}`}
                                        className="w-20 h-20 object-cover rounded border border-gray-300"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Summary */}
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              Progress: <strong className={inputData.photos?.length === indicator.targetPhotos ? 'text-green-600' : 'text-orange-600'}>
                                {inputData.photos?.length || 0}/{indicator.targetPhotos}
                              </strong> foto
                              {inputData.photos?.length === indicator.targetPhotos && (
                                <span className="text-green-600 ml-1">✓ Lengkap!</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Single photo: Original simple input
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(indicator.id, e.target.files, 0)}
                          />
                          {inputData.photos && inputData.photos.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-green-600">
                                ✓ 1 foto dipilih
                              </p>
                              {/* Preview for single photo */}
                              {inputData.photos[0] && (
                                <>
                                  {typeof inputData.photos[0] === 'string' && inputData.photos[0].startsWith('data:') && (
                                    <img
                                      src={inputData.photos[0]}
                                      alt="Preview"
                                      className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                  )}
                                  {(inputData.photos[0] instanceof File || inputData.photos[0] instanceof Blob) && (
                                    <img
                                      src={URL.createObjectURL(inputData.photos[0])}
                                      alt="Preview"
                                      className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {indicator.type === 'text' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{indicator.name}</label>
                      <Input
                        type="text"
                        placeholder={indicator.placeholder || indicator.targetText || `Masukkan ${indicator.name.toLowerCase()}`}
                        value={inputData.textValue || ''}
                        onChange={(e) => handleTextChange(indicator.id, e.target.value)}
                      />
                    </div>
                  )}

                  {indicator.type === 'dropdown' && indicator.dropdownOptions && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{indicator.name}</label>
                      <select
                        value={inputData.dropdownValue || ''}
                        onChange={(e) => handleDropdownChange(indicator.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">{indicator.placeholder || `Pilih ${indicator.name}`}</option>
                        {indicator.dropdownOptions.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {indicator.type === 'checkbox' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`checkbox-${indicator.id}`}
                          checked={inputData.checkboxValue || false}
                          onChange={(e) => handleCheckboxChange(indicator.id, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`checkbox-${indicator.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{indicator.name}</label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span>Pencapaian: {score.percentage.toFixed(1)}%</span>
                    <span className="font-medium text-red-600">
                      Point: {score.score}% dari {indicator.weight}%
                    </span>
                  </div>
                  <Progress value={score.percentage} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Buttons - RESPONSIVE */}
        <div className="mt-4 md:mt-6 mb-6 md:mb-8 space-y-2 md:space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full text-sm md:text-base h-11 md:h-12"
          >
            {canSubmit
              ? `Submit Data (Score: ${totalScore}%)`
              : `Submit Tidak Tersedia (Minimal ${minSubmitScore}%, Sekarang: ${totalScore}%)`}
          </Button>

          {/* Submit Dengan Catatan - hanya muncul jika score < minSubmitScore */}
          {totalScore < minSubmitScore && (
            <Button
              onClick={() => setShowNotesDialog(true)}
              variant="outline"
              className="w-full border-2 border-orange-400 text-orange-700 hover:bg-orange-50 text-sm md:text-base h-11 md:h-12"
            >
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Submit Dengan Catatan (Score: {totalScore}%)
            </Button>
          )}
        </div>

        {/* NO LOADING SCREEN - Submit is INSTANT like Google Form! */}
      </div>

      {/* Dialog Submit Dengan Catatan - RESPONSIVE */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              Submit Dengan Catatan
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Score Anda saat ini <strong>{totalScore}%</strong>. Silakan isi form berikut untuk submit dengan persetujuan admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 py-3 md:py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">Reason (Alasan)</label>
              <Textarea
                id="reason"
                placeholder="Contoh: Stok barang sedang kosong, pengiriman terlambat, dll"
                value={notesReason}
                onChange={(e) => setNotesReason(e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="approval" className="text-sm font-medium">Approval (Persetujuan)</label>
              <Textarea
                id="approval"
                placeholder="Contoh: Disetujui oleh Manager, Approved by Supervisor, dll"
                value={notesApproval}
                onChange={(e) => setNotesApproval(e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Verifikasi Admin</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="adminNik" className="text-sm font-medium">NIK Admin</label>
                  <Input
                    id="adminNik"
                    name="x-admin-verify-nik"
                    placeholder="Masukkan NIK Admin"
                    value={notesAdminNik}
                    onChange={(e) => setNotesAdminNik(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="adminNama" className="text-sm font-medium">Nama Admin</label>
                  <Input
                    id="adminNama"
                    name="x-admin-verify-nama"
                    type="text"
                    placeholder="Masukkan Nama Admin"
                    value={notesAdminNama}
                    onChange={(e) => setNotesAdminNama(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc' } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmitWithNotes}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              size="lg"
            >
              Submit Dengan Catatan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}