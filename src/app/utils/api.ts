/**
 * API Layer - Google Sheets Integration
 *
 * Multi-device sync with 100% FREE Google Sheets API!
 *
 * Features:
 * - Multi-device sync (submit di HP, lihat di laptop!)
 * - 100% FREE (no quota limits!)
 * - Data visible in Google Sheets
 * - Auto-backup by Google
 * - Offline-first with caching
 *
 * ARCHITECTURE:
 * - READ operations: Google Sheets API v4 (API key)
 * - WRITE operations: Google Apps Script Web App (no auth needed)
 */

import { Branch, Indicator, Submission, BranchSettings, BranchAdmin, AppSettings } from '../types';
import {
  readSheetAsObjects,
  appendToSheet,
  SHEETS,
  objectToRow,
  isConfigured,
  testConnection,
  MASTER_SPREADSHEET_ID,
  parseSpreadsheetUrl,
  testSpreadsheet
} from './googleSheets';

// Cache of branchId → spreadsheetId resolved from master branches sheet.
const BRANCH_SPREADSHEET_CACHE = new Map<string, string>();

async function getBranchSpreadsheetId(branchId: string): Promise<string> {
  if (!branchId) return MASTER_SPREADSHEET_ID;
  if (BRANCH_SPREADSHEET_CACHE.has(branchId)) {
    return BRANCH_SPREADSHEET_CACHE.get(branchId)!;
  }
  try {
    const branches = await readSheetAsObjects<any>(SHEETS.BRANCHES, MASTER_SPREADSHEET_ID);
    for (const b of branches) {
      if (b.id && b.spreadsheetId) {
        BRANCH_SPREADSHEET_CACHE.set(b.id, b.spreadsheetId);
      }
    }
    const branch = branches.find((b: any) => b.id === branchId);
    const sid = (branch && branch.spreadsheetId) ? branch.spreadsheetId : MASTER_SPREADSHEET_ID;
    BRANCH_SPREADSHEET_CACHE.set(branchId, sid);
    return sid;
  } catch {
    return MASTER_SPREADSHEET_ID;
  }
}

// 🔧 GOOGLE APPS SCRIPT WEB APP URL (untuk WRITE operations)
// Photo upload fix v3.0 - WITH DRIVE PERMISSIONS - Deployed 2026-05-29 09:28
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6TLlS_qcCdjWA0VugP9qE5lGsVm5E8euqz5dTBk-X0zyYgaXpZKSrIuX7DXEUjhzdNw/exec';

// IN-MEMORY CACHE untuk performance
const CACHE = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit cache

// Helper: Get from cache
function getFromCache(key: string): any | null {
  const cached = CACHE.get(key);
  if (cached && cached.expires > Date.now()) {
    console.log(`⚡ Cache HIT: ${key}`);
    return cached.data;
  }
  if (cached) {
    CACHE.delete(key);
  }
  return null;
}

// Helper: Save to cache
function saveToCache(key: string, data: any) {
  CACHE.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

// Helper: Clear ALL caches (in-memory + localStorage)
function clearAllCaches() {
  console.log('🧹 Clearing ALL caches...');

  // Clear in-memory cache
  CACHE.clear();

  // Clear localStorage cache (hanya keys yang berkaitan dengan app data)
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('branches') ||
      key.startsWith('indicators_') ||
      key.startsWith('settings_') ||
      key.startsWith('submissions_') ||
      key.startsWith('app_settings')
    )) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));

  console.log(`✅ Cleared ${keysToRemove.length} localStorage items`);
  console.log('✅ All caches cleared!');
}

// Helper: localStorage cache (longer term)
function getLocalStorageCache(key: string, maxAge: number = 30 * 60 * 1000): any | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < maxAge) {
        console.log(`💾 localStorage cache HIT: ${key}`);
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('localStorage cache read error:', e);
  }
  return null;
}

function setLocalStorageCache(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('localStorage cache write error:', e);
  }
}

// ─── Submission data parsers (backward compatible) ───────────────────────────

/**
 * Parse kolom H (data) — mendukung format lama (JSON) dan baru (compact).
 *
 * Format baru: "sales=6408950|trx=4|basket=1602238|wa_personal=20|..."
 * Format lama: [{"id":"sales","value":6408950,"photos":[]}, ...]
 *              atau {"sales": {"value": 6408950, "photos": []}, ...}
 */
function parseSubmissionData(dataStr: string): any[] {
  if (!dataStr) return [];
  const str = String(dataStr).trim();

  // Format lama: JSON array
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      return parsed.map((ind: any) => ({
        id: ind.id,
        value: ind.value ?? 0,
        photos: Array.isArray(ind.photos) ? ind.photos : []
      }));
    } catch { /* lanjut */ }
  }

  // Format lama: JSON object
  if (str.startsWith('{')) {
    try {
      const parsed = JSON.parse(str);
      return Object.entries(parsed).map(([id, v]: [string, any]) => ({
        id,
        value: typeof v === 'object' ? (v.value ?? 0) : Number(v),
        photos: typeof v === 'object' && Array.isArray(v.photos) ? v.photos : []
      }));
    } catch { /* lanjut */ }
  }

  // Format baru: "sales=6408950|trx=4|..."
  if (str.includes('=')) {
    return str.split('|').map(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx === -1) return null;
      return {
        id: part.slice(0, eqIdx).trim(),
        value: parseFloat(part.slice(eqIdx + 1)) || 0,
        photos: []
      };
    }).filter(Boolean);
  }

  return [];
}

function parseSubmissionPhotos(photosStr: string): Record<string, string[]> {
  if (!photosStr) return {};
  try {
    const parsed = JSON.parse(String(photosStr));
    const result: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (Array.isArray(val)) {
        const photos = (val as any[]).filter(
          p => typeof p === 'string' && (p.startsWith('http') || p.startsWith('data:'))
        );
        if (photos.length > 0) result[key] = photos;
      }
    }
    return result;
  } catch {
    return {};
  }
}

// Helper: Convert File/Blob to base64
async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Compress image before upload
async function compressImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export const api = {
  // ============= TEST CONNECTION =============
  async testGoogleSheets(): Promise<boolean> {
    return await testConnection();
  },

  // ============= BRANCHES =============
  async getBranches(): Promise<Branch[]> {
    const cacheKey = 'branches';

    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Check localStorage
    const localCached = getLocalStorageCache(cacheKey);
    if (localCached) {
      saveToCache(cacheKey, localCached);
      return localCached;
    }

    // Fetch from Google Sheets
    try {
      console.log('📡 Fetching branches from Google Sheets...');
      const branches = await readSheetAsObjects<Branch>(SHEETS.BRANCHES, MASTER_SPREADSHEET_ID);
      // Refresh branchId→spreadsheetId cache
      branches.forEach((b: any) => {
        if (b.id && b.spreadsheetId) BRANCH_SPREADSHEET_CACHE.set(b.id, b.spreadsheetId);
      });

      // Save to caches
      saveToCache(cacheKey, branches);
      setLocalStorageCache(cacheKey, branches);

      console.log(`✅ Fetched ${branches.length} branches`);
      return branches;
    } catch (error) {
      console.error('❌ Error fetching branches:', error);

      // Fallback to default branches
      const defaultBranches: Branch[] = [
        {
          id: 'A336',
          nik: 'A336',
          name: 'Toko A336',
          adminName: 'MGR AZKO',
          createdAt: new Date().toISOString()
        }
      ];

      saveToCache(cacheKey, defaultBranches);
      setLocalStorageCache(cacheKey, defaultBranches);
      return defaultBranches;
    }
  },

  async createBranch(input: {
    id: string;
    nik: string;
    name: string;
    adminName: string;
    spreadsheetUrl: string;
    appsScriptUrl?: string;
    gdriveFolderId?: string; // ✅ Google Drive folder ID
    displayName?: string;
  }): Promise<{ success: boolean; error?: string; branch?: Branch }> {
    const sid = parseSpreadsheetUrl(input.spreadsheetUrl);
    if (!sid) {
      return { success: false, error: 'URL spreadsheet tidak valid' };
    }
    const ok = await testSpreadsheet(sid);
    if (!ok) {
      return { success: false, error: 'Spreadsheet tidak dapat diakses. Pastikan sudah dishare ke "Anyone with link" (Viewer).' };
    }

    const branch: Branch = {
      id: input.id,
      nik: input.nik,
      name: input.name,
      displayName: input.displayName,
      adminName: input.adminName,
      createdAt: new Date().toISOString(),
      spreadsheetId: sid,
      appsScriptUrl: input.appsScriptUrl,
      gdriveFolderId: input.gdriveFolderId // ✅ Save Drive folder ID
    };

    if (!APPS_SCRIPT_URL) {
      return { success: false, error: 'Apps Script URL belum dikonfigurasi' };
    }

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'createBranch',
          spreadsheetId: MASTER_SPREADSHEET_ID,
          data: branch
        })
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }
      const result = await response.json();
      if (!result.success) {
        return { success: false, error: result.error || 'Gagal menyimpan branch' };
      }

      BRANCH_SPREADSHEET_CACHE.set(branch.id, sid);
      CACHE.delete('branches');
      localStorage.removeItem('branches');

      return { success: true, branch };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  },

  // ============= INDICATORS =============
  async getIndicators(branchId: string): Promise<Indicator[]> {
    const cacheKey = `indicators_${branchId}`;

    console.log('');
    console.log('🔍 ===== GET INDICATORS DEBUG =====');
    console.log('Branch ID:', branchId);
    console.log('Cache key:', cacheKey);

    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('⚡ Returning from IN-MEMORY cache');
      console.log('Sample indicator (Sales):', cached.find((i: any) => i.id === 'sales'));
      console.log('====================================');
      console.log('');
      return cached;
    }

    // Check localStorage (SHORT TTL - 5 minutes for indicators karena sering diupdate)
    const localCached = getLocalStorageCache(cacheKey, 5 * 60 * 1000);
    if (localCached) {
      console.log('💾 Returning from localStorage cache');
      console.log('Sample indicator (Sales):', localCached.find((i: any) => i.id === 'sales'));
      saveToCache(cacheKey, localCached);
      console.log('====================================');
      console.log('');
      return localCached;
    }

    // Fetch from Google Sheets
    try {
      console.log('📡 Fetching indicators from Google Sheets (NO CACHE)...');
      const sid = await getBranchSpreadsheetId(branchId);
      const allIndicators = await readSheetAsObjects<any>(SHEETS.INDICATORS, sid);
      console.log(`📥 Total indicators from Sheets: ${allIndicators.length}`);

      // Filter by branchId (skip filter when spreadsheet is dedicated per-branch)
      const filtered = sid === MASTER_SPREADSHEET_ID
        ? allIndicators.filter((ind: any) => ind.branchId === branchId)
        : allIndicators;
      console.log(`🔍 Filtered for branch ${branchId}: ${filtered.length} indicators`);

      // Find Sales indicator RAW data
      const salesRaw = filtered.find((ind: any) => ind.id === 'sales');
      if (salesRaw) {
        console.log('📊 RAW Sales indicator dari Google Sheets:');
        console.log('  - id:', salesRaw.id);
        console.log('  - name:', salesRaw.name);
        console.log('  - targetValue (RAW string):', salesRaw.targetValue);
        console.log('  - targetValue type:', typeof salesRaw.targetValue);
      }

      const indicators = filtered.map((ind: any, index: number) => ({
        id: ind.id,
        name: ind.name,
        type: ind.type,
        targetValue: ind.targetValue ? parseFloat(ind.targetValue) : undefined,
        targetPhotos: ind.targetPhotos ? parseInt(ind.targetPhotos) : undefined,
        weight: parseFloat(ind.weight),
        icon: ind.icon,
        placeholder: ind.placeholder,
        order: index,
        createdAt: ind.createdAt,
        role: ind.role
      }));

      // Log parsed Sales indicator
      const salesParsed = indicators.find((i: any) => i.id === 'sales');
      if (salesParsed) {
        console.log('✅ PARSED Sales indicator:');
        console.log('  - targetValue (parsed number):', salesParsed.targetValue);
        console.log('  - Full object:', salesParsed);
      }

      // Save to caches
      saveToCache(cacheKey, indicators);
      setLocalStorageCache(cacheKey, indicators);

      console.log(`✅ Fetched ${indicators.length} indicators for ${branchId}`);
      console.log('====================================');
      console.log('');
      return indicators;
    } catch (error) {
      console.error('❌ Error fetching indicators:', error);
      return [];
    }
  },

  async updateIndicators(branchId: string, indicators: Indicator[]): Promise<boolean> {
    try {
      console.log('📝 Updating indicators via Apps Script...');

      if (!APPS_SCRIPT_URL) {
        console.error('❌ Apps Script URL not configured');
        return false;
      }

      const branchSpreadsheetId = await getBranchSpreadsheetId(branchId);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateIndicators',
          spreadsheetId: branchSpreadsheetId,
          data: indicators
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update indicators');
      }

      // Clear cache
      CACHE.delete(`indicators_${branchId}`);
      localStorage.removeItem(`indicators_${branchId}`);

      console.log('✅ Indicators updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating indicators:', error);
      return false;
    }

    /* ORIGINAL CODE - DISABLED (causes 401 error with API key)
    try {
      console.log(`📝 Updating indicators for branch ${branchId}...`);

      // First, read all indicators
      const allIndicators = await readSheetAsObjects<any>(SHEETS.INDICATORS);

      // Remove old indicators for this branch
      const otherIndicators = allIndicators.filter((ind: any) => ind.branchId !== branchId);

      // Add new indicators
      const headers = ['branchId', 'id', 'name', 'type', 'targetValue', 'targetPhotos', 'weight', 'icon', 'createdAt'];
      const newRows = indicators.map(ind => objectToRow({
        branchId,
        id: ind.id,
        name: ind.name,
        type: ind.type,
        targetValue: ind.targetValue || '',
        targetPhotos: ind.targetPhotos || '',
        weight: ind.weight,
        icon: ind.icon,
        createdAt: ind.createdAt || new Date().toISOString()
      }, headers));

      // Clear and rewrite (simple approach)
      // Note: More efficient approach would be to use batchUpdate
      await appendToSheet(SHEETS.INDICATORS, newRows);

      // Clear cache
      CACHE.delete(`indicators_${branchId}`);
      localStorage.removeItem(`indicators_${branchId}`);

      console.log(`✅ Updated indicators for ${branchId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating indicators:', error);
      return false;
    }
    */
  },

  // ============= SETTINGS =============
  async getSettings(branchId: string): Promise<BranchSettings | null> {
    const cacheKey = `settings_${branchId}`;

    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Check localStorage (SHORT TTL - 5 minutes for settings karena sering diupdate)
    const localCached = getLocalStorageCache(cacheKey, 5 * 60 * 1000);
    if (localCached) {
      saveToCache(cacheKey, localCached);
      return localCached;
    }

    // Fetch from Google Sheets
    try {
      console.log(`📡 Fetching settings for branch ${branchId}...`);
      const sid = await getBranchSpreadsheetId(branchId);
      const allSettings = await readSheetAsObjects<any>(SHEETS.SETTINGS, sid);

      const settings = sid === MASTER_SPREADSHEET_ID
        ? allSettings.find((s: any) => s.branchId === branchId)
        : allSettings[0];

      if (settings) {
        const parsed: BranchSettings = {
          branchId: settings.branchId,
          loginTitle: settings.loginTitle,
          loginSubtitle: settings.loginSubtitle,
          minScore: parseFloat(settings.minScore) || 80,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        };

        // Save to caches
        saveToCache(cacheKey, parsed);
        setLocalStorageCache(cacheKey, parsed);

        return parsed;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return null;
    }
  },

  async updateSettings(branchId: string, settings: Partial<BranchSettings>): Promise<boolean> {
    try {
      console.log('📝 Updating settings via Apps Script...');

      if (!APPS_SCRIPT_URL) {
        console.error('❌ Apps Script URL not configured');
        return false;
      }

      const branchSpreadsheetId = await getBranchSpreadsheetId(branchId);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateSettings',
          spreadsheetId: branchSpreadsheetId,
          data: settings
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update settings');
      }

      // Clear cache
      CACHE.delete(`settings_${branchId}`);
      localStorage.removeItem(`settings_${branchId}`);

      console.log('✅ Settings updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return false;
    }

    /* ORIGINAL CODE - DISABLED (causes 401 error with API key)
    try {
      console.log(`📝 Updating settings for branch ${branchId}...`);

      const updatedSettings = {
        branchId,
        ...settings,
        updatedAt: new Date().toISOString()
      };

      await updateRowById(SHEETS.SETTINGS, branchId, updatedSettings);

      // Clear cache
      CACHE.delete(`settings_${branchId}`);
      localStorage.removeItem(`settings_${branchId}`);

      console.log(`✅ Updated settings for ${branchId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return false;
    }
    */
  },

  // ============= SUBMISSIONS =============
  async getSubmissions(
    branchId: string,
    page: number = 1,
    limit: number = 999999,
    filterNik?: string,
    sortField?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<{ submissions: Submission[]; pagination: any }> {
    const cacheKey = `submissions_${branchId}_${filterNik || 'all'}_${page}_${limit}`;

    // Check cache (shorter TTL for submissions)
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📡 Fetching submissions for branch ${branchId}...`);
      const sid = await getBranchSpreadsheetId(branchId);
      const allSubmissions = await readSheetAsObjects<any>(SHEETS.SUBMISSIONS, sid);

      // Filter by branchId (skip when sheet is dedicated)
      let submissions = sid === MASTER_SPREADSHEET_ID
        ? allSubmissions.filter((sub: any) => sub.branchId === branchId)
        : allSubmissions;

      // Filter by NIK if provided
      if (filterNik) {
        submissions = submissions.filter((sub: any) =>
          String(sub.userNik).trim().toUpperCase() === String(filterNik).trim().toUpperCase()
        );
      }

      // Parse JSON fields
      submissions = submissions.map((sub: any) => {
        // Reconstruct notes object from expanded columns (NEW FORMAT - prioritize this!)
        let notes = undefined;

        // Check expanded columns first (Reason, Approval, Admin NIK, Admin Nama)
        if (sub.Reason || sub.Approval || sub['Admin NIK'] || sub['Admin Nama']) {
          const reason = sub.Reason && sub.Reason !== '-' ? sub.Reason : undefined;
          const approval = sub.Approval && sub.Approval !== '-' ? sub.Approval : undefined;
          const adminNik = sub['Admin NIK'] && sub['Admin NIK'] !== '-' ? sub['Admin NIK'] : undefined;
          const adminNama = sub['Admin Nama'] && sub['Admin Nama'] !== '-' ? sub['Admin Nama'] : undefined;

          if (reason || approval || adminNik || adminNama) {
            notes = {
              reason,
              approval,
              adminNik,
              adminNama
            };
          }
        }

        // Baca data indikator: format baru (kolom per indikator) atau lama (JSON)
        // ADVISOR indicators (kolom L-Q)
        const ADVISOR_COLS = ['wa_personal','no_baru','after_sales','proteksi','google_review','mgb'];
        // CASHIER indicators (kolom AD-AG)
        const CASHIER_COLS = ['cashier-sales-id','cashier-trx','cashier-new-member','cashier-instant-upgrade'];
        // CS indicators (kolom AH-AJ)
        const CS_COLS = ['cs-greeting','cs-service','cs-new-member'];

        const ALL_INDICATOR_COLS = [...ADVISOR_COLS, ...CASHIER_COLS, ...CS_COLS];
        const hasNewFormat = ALL_INDICATOR_COLS.some(id => sub[id] !== undefined && sub[id] !== '');

        // Parse foto dari kolom Q — Drive URLs per indikator
        const parsedPhotos = parseSubmissionPhotos(sub.photos);

        // 🔍 DEBUG: Log photo parsing
        if (sub.photos && sub.photos !== '-' && sub.photos !== '') {
          console.log('🔍 PHOTO PARSE DEBUG:', {
            id: sub.id,
            rawPhotos: sub.photos,
            parsedPhotos: parsedPhotos,
            parsedKeys: Object.keys(parsedPhotos)
          });
        }

        let indicatorData: any[];
        if (hasNewFormat) {
          // Format baru: satu kolom per indikator, support ALL roles
          indicatorData = ALL_INDICATOR_COLS
            .filter(id => sub[id] !== undefined && sub[id] !== '' && sub[id] !== 0)
            .map(id => ({
              id,
              value: parseFloat(sub[id]) || 0,
              photos: parsedPhotos[id] || []
            }));
        } else {
          // Format lama: kolom "data" berisi JSON
          indicatorData = parseSubmissionData(sub.data);
          // Merge foto dari kolom Q (Drive URLs) ke tiap indikator
          for (const item of indicatorData) {
            if (parsedPhotos[item.id] && parsedPhotos[item.id].length > 0) {
              item.photos = [...(item.photos || []), ...parsedPhotos[item.id]];
            }
          }
        }

        // 🩹 SHIFT DETECTION: Apps Script lama menulis tanpa kolom userRole,
        // sehingga kolom date jatuh ke posisi userRole, createdAt → date, totalScore → createdAt, dst.
        // Deteksi: userRole bukan salah satu dari Advisor/Cashier/CS → anggap shifted.
        const VALID_ROLES = ['Advisor', 'Cashier', 'CS'];
        const rawRole = sub.userRole || sub.role;
        const isShifted = rawRole && !VALID_ROLES.includes(String(rawRole).trim());

        let resolvedRole: any = rawRole;
        let resolvedDate: any = sub.date;
        let resolvedCreatedAt: any = sub.createdAt;
        let resolvedTotalScore: any = sub.totalScore;

        if (isShifted) {
          // Quiet log — remapping happens silently; surfaced via debug only
          console.debug('Remapping shifted columns for submission', sub.id);
          resolvedRole = undefined;                     // tidak bisa direcover, biarkan kosong
          resolvedDate = sub.userRole || sub.date;      // date asli ada di kolom userRole
          resolvedCreatedAt = sub.date || sub.createdAt;// createdAt asli ada di kolom date
          resolvedTotalScore = sub.createdAt;           // totalScore asli ada di kolom createdAt
        }

        return {
          id: sub.id,
          branchId: sub.branchId,
          user: {
            nik: sub.userNik,
            nama: sub.userName,
            role: VALID_ROLES.includes(String(resolvedRole).trim()) ? resolvedRole : undefined
          },
          date: resolvedDate,
          createdAt: resolvedCreatedAt,
          totalScore: parseFloat(resolvedTotalScore) || 0,
          data: indicatorData,
          photos: parsedPhotos,
          notes
        };
      });

      // Sort
      if (sortField && sortDirection) {
        const getSortValue = (s: any) => {
          switch (sortField) {
            case 'nik': return s.user?.nik ?? '';
            case 'nama': return s.user?.nama ?? '';
            case 'score': return s.totalScore ?? 0;
            case 'date': return new Date(s.createdAt).getTime();
            default: return s[sortField];
          }
        };
        submissions.sort((a: any, b: any) => {
          const aVal = getSortValue(a);
          const bVal = getSortValue(b);
          if (aVal === bVal) return 0;
          const cmp = aVal > bVal ? 1 : -1;
          return sortDirection === 'asc' ? cmp : -cmp;
        });
      } else {
        // Default: sort by createdAt DESC
        submissions.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Paginate
      const total = submissions.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedSubmissions = submissions.slice((page - 1) * limit, page * limit);

      const result = {
        submissions: paginatedSubmissions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      };

      // Save to cache
      saveToCache(cacheKey, result);

      console.log(`✅ Fetched ${paginatedSubmissions.length}/${total} submissions`);
      return result;
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      return {
        submissions: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false }
      };
    }
  },

  async addSubmission(branchId: string, submission: any): Promise<boolean> {
    try {
      console.log(`📝 Adding submission for branch ${branchId}...`);

      // ✅ GOOGLE DRIVE MODE: Upload full-size ke Drive (tidak perlu thumbnail)
      let photosData: any = {};    // full-size base64 → Apps Script upload ke Drive
      let cleanData: any = submission.data;

      if (submission.data) {
        if (Array.isArray(submission.data)) {
          cleanData = [];
          for (const item of submission.data) {
            const { photos, ...rest } = item as any;
            cleanData.push(rest);
            if (photos && Array.isArray(photos) && photos.length > 0) {
              const base64Photos: string[] = [];
              for (const photo of photos) {
                if (photo instanceof File || photo instanceof Blob) {
                  // Compress to 800x800 @ 70% quality (~50-100KB)
                  const base64 = await compressImage(photo as File, 800, 0.7);
                  base64Photos.push(base64);
                } else if (typeof photo === 'string') {
                  base64Photos.push(photo);
                }
              }
              if (base64Photos.length > 0) photosData[item.id] = base64Photos;
            }
          }
        } else {
          cleanData = {};
          for (const [indicatorId, value] of Object.entries(submission.data)) {
            const data = value as any;
            if (data?.photos && Array.isArray(data.photos)) {
              const base64Photos: string[] = [];
              for (const photo of data.photos) {
                if (photo instanceof File || photo instanceof Blob) {
                  // Compress to 800x800 @ 70% quality (~50-100KB)
                  const base64 = await compressImage(photo as File, 800, 0.7);
                  base64Photos.push(base64);
                } else if (typeof photo === 'string') {
                  base64Photos.push(photo);
                }
              }
              if (base64Photos.length > 0) photosData[indicatorId] = base64Photos;
              cleanData[indicatorId] = { ...data, photos: [] };
            } else {
              cleanData[indicatorId] = data;
            }
          }
        }
      }

      // 🚀 WRITE via Google Apps Script endpoint
      if (APPS_SCRIPT_URL) {
        console.log('🔧 Using Apps Script endpoint...');

        try {
          // 🔍 DEBUG: Log notes sebelum dikirim
          console.log('🔍 API DEBUG - submission.notes:', submission.notes);
          console.log('🔍 API DEBUG - notes type:', typeof submission.notes);
          console.log('🔍 API DEBUG - notes stringify:', JSON.stringify(submission.notes));

          // Prepare payload — data tanpa foto (foto terpisah di photosData)
          const branchSpreadsheetId = await getBranchSpreadsheetId(branchId);

          // ✅ Get Google Drive folder ID from branch data
          const branches = await this.getBranches();
          const branch = branches.find(b => b.id === branchId);
          const gdriveFolderId = branch?.gdriveFolderId || '';

          console.log('📁 Google Drive folder ID:', gdriveFolderId || 'NOT CONFIGURED');

          const payload = {
            action: 'addSubmission',
            spreadsheetId: branchSpreadsheetId,
            data: {
              id: submission.id,
              branchId: submission.branchId,
              user: submission.user,
              date: submission.date,
              createdAt: submission.createdAt,
              totalScore: submission.totalScore || 0,
              data: cleanData,
              photos: photosData,             // ✅ Full-size base64 → Apps Script upload ke Drive
              gdriveFolderId: gdriveFolderId, // ✅ Drive folder ID untuk upload
              notes: submission.notes
            }
          };

          // 🔍 DEBUG: Log FULL payload untuk cek user.role & photos
          console.log('');
          console.log('🚀 ===== SENDING TO APPS SCRIPT =====');
          console.log('📦 Payload action:', payload.action);
          console.log('👤 User object:', payload.data.user);
          console.log('🎭 User role:', payload.data.user?.role);
          console.log('📊 Data indicators:', payload.data.data);
          console.log('📅 Date:', payload.data.date);
          console.log('🕐 CreatedAt:', payload.data.createdAt);
          console.log('💯 TotalScore:', payload.data.totalScore);
          console.log('');
          console.log('📸 ===== PHOTOS DEBUG (GOOGLE DRIVE MODE) =====');
          console.log('📁 Drive Folder ID:', gdriveFolderId || '❌ NOT CONFIGURED!');
          console.log('📷 Photos to upload:', Object.keys(photosData).length, 'indicators');

          if (Object.keys(photosData).length > 0) {
            console.log('✅ Photos ready for upload:');
            Object.keys(photosData).forEach(indicatorId => {
              const photoCount = photosData[indicatorId].length;
              const firstPhotoSize = photosData[indicatorId][0]?.length || 0;
              const firstPhotoStart = photosData[indicatorId][0]?.substring(0, 50) || '';
              console.log(`   - ${indicatorId}: ${photoCount} photo(s), ~${Math.round(firstPhotoSize / 1024)}KB base64`);
              console.log(`     First photo starts with: ${firstPhotoStart}`);
            });
          } else {
            console.log('ℹ️ No photos to upload (user did not select photos)');
          }
          console.log('=====================================');
          console.log('');

          // POST request
          const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to add submission via Apps Script');
          }

          // Clear cache
          Array.from(CACHE.keys())
            .filter(key => key.startsWith(`submissions_${branchId}`))
            .forEach(key => CACHE.delete(key));

          console.log(`✅ Submission added successfully`);
          return true;
        } catch (fetchError: any) {
          console.error('❌ Fetch error:', fetchError.message);
          throw new Error(`Apps Script request failed: ${fetchError.message}`);
        }
      }

      // ⚠️ FALLBACK: Direct Sheets API (will fail for write operations)
      console.warn('⚠️ APPS_SCRIPT_URL not configured! Falling back to direct Sheets API (may fail)...');

      const headers = ['id', 'branchId', 'userNik', 'userName', 'date', 'createdAt', 'totalScore', 'data', 'photos', 'notes'];
      const rowData = objectToRow({
        id: submission.id,
        branchId: submission.branchId,
        userNik: submission.user?.nik || '',
        userName: submission.user?.nama || '',
        date: submission.date,
        createdAt: submission.createdAt,
        totalScore: submission.totalScore || 0,
        data: JSON.stringify(submission.data || {}),
        photos: JSON.stringify(photosData),
        notes: submission.notes || ''
      }, headers);

      await appendToSheet(SHEETS.SUBMISSIONS, [rowData]);

      // Clear cache
      Array.from(CACHE.keys())
        .filter(key => key.startsWith(`submissions_${branchId}`))
        .forEach(key => CACHE.delete(key));

      console.log(`✅ Added submission ${submission.id}`);
      return true;
    } catch (error) {
      console.error('❌ Error adding submission:', error);
      return false;
    }
  },

  async getAllSubmissions(branchId: string): Promise<Submission[]> {
    try {
      console.log(`📡 Fetching ALL submissions for branch ${branchId}...`);
      const result = await this.getSubmissions(branchId, 1, 999999);
      return result.submissions;
    } catch (error) {
      console.error('❌ Error fetching all submissions:', error);
      return [];
    }
  },

  async deleteSubmissions(branchId: string, ids: string[]): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting ${ids.length} submissions via Apps Script...`);

      if (!APPS_SCRIPT_URL) {
        console.error('❌ Apps Script URL not configured');
        return false;
      }

      const branchSpreadsheetId = await getBranchSpreadsheetId(branchId);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteSubmissions',
          spreadsheetId: branchSpreadsheetId,
          data: { ids }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to delete submissions');

      // Clear cache
      Array.from(CACHE.keys())
        .filter(key => key.startsWith(`submissions_${branchId}`))
        .forEach(key => CACHE.delete(key));

      console.log(`✅ Deleted ${ids.length} submissions`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting submissions:', error);
      return false;
    }
  },

  // ============= BRANCH ADMIN =============
  async getBranchAdmin(branchId: string): Promise<BranchAdmin | null> {
    try {
      const branches = await this.getBranches();
      const branch = branches.find(b => b.id === branchId);
      if (branch) {
        return {
          nik: branch.nik,
          name: branch.adminName || '',
          lastNameChange: branch.lastNameChange || branch.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting branch admin:', error);
      return null;
    }
  },

  async updateBranchAdmin(branchId: string, admin: BranchAdmin): Promise<boolean> {
    try {
      console.log(`📝 Updating admin for branch ${branchId} via Apps Script...`);

      if (!APPS_SCRIPT_URL) {
        console.error('❌ Apps Script URL not configured');
        return false;
      }

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateBranchAdmin',
          spreadsheetId: MASTER_SPREADSHEET_ID,
          data: {
            branchId,
            adminName: admin.name,
            lastNameChange: admin.lastNameChange || new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to update branch admin');

      // Clear cache
      CACHE.delete('branches');
      localStorage.removeItem('branches');

      console.log(`✅ Updated admin for ${branchId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating branch admin:', error);
      return false;
    }
  },

  // ============= APP SETTINGS =============
  async getAppSettings(): Promise<AppSettings> {
    const cacheKey = 'app_settings';

    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Check localStorage
    const localCached = getLocalStorageCache(cacheKey);
    if (localCached) {
      saveToCache(cacheKey, localCached);
      return localCached;
    }

    // Return default settings (no Google Sheets storage for this)
    const defaultSettings: AppSettings = {
      mainTitle: 'CROWN | DAILY INDICATORS STAFF',
      mainSubtitle: 'Your Home Life Improvement Partner',
      secondarySubtitle: 'Pilih Toko Anda'
    };

    // Save to cache
    saveToCache(cacheKey, defaultSettings);
    setLocalStorageCache(cacheKey, defaultSettings);

    return defaultSettings;
  },

  // ============= CACHE MANAGEMENT =============
  clearAllCaches() {
    clearAllCaches();
  }
};
