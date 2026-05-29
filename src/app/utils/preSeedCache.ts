// 🚀 PRE-SEED CACHE - Instant first load!
// Seed localStorage with default data so there's ZERO loading skeleton

import { Indicator, BranchSettings, Branch } from '../types';

// Default indicators untuk instant first load WITH WEIGHTS!
const DEFAULT_INDICATORS: Indicator[] = [
  { id: 'sales', branchId: '', name: 'Sales', order: 1, isActive: true, requiresPhoto: false, type: 'number', weight: 12, targetValue: 100000000, icon: 'DollarSign' },
  { id: 'transaksi', branchId: '', name: 'Transaksi', order: 2, isActive: true, requiresPhoto: false, type: 'number', weight: 12, targetValue: 150, icon: 'ShoppingCart' },
  { id: 'basket', branchId: '', name: 'Basket Size', order: 3, isActive: true, requiresPhoto: false, type: 'number', weight: 12, targetValue: 750000, icon: 'TrendingUp' },
  { id: 'nobaru', branchId: '', name: 'No Baru Customer', order: 4, isActive: true, requiresPhoto: false, type: 'number', weight: 10, targetValue: 30, icon: 'UserPlus' },
  { id: 'wa', branchId: '', name: 'WA Personal', order: 5, isActive: true, requiresPhoto: false, type: 'number', weight: 10, targetValue: 50, icon: 'Phone' },
  { id: 'aftersales', branchId: '', name: 'After Sales', order: 6, isActive: true, requiresPhoto: false, type: 'number', weight: 10, targetValue: 10, icon: 'ThumbsUp' },
  { id: 'proteksi', branchId: '', name: 'Proteksi', order: 7, isActive: true, requiresPhoto: false, type: 'number', weight: 15, targetValue: 10, isSpecial: true, specialFormula: 'Jika >= target: Full bobot (15%). Jika < target: Value x 1.5%', icon: 'Shield' },
  { id: 'voc', branchId: '', name: 'VOC/GR', order: 8, isActive: true, requiresPhoto: false, type: 'number', weight: 10, targetValue: 10, icon: 'Target' },
  { id: 'mgb', branchId: '', name: 'MGB', order: 9, isActive: true, requiresPhoto: false, type: 'photo', weight: 9, targetPhotos: 3, icon: 'Camera' },
];

const DEFAULT_SETTINGS: BranchSettings = {
  branchId: '',
  branchName: '',
  requireApproval: false,
  allowNotes: true,
  targetDaily: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default branches for instant first load
const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'A336',
    nik: 'A336',
    name: 'Toko A336',
    adminName: 'MGR AZKO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'A416',
    nik: 'A416',
    name: 'Toko A416',
    adminName: 'Manager A416',
    createdAt: new Date().toISOString()
  },
  {
    id: 'A339',
    nik: 'A339',
    name: 'Toko A339',
    adminName: 'Manager A339',
    createdAt: new Date().toISOString()
  }
];

// Pre-seed cache untuk branch
export function preSeedCache(branchId: string) {
  try {
    // Check if already seeded
    const indicatorsKey = `indicators_${branchId}`;
    const settingsKey = `settings_${branchId}`;
    const submissionsKey = `submissions_${branchId}_1_50`;

    const hasIndicators = localStorage.getItem(indicatorsKey);
    const hasSettings = localStorage.getItem(settingsKey);
    const hasSubmissions = localStorage.getItem(submissionsKey);

    // Only seed if not exists
    if (!hasIndicators) {
      const indicators = DEFAULT_INDICATORS.map(ind => ({
        ...ind,
        branchId,
      }));

      localStorage.setItem(indicatorsKey, JSON.stringify({
        data: indicators,
        timestamp: Date.now(),
      }));

      console.log('🌱 Indicators pre-seeded for instant load!');
    }

    if (!hasSettings) {
      const settings = {
        ...DEFAULT_SETTINGS,
        branchId,
      };

      localStorage.setItem(settingsKey, JSON.stringify({
        data: settings,
        timestamp: Date.now(),
      }));

      console.log('🌱 Settings pre-seeded for instant load!');
    }

    // Pre-seed submissions with empty array for instant first load
    // ALWAYS seed (even if exists) to ensure fresh timestamp
    localStorage.setItem(submissionsKey, JSON.stringify({
      data: {
        submissions: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasMore: false,
        }
      },
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago to trigger refresh
    }));

    console.log('🌱 Submissions pre-seeded for instant load!');

    return true;
  } catch (e) {
    console.error('Pre-seed error:', e);
    return false;
  }
}

// Pre-seed all branches
export function preSeedAllBranches(branchIds: string[]) {
  branchIds.forEach(branchId => {
    preSeedCache(branchId);
  });
  
  console.log(`🌱 Pre-seeded ${branchIds.length} branches!`);
}

// Pre-seed branches for instant load
export function preSeedBranches() {
  try {
    const permanentBackupKey = 'branches_permanent_backup';

    // Check if already seeded - QUICK CHECK untuk skip jika sudah ada
    const hasBranches = localStorage.getItem(permanentBackupKey);

    // Only seed if not exists
    if (!hasBranches) {
      // Save ONLY to permanent backup (simplified!)
      localStorage.setItem(permanentBackupKey, JSON.stringify(DEFAULT_BRANCHES));
      console.log('🌱 Branches pre-seeded for instant load!');
    } else {
      console.log('⚡ Branches already seeded, skipping');
    }

    return true;
  } catch (e) {
    console.error('Pre-seed branches error:', e);
    return false;
  }
}

// Clear all cache (for debugging)
export function clearAllCache() {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key =>
    key.includes('indicators_') ||
    key.includes('settings_') ||
    key.includes('submissions_') ||
    key.includes('branches_')
  );

  cacheKeys.forEach(key => localStorage.removeItem(key));

  console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
}