import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download, Trash2, Calendar, User, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, Briefcase } from 'lucide-react';
import { Branch, Submission, UserRole, Indicator } from '../../types';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { queryClient } from '../../lib/queryClient';
import { ROLE_DISPLAY_NAMES, ROLE_COLORS, DEFAULT_ROLE_INDICATORS } from '../../utils/roleIndicators';

interface AdminHistoryProps {
  branch: Branch;
}

export default function AdminHistory({ branch }: AdminHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterNik, setFilterNik] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState(''); // YYYY-MM
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📄 PAGINATION: 50 data per halaman
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [paginationInfo, setPaginationInfo] = useState<any>(null);

  // 📊 STATISTICS: Load ALL data untuk statistik (terpisah dari pagination)
  const [allSubmissionsForStats, setAllSubmissionsForStats] = useState<Submission[]>([]);

  // 🔽 SORTING
  type SortField = 'date' | 'nik' | 'nama' | 'score';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default: newest first

  useEffect(() => {
    loadSubmissions();
    loadIndicators();
    // REMOVED: Auto-refresh setiap 5s - tidak diperlukan, bisa manual refresh saja!
    // const interval = setInterval(loadSubmissions, 5000);
    // return () => clearInterval(interval);
  }, [branch.id, currentPage, sortField, sortDirection]); // Re-fetch saat ganti page atau sorting

  useEffect(() => {
    // Load ALL submissions untuk statistik (update saat sorting berubah)
    loadAllSubmissionsForStats();
  }, [branch.id, sortField, sortDirection]);

  const loadSubmissions = async () => {
    console.log('');
    console.log('🔥 ===== ADMIN HISTORY LOADING =====');
    console.log('📊 Branch ID:', branch.id);
    console.log('👤 Admin loading ALL submissions...');

    setIsLoading(true);
    setError(null);

    // 🔔 NOTIFIKASI: Beri tahu user sedang loading
    toast.loading('Memuat data submission... Tunggu 5-15 detik untuk cold start', {
      id: 'loading-submissions',
      duration: 30000 // 30 detik untuk admin operations
    });

    // ⚠️ CACHE DISABLED: Admin data terlalu besar untuk localStorage
    // QuotaExceededError: Data 100+ submission terlalu besar

    try {
      console.log('📡 Fetching from server...');
      console.log('⏱️ Timeout: 15 seconds (cold start bisa 5-10 detik)');
      console.log(`📄 Page: ${currentPage} | Items per page: ${itemsPerPage}`);
      console.log(`🔽 Sort: ${sortField} (${sortDirection})`);
      const result = await api.getSubmissions(branch.id, currentPage, itemsPerPage, undefined, sortField, sortDirection);
      console.log('📊 Server response:', result);
      console.log('📋 Submissions count:', result.submissions?.length || 0);

      const data = result.submissions || [];
      setSubmissions(data); // Tidak perlu reverse, user bisa sort manual
      setPaginationInfo(result.pagination); // Store pagination info dari backend
      setError(null);

      // ⚠️ CACHE DISABLED: Data terlalu besar (100+ submissions exceed localStorage quota)
      console.log('✅ Admin submissions loaded:', data.length, '(cache disabled - too large)');
      console.log('📊 Pagination info:', result.pagination);

      // 🔔 NOTIFIKASI: Dismiss loading & show success
      toast.dismiss('loading-submissions');
      toast.success(`✅ Berhasil memuat ${data.length} submission`, {
        duration: 3000
      });
    } catch (error: any) {
      console.error('❌ Error loading admin submissions:', error);
      const errorMsg = error?.message || 'Server timeout atau tidak dapat diakses';
      setError(errorMsg);

      // 🔔 NOTIFIKASI: Dismiss loading & show error
      toast.dismiss('loading-submissions');
      toast.error('Gagal memuat data: ' + errorMsg, {
        duration: 5000
      });
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }

    console.log('============================');
    console.log('');
  };

  const loadAllSubmissionsForStats = async () => {
    console.log('📊 Loading ALL submissions for statistics...');
    try {
      // Load with same sorting as current view
      const result = await api.getSubmissions(branch.id, 1, 999999, undefined, sortField, sortDirection);
      const allData = result.submissions || [];
      setAllSubmissionsForStats(allData);
      console.log(`✅ Loaded ${allData.length} submissions for statistics`);
    } catch (error) {
      console.error('❌ Error loading all submissions for stats:', error);
      setAllSubmissionsForStats([]);
    }
  };

  const loadIndicators = async () => {
    // ⚡ INSTANT: Cek cache dulu
    try {
      const cached = localStorage.getItem(`indicators_${branch.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) { // 30 menit
          console.log('⚡ Admin indicators loaded from cache');
          setIndicators(parsed.data);
          return; // Skip network!
        }
      }
    } catch (e) {
      console.error('Cache error:', e);
    }

    const data = await api.getIndicators(branch.id);
    setIndicators(data);
  };

  // 🔽 SORT HANDLER
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction jika klik kolom yang sama
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set field baru dengan default asc
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset ke page 1 saat ganti sorting
    setCurrentPage(1);
  };

  // FILTER saja (sorting sudah dilakukan di backend!)
  const filteredSubmissions = submissions.filter(s => {
    const nikMatch = !filterNik || s.user.nik.toLowerCase().includes(filterNik.toLowerCase()) || s.user.nama.toLowerCase().includes(filterNik.toLowerCase());
    const dateMatch = !filterDate || new Date(s.date).toDateString() === new Date(filterDate).toDateString();

    // 📅 MONTH FILTER: Filter berdasarkan bulan (YYYY-MM)
    const monthMatch = !filterMonth || s.date.startsWith(filterMonth);

    // 👔 ROLE FILTER: Filter berdasarkan role
    const roleMatch = filterRole === 'all' || s.user.role === filterRole;

    return nikMatch && dateMatch && monthMatch && roleMatch;
  });

  // 📊 PAGINATION INFO dari backend API
  const totalPages = paginationInfo?.totalPages || 1;
  const totalItems = paginationInfo?.total || 0;

  // ⚡ SMART NEXT BUTTON: Disabled kalau data di current page < 50 (berarti sudah habis)
  const hasNextPage = submissions.length >= itemsPerPage && (paginationInfo?.hasMore || false);
  const hasPrevPage = currentPage > 1;

  // 🔄 FETCH ALL DATA untuk export (tanpa pagination)
  const fetchAllSubmissions = async (): Promise<Submission[]> => {
    console.log('📥 Fetching ALL submissions for export...');
    toast.loading('Mengambil semua data untuk export...', { id: 'fetch-all' });

    try {
      // Fetch dengan limit besar untuk dapat semua data (dengan sorting yang sama!)
      const result = await api.getSubmissions(branch.id, 1, 999999, undefined, sortField, sortDirection);
      toast.dismiss('fetch-all');
      console.log(`✅ Fetched ${result.submissions?.length || 0} total submissions`);

      // Update stats juga kalau perlu
      const allData = result.submissions || [];
      setAllSubmissionsForStats(allData);

      return allData;
    } catch (error) {
      toast.dismiss('fetch-all');
      toast.error('Gagal fetch semua data untuk export!');
      console.error('Export fetch error:', error);
      return [];
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 🔒 SAFETY: Hanya select data di HALAMAN SAAT INI (bukan semua data!)
      const idsInCurrentPage = filteredSubmissions.map(s => s.id);

      console.log('');
      console.log('✅ SELECT ALL - Current Page Only');
      console.log('Items in current page:', idsInCurrentPage.length);
      console.log('Total items in database:', paginationInfo?.total || 'unknown');
      console.log('Selected IDs:', idsInCurrentPage);
      console.log('');

      // Konfirmasi jika banyak data
      if (idsInCurrentPage.length > 20) {
        const confirmed = confirm(
          `⚠️ SELECT ALL (HALAMAN INI SAJA)\n\n` +
          `Anda akan memilih ${idsInCurrentPage.length} data di halaman ini.\n\n` +
          `🔒 HANYA data di halaman ini yang dipilih, BUKAN semua ${paginationInfo?.total || 'data'} data di database!\n\n` +
          `Lanjutkan?`
        );
        if (!confirmed) {
          console.log('❌ Select all cancelled');
          return;
        }
      }

      setSelectedIds(idsInCurrentPage);
    } else {
      console.log('❌ Unselect all');
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih data yang ingin dihapus!');
      return;
    }

    // 🔒 KONFIRMASI SUPER JELAS: Tunjukkan berapa data yang akan dihapus
    const totalData = paginationInfo?.total || submissions.length;
    const confirmMessage = `⚠️ KONFIRMASI HAPUS DATA\n\n` +
      `Total data di database: ${totalData}\n` +
      `Data yang DIPILIH untuk dihapus: ${selectedIds.length}\n\n` +
      `🔴 YANG AKAN DIHAPUS: HANYA ${selectedIds.length} DATA YANG DI-CEKLIS!\n` +
      `✅ Yang lain (${totalData - selectedIds.length} data) AMAN, tidak akan terhapus.\n\n` +
      `Data yang dihapus TIDAK BISA dikembalikan!\n\n` +
      `Lanjutkan hapus ${selectedIds.length} data?`;

    if (!confirm(confirmMessage)) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    console.log('');
    console.log('🗑️ ===== DELETE OPERATION =====');
    console.log('Selected IDs to delete:', selectedIds);
    console.log('Count:', selectedIds.length);
    console.log('Branch:', branch.id);

    // 🔔 Loading notification
    toast.loading(`Menghapus ${selectedIds.length} data...`, {
      id: 'delete-operation',
      duration: 30000
    });

    try {
      const success = await api.deleteSubmissions(branch.id, selectedIds);

      if (success) {
        toast.dismiss('delete-operation');

        console.log('');
        console.log('✅ ===== DELETE SUCCESSFUL =====');
        console.log(`Removed ${selectedIds.length} items from server`);

        // 🔥 STEP 1: GLOBAL CACHE INVALIDATION - Semua component akan refetch!
        console.log('🔥 Step 1: GLOBAL cache invalidation...');

        // Invalidate ALL submissions queries (admin + user!)
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        queryClient.removeQueries({ queryKey: ['submissions'] });
        queryClient.invalidateQueries({ queryKey: ['submissions-infinite'] });
        queryClient.removeQueries({ queryKey: ['submissions-infinite'] });

        console.log('  ✅ React Query cache invalidated (ALL components akan refetch fresh!)');

        // 🔥 STEP 2: Clear localStorage submissions cache (semua branch!)
        console.log('🔥 Step 2: Clear localStorage submissions cache...');
        let clearedCount = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.includes('submissions_')) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        }
        console.log(`  ✅ Cleared ${clearedCount} localStorage cache entries`);

        // 🚀 STEP 3: IMMEDIATE STATE UPDATE (Admin UI) - NO RELOAD!
        console.log('🚀 Step 3: Update admin UI state immediately...');

        // 1. Remove from current submissions display
        const updatedSubmissions = submissions.filter(s => !selectedIds.includes(s.id));
        console.log(`  Current page: ${submissions.length} → ${updatedSubmissions.length}`);
        setSubmissions(updatedSubmissions);

        // 2. Remove from stats/all submissions
        const updatedAllSubmissions = allSubmissionsForStats.filter(s => !selectedIds.includes(s.id));
        console.log(`  All submissions: ${allSubmissionsForStats.length} → ${updatedAllSubmissions.length}`);
        setAllSubmissionsForStats(updatedAllSubmissions);

        // 3. Update pagination
        if (paginationInfo) {
          const newTotal = paginationInfo.total - selectedIds.length;
          const newTotalPages = Math.ceil(newTotal / itemsPerPage);
          setPaginationInfo({
            ...paginationInfo,
            total: newTotal,
            totalPages: newTotalPages,
          });
          console.log(`  Pagination: ${paginationInfo.total} total → ${newTotal} total`);
        }

        // 4. Clear selected
        setSelectedIds([]);

        // 5. Success notification
        toast.success(`✅ ${selectedIds.length} data berhasil dihapus dari SISTEM! User juga akan lihat perubahan.`, {
          duration: 4000
        });

        // 🔥 STEP 4: BROADCAST DELETE EVENT ke semua tab/user!
        console.log('🔥 Step 4: Broadcasting delete event to ALL users/tabs...');

        const deleteEvent = {
          type: 'SUBMISSIONS_DELETED',
          branchId: branch.id,
          deletedIds: selectedIds,
          timestamp: Date.now()
        };

        // Method 1: localStorage (untuk cross-tab communication)
        localStorage.setItem('delete_event', JSON.stringify(deleteEvent));
        setTimeout(() => localStorage.removeItem('delete_event'), 100);

        // Method 2: Custom Event (untuk same-tab communication)
        window.dispatchEvent(new CustomEvent('submissions-deleted', {
          detail: deleteEvent
        }));

        // Method 3: BroadcastChannel (modern browsers)
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('submissions-channel');
          channel.postMessage(deleteEvent);
          channel.close();
        }

        console.log('  ✅ Delete event broadcasted via localStorage, CustomEvent, & BroadcastChannel');

        console.log('✅ ===== DELETE COMPLETE =====');
        console.log('Admin UI: Updated ✅');
        console.log('Global cache: Invalidated ✅');
        console.log('Delete event: Broadcasted ✅');
        console.log('User akan INSTANT refetch saat terima event ✅');
        console.log('============================');
        console.log('');
      } else {
        toast.dismiss('delete-operation');
        toast.error('❌ Gagal menghapus data! Server error.', {
          duration: 5000
        });
        console.error('❌ Delete failed - server returned false');
      }
    } catch (error: any) {
      toast.dismiss('delete-operation');
      toast.error(`❌ Error: ${error.message || 'Network error'}`, {
        duration: 5000
      });
      console.error('❌ Delete error:', error);
    }

    console.log('============================');
    console.log('');
  };

  const handleExportCSV = async () => {
    const allData = await fetchAllSubmissions();
    if (allData.length === 0) {
      toast.error('Tidak ada data untuk di-export!');
      return;
    }

    // Build indicator name lookup gabungan: backend + hardcoded defaults
    const indNameMap: Record<string, string> = {};
    const indRoleMap: Record<string, string> = {};
    indicators.forEach(ind => {
      indNameMap[ind.id] = ind.name;
      if (ind.role) indRoleMap[ind.id] = ind.role;
    });
    (['Advisor', 'Cashier', 'CS'] as const).forEach(role => {
      DEFAULT_ROLE_INDICATORS[role].forEach(ind => {
        if (!indNameMap[ind.id]) {
          indNameMap[ind.id] = ind.name;
          indRoleMap[ind.id] = role;
        }
      });
    });

    // Urutan: Advisor → Cashier → CS
    const roleOrder: Record<string, number> = { Advisor: 0, Cashier: 1, CS: 2 };
    const indicatorIds = Object.keys(indNameMap).sort((a, b) => {
      const ra = roleOrder[indRoleMap[a]] ?? 99;
      const rb = roleOrder[indRoleMap[b]] ?? 99;
      return ra - rb;
    });

    // Build header row
    const headers = ['No', 'Tanggal', 'Waktu', 'NIK', 'Nama', 'Role', 'Total Score'];
    indicatorIds.forEach(id => {
      const roleTag = indRoleMap[id] ? `[${indRoleMap[id]}] ` : '';
      headers.push(`${roleTag}${indNameMap[id] || id}`);
    });
    headers.push('Submit dengan catatan');

    // Build data rows
    const rows = allData.map((s, idx) => {
      const date = new Date(s.date);
      const row: string[] = [
        (idx + 1).toString(),
        date.toLocaleDateString('id-ID'),
        date.toLocaleTimeString('id-ID'),
        s.user.nik,
        s.user.nama,
        s.user.role ? ROLE_DISPLAY_NAMES[s.user.role] || s.user.role : '-',
        `${s.totalScore}%`
      ];

      // Nilai tiap indikator
      indicatorIds.forEach(id => {
        const found = s.data?.find((d: any) => d.id === id);
        row.push(found ? String(found.value ?? '-') : '-');
      });

      // Catatan / notes
      if (s.notes) {
        row.push(`Reason: ${s.notes.reason} | Approval: ${s.notes.approval} | Admin: ${s.notes.adminNama} (${s.notes.adminNik})`);
      } else {
        row.push('-');
      }

      return row;
    });

    // BOM + CSV
    const csvContent = '﻿' + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat_${branch.nik}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Data CSV berhasil diexport!');
  };

  const handleSmartExport = async () => {
    const allData = await fetchAllSubmissions();
    if (allData.length === 0) {
      toast.error('Tidak ada data untuk di-export!');
      return;
    }
    await handleExportExcel(allData);
  };

  const handleExportExcel = async (allData: Submission[]) => {
    setIsExporting(true);
    toast.loading('Sedang membuat file Excel dengan foto...');

    try {
      // 🔍 DEBUG: Log photos data
      console.log('🔍 EXCEL EXPORT DEBUG - Total submissions:', allData.length);
      allData.forEach((sub, idx) => {
        const topPhotos = (sub as any).photos;
        const dataPhotos = sub.data.filter(d => d.photos && d.photos.length > 0);
        if (topPhotos || dataPhotos.length > 0) {
          console.log(`📸 Submission ${idx + 1}:`, {
            id: sub.id,
            topPhotos: topPhotos,
            dataPhotos: dataPhotos.map(d => ({ id: d.id, count: d.photos?.length }))
          });
        }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Riwayat Submission');

      // 🎯 GABUNGAN INDICATORS: backend + hardcoded defaults per role
      // Pastikan semua indicator dari semua role muncul, walaupun backend belum punya entries.
      const mergedMap = new Map<string, any>();
      indicators.forEach(ind => mergedMap.set(ind.id, ind));
      (['Advisor', 'Cashier', 'CS'] as const).forEach(role => {
        DEFAULT_ROLE_INDICATORS[role].forEach(ind => {
          if (!mergedMap.has(ind.id)) mergedMap.set(ind.id, ind);
        });
      });
      // Sort: Advisor → Cashier → CS, lalu order
      const roleOrder: Record<string, number> = { Advisor: 0, Cashier: 1, CS: 2 };
      const allIndicators = Array.from(mergedMap.values()).sort((a, b) => {
        const ra = roleOrder[a.role] ?? 99;
        const rb = roleOrder[b.role] ?? 99;
        if (ra !== rb) return ra - rb;
        return (a.order || 0) - (b.order || 0);
      });

      // Header
      const headers = ['No', 'Tanggal', 'Waktu', 'NIK', 'Nama', 'Role', 'Total Score'];

      // Pre-scan: cari berapa foto max per indicator dari actual data
      const maxPhotosPerIndicator: Record<string, number> = {};
      for (const submission of allData) {
        // Cek dari indicatorData.photos
        for (const item of submission.data) {
          if (item.photos && item.photos.length > 0) {
            maxPhotosPerIndicator[item.id] = Math.max(
              maxPhotosPerIndicator[item.id] || 0,
              item.photos.length
            );
          }
        }
        // Cek juga dari submission.photos top-level (Drive URLs)
        const topPhotos = (submission as any).photos as Record<string, string[]> | undefined;
        if (topPhotos) {
          for (const [id, urls] of Object.entries(topPhotos)) {
            if (Array.isArray(urls) && urls.length > 0) {
              maxPhotosPerIndicator[id] = Math.max(
                maxPhotosPerIndicator[id] || 0,
                urls.length
              );
            }
          }
        }
      }

      // Build headerMap — semua indicator dapat value column, yang punya foto dapat foto columns
      const headerMap: { indicator: any; photoIndex?: number }[] = [];
      allIndicators.forEach(ind => {
        const hasPhotoData = (maxPhotosPerIndicator[ind.id] || 0) > 0;
        const isPhotoType = ind.type === 'photo' || ind.type === 'number+photo';
        const roleTag = ind.role ? `[${ind.role}] ` : '';

        // Value column (skip for pure photo type)
        if (ind.type !== 'photo') {
          headers.push(isPhotoType ? `${roleTag}${ind.name} (Nilai)` : `${roleTag}${ind.name}`);
          headerMap.push({ indicator: ind, photoIndex: undefined });
        }

        // Photo columns: untuk photo/number+photo type ATAU jika ada foto di data aktual
        if (isPhotoType || hasPhotoData) {
          const maxPhotos = Math.max(ind.targetPhotos || 1, maxPhotosPerIndicator[ind.id] || 1);
          for (let i = 0; i < maxPhotos; i++) {
            headers.push(`${roleTag}${ind.name} Foto ${i + 1}`);
            headerMap.push({ indicator: ind, photoIndex: i });
          }
        }
      });

      // Add "Submit dengan catatan" column at the end
      headers.push('Submit dengan catatan');

      worksheet.addRow(headers);

      // Style header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD32F2F' } // Red AZKO
      };
      headerRow.height = 25;
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Data rows with photos
      let rowIndex = 2;
      for (const submission of allData) {
        const date = new Date(submission.date);
        const rowData = [
          rowIndex - 1,
          date.toLocaleDateString('id-ID'),
          date.toLocaleTimeString('id-ID'),
          submission.user.nik,
          submission.user.nama,
          submission.user.role ? ROLE_DISPLAY_NAMES[submission.user.role] || submission.user.role : '-',
          `${submission.totalScore}%`
        ];

        // Add indicator data based on headerMap
        for (const headerInfo of headerMap) {
          const indicator = headerInfo.indicator;
          const indicatorData = submission.data.find(d => d.id === indicator.id);

          if (!indicatorData) {
            rowData.push('-');
            continue;
          }

          if (headerInfo.photoIndex !== undefined) {
            // Photo column — will be filled with embedded image below
            rowData.push('');
          } else {
            // Value column
            if (indicator.type === 'number' || indicator.type === 'number+photo') {
              rowData.push(indicatorData.value?.toString() || '-');
            } else if (indicator.type === 'text') {
              rowData.push(indicatorData.textValue || '-');
            } else if (indicator.type === 'dropdown') {
              rowData.push(indicatorData.dropdownValue || '-');
            } else if (indicator.type === 'checkbox') {
              rowData.push(indicatorData.checkboxValue ? '✓' : '✗');
            } else {
              rowData.push(indicatorData.value?.toString() || '-');
            }
          }
        }

        // Add "Submit dengan catatan" data
        if (submission.notes) {
          const notesText = `Reason: ${submission.notes.reason}\nApproval: ${submission.notes.approval}\nAdmin: ${submission.notes.adminNama} (${submission.notes.adminNik})`;
          rowData.push(notesText);
        } else {
          rowData.push('-');
        }

        const row = worksheet.addRow(rowData);
        row.height = 80; // Tinggi row untuk foto

        // Add photos to cells - each photo in its own column
        let colIndex = 8; // Start from column 8 (after No, Date, Time, NIK, Name, Role, Score)

        for (const headerInfo of headerMap) {
          const indicator = headerInfo.indicator;
          const photoIdx = headerInfo.photoIndex;

          // Only process photo columns
          if (photoIdx !== undefined) {
            const indicatorData = submission.data.find(d => d.id === indicator.id);

            // Cek foto di indicatorData.photos dulu, fallback ke submission.photos (top-level)
            const photosArray: any[] =
              indicatorData?.photos?.length
                ? indicatorData.photos
                : ((submission as any).photos?.[indicator.id] || []);

            const photoData = photosArray[photoIdx];

            if (photoData) {
              try {
                let base64Data: string | null = null;
                let mimeExt: 'jpeg' | 'png' = 'jpeg';

                if (photoData instanceof File || photoData instanceof Blob) {
                  base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      if (result.includes('image/png')) mimeExt = 'png';
                      resolve(result.split(',')[1] || '');
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(photoData);
                  });
                } else if (typeof photoData === 'string') {
                  if (photoData.startsWith('data:')) {
                    if (photoData.includes('image/png')) mimeExt = 'png';
                    base64Data = photoData.split(',')[1] || '';
                  } else if (photoData.startsWith('http')) {
                    // Google Drive URL — coba beberapa endpoint
                    const driveFileMatch = photoData.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    const driveIdMatch = photoData.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    const fileId = driveFileMatch?.[1] || driveIdMatch?.[1];
                    const fetchUrls: string[] = [];
                    if (fileId) {
                      fetchUrls.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w200`);
                      fetchUrls.push(`https://lh3.googleusercontent.com/d/${fileId}=w200`);
                      fetchUrls.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
                    }
                    fetchUrls.push(photoData);

                    for (const url of fetchUrls) {
                      try {
                        const resp = await fetch(url, { mode: 'cors' });
                        if (resp.ok) {
                          const blob = await resp.blob();
                          if (blob.type.includes('png')) mimeExt = 'png';
                          const b64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const result = reader.result as string;
                              resolve(result.split(',')[1] || '');
                            };
                            reader.readAsDataURL(blob);
                          });
                          if (b64 && b64.length > 100) {
                            base64Data = b64;
                            break;
                          }
                        }
                      } catch { /* coba URL berikutnya */ }
                    }
                  } else if (photoData.length > 100) {
                    // Raw base64
                    base64Data = photoData;
                  }
                }

                // Embed image
                if (base64Data && base64Data.length > 100) {
                  try {
                    const imageId = workbook.addImage({ base64: base64Data, extension: mimeExt });
                    worksheet.addImage(imageId, {
                      tl: { col: colIndex - 1, row: rowIndex - 1 },
                      ext: { width: 70, height: 70 }
                    });
                  } catch (imgErr) {
                    console.warn(`Gagal embed gambar ${indicator.name} foto ${photoIdx}:`, imgErr);
                    // Fallback ke hyperlink jika ada URL
                    if (typeof photoData === 'string' && photoData.startsWith('http')) {
                      const cell = worksheet.getCell(rowIndex, colIndex);
                      cell.value = { text: 'Lihat Foto', hyperlink: photoData };
                      cell.font = { color: { argb: 'FF0563C1' }, underline: true, size: 9 };
                      cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    }
                  }
                } else if (typeof photoData === 'string' && photoData.startsWith('http')) {
                  // Fetch gagal (CORS) — pakai ExcelJS native hyperlink
                  const cell = worksheet.getCell(rowIndex, colIndex);
                  cell.value = { text: 'Lihat Foto', hyperlink: photoData };
                  cell.font = { color: { argb: 'FF0563C1' }, underline: true, size: 9 };
                  cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
              } catch (err) {
                console.error(`Error adding photo ${photoIdx} for ${indicator.name}:`, err);
              }
            }
          }

          colIndex++;
        }

        rowIndex++;
      }

      // Auto width columns
      worksheet.columns.forEach((column, idx) => {
        if (idx === 0) {
          column.width = 5; // No
        } else if (idx <= 6) {
          column.width = 15; // Date, Time, NIK, Nama, Role, Score
        } else {
          // For indicator columns, check header name
          const headerIdx = idx - 7;
          if (headerIdx < headerMap.length) {
            const headerInfo = headerMap[headerIdx];
            if (headerInfo.photoIndex !== undefined) {
              // Photo column - wider to fit image
              column.width = 12;
            } else {
              // Value column - normal width
              column.width = 15;
            }
          } else {
            column.width = 15;
          }
        }
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `riwayat_${branch.nik}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();

      toast.dismiss();
      toast.success('File Excel dengan foto berhasil diexport!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Gagal export Excel. Coba lagi!');
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score < 80) return <Badge variant="destructive">{score}%</Badge>;
    if (score >= 100) return <Badge className="bg-blue-500 hover:bg-blue-600">{score}%</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">{score}%</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Riwayat Semua Submission</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total: <span className="font-bold">{totalItems.toLocaleString()}</span> submission
              </p>

              {/* 🔒 SELECTED INDICATOR - Super jelas! */}
              {selectedIds.length > 0 ? (
                <div className="mt-2 bg-yellow-50 border-2 border-yellow-400 rounded-lg px-3 py-2 inline-block">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-800 font-bold text-lg">
                      ✓ {selectedIds.length} data dipilih
                    </span>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                    >
                      (batalkan)
                    </button>
                  </div>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    🔒 Hanya {selectedIds.length} data ini yang akan dihapus, bukan {totalItems.toLocaleString()} semua!
                  </p>
                </div>
              ) : (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  💡 Export akan download SEMUA {totalItems.toLocaleString()} data, bukan cuma halaman ini
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                variant="outline"
                disabled={selectedIds.length === 0}
                className={selectedIds.length > 0 ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus {selectedIds.length > 0 && `(${selectedIds.length})`}
              </Button>
              <Button
                onClick={handleSmartExport}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filter berdasarkan NIK atau Nama..."
                  value={filterNik}
                  onChange={(e) => setFilterNik(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="month"
                  placeholder="Filter berdasarkan Bulan..."
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setCurrentPage(1); // Reset ke page 1 saat ganti filter
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Select value={filterRole} onValueChange={(value) => {
                  setFilterRole(value as UserRole | 'all');
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="Advisor">{ROLE_DISPLAY_NAMES.Advisor}</SelectItem>
                    <SelectItem value="Cashier">{ROLE_DISPLAY_NAMES.Cashier}</SelectItem>
                    <SelectItem value="CS">{ROLE_DISPLAY_NAMES.CS}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🔽 SORT INFO */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpDown className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">Diurutkan berdasarkan:</span>
                <span className="font-bold text-blue-900">
                  {sortField === 'date' && 'Tanggal & Waktu'}
                  {sortField === 'nik' && 'NIK'}
                  {sortField === 'nama' && 'Nama'}
                  {sortField === 'score' && 'Total Score'}
                </span>
                <span className="text-blue-600">
                  ({sortDirection === 'asc' ? '↑ Terkecil → Terbesar' : '↓ Terbesar → Terkecil'})
                </span>
                {sortField === 'nama' && (
                  <span className="text-xs text-gray-500 italic">
                    (Data baru terurut by Nama, data lama by NIK)
                  </span>
                )}
              </div>
            </div>

            {/* 📄 PAGINATION CONTROLS */}
            <div className="bg-gray-50 rounded-lg px-5 py-4 border border-gray-200">
              <div className="flex items-center justify-between">
                {/* Left: Info */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Halaman</span>
                    <span className="font-bold text-gray-900 text-lg">{currentPage}</span>
                    <span className="text-gray-400">/</span>
                    <span className="font-bold text-gray-700">{totalPages}</span>
                  </div>

                  <div className="h-4 w-px bg-gray-300"></div>

                  <div className="text-gray-600">
                    Total <span className="font-bold text-gray-900">{totalItems.toLocaleString()}</span> data
                  </div>

                  <div className="h-4 w-px bg-gray-300"></div>

                  <div className="text-gray-600">
                    Showing <span className="font-bold text-gray-900">{submissions.length}</span> items
                  </div>

                  {!hasNextPage && submissions.length < itemsPerPage && (
                    <>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <div className="text-green-600 font-medium flex items-center gap-1">
                        <span>✅</span>
                        <span>Semua data sudah dimuat</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={!hasPrevPage || isLoading}
                  >
                    ⏮️ First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={!hasPrevPage || isLoading}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasNextPage || isLoading}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-blue-200 animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-700 font-bold text-lg mb-2">⏳ Memuat Data Submission...</p>
              <p className="text-blue-600 text-sm mb-4">Server sedang memproses request</p>
              <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
                <p className="text-xs text-yellow-800 font-medium mb-1">💡 First Load bisa 5-15 detik</p>
                <p className="text-xs text-yellow-700">Supabase Edge Function cold start membutuhkan waktu warming up</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="text-red-700 font-bold mb-2">Gagal Memuat Data</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <p className="text-xs text-gray-600 mb-4">
                Kemungkinan: Server timeout, cold start, atau koneksi internet lambat
              </p>
              <Button onClick={() => {
                loadSubmissions();
                loadAllSubmissionsForStats();
              }} variant="outline">
                🔄 Coba Lagi
              </Button>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-300 text-5xl mb-4">📭</div>
              <p className="text-gray-500 font-medium mb-2">Tidak ada data submission</p>
              <p className="text-sm text-gray-400">Belum ada staff yang submit data</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                          title={`Select all ${filteredSubmissions.length} items in current page`}
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ({filteredSubmissions.length})
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors font-semibold"
                      >
                        Tanggal & Waktu
                        {sortField === 'date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('nik')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors font-semibold"
                      >
                        NIK
                        {sortField === 'nik' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('nama')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors font-semibold"
                        title="Sort by Nama (fallback ke NIK untuk data lama)"
                      >
                        Nama
                        {sortField === 'nama' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="text-center">
                      <button
                        onClick={() => handleSort('score')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors font-semibold mx-auto"
                      >
                        Total Score
                        {sortField === 'score' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission, idx) => {
                    const date = new Date(submission.date);
                    return (
                      <TableRow key={`${submission.id}_${idx}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(submission.id)}
                            onChange={(e) => handleSelectOne(submission.id, e.target.checked)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            <div>{date.toLocaleDateString('id-ID')}</div>
                            <div className="text-xs text-gray-500">
                              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{submission.user.nik}</TableCell>
                        <TableCell>{submission.user.nama}</TableCell>
                        <TableCell className="text-center">
                          {submission.user.role ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[submission.user.role]}`}>
                              {ROLE_DISPLAY_NAMES[submission.user.role]}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getScoreBadge(submission.totalScore)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {allSubmissionsForStats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-blue-600 font-medium">
            📊 Statistik untuk SEMUA {allSubmissionsForStats.length.toLocaleString()} submission
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Total Score</CardTitle>
              </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(allSubmissionsForStats.reduce((sum, s) => sum + s.totalScore, 0) / allSubmissionsForStats.length).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Perfect Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {allSubmissionsForStats.filter(s => s.totalScore >= 100).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Above 80%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {allSubmissionsForStats.filter(s => s.totalScore >= 80 && s.totalScore < 100).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Below 80%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {allSubmissionsForStats.filter(s => s.totalScore < 80).length}
              </p>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}