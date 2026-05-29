import { Indicator, UserRole } from '../types';

// Default indicators untuk setiap role
export const DEFAULT_ROLE_INDICATORS: Record<UserRole, Indicator[]> = {
  Advisor: [
    {
      id: 'wa_personal',
      name: 'WA Personal',
      type: 'number',
      targetValue: 100,
      weight: 15,
      order: 1,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah WA Personal'
    },
    {
      id: 'no_baru',
      name: 'No Baru',
      type: 'number',
      targetValue: 50,
      weight: 15,
      order: 2,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah No Baru'
    },
    {
      id: 'after_sales',
      name: 'After Sales',
      type: 'number',
      targetValue: 30,
      weight: 20,
      order: 3,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah After Sales'
    },
    {
      id: 'proteksi',
      name: 'Proteksi',
      type: 'number',
      targetValue: 20,
      weight: 20,
      order: 4,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah Proteksi'
    },
    {
      id: 'google_review',
      name: 'Google Review',
      type: 'number',
      targetValue: 10,
      weight: 15,
      order: 5,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah Google Review'
    },
    {
      id: 'mgb',
      name: 'MGB',
      type: 'number',
      targetValue: 15,
      weight: 15,
      order: 6,
      role: 'Advisor',
      placeholder: 'Masukkan jumlah MGB'
    }
  ],

  Cashier: [
    {
      id: 'cashier-sales-id',
      name: 'Sales ID',
      type: 'number',
      targetValue: 5,
      weight: 30,
      order: 1,
      role: 'Cashier',
      placeholder: 'Masukkan jumlah Sales ID'
    },
    {
      id: 'cashier-trx',
      name: 'Transaksi',
      type: 'number',
      targetValue: 10,
      weight: 35,
      order: 2,
      role: 'Cashier',
      placeholder: 'Masukkan jumlah transaksi'
    },
    {
      id: 'cashier-new-member',
      name: 'New Member',
      type: 'number',
      targetValue: 3,
      weight: 20,
      order: 3,
      role: 'Cashier',
      placeholder: 'Masukkan jumlah new member'
    },
    {
      id: 'cashier-instant-upgrade',
      name: 'Instant Upgrade',
      type: 'number',
      targetValue: 2,
      weight: 15,
      order: 4,
      role: 'Cashier',
      placeholder: 'Masukkan jumlah instant upgrade'
    }
  ],

  CS: [
    {
      id: 'cs-greeting',
      name: 'Greeting Customer',
      type: 'photo',
      targetPhotos: 1,
      weight: 30,
      order: 1,
      role: 'CS',
      placeholder: 'Upload foto greeting customer'
    },
    {
      id: 'cs-service',
      name: 'Customer Service',
      type: 'photo',
      targetPhotos: 1,
      weight: 30,
      order: 2,
      role: 'CS',
      placeholder: 'Upload foto layanan customer service'
    },
    {
      id: 'cs-new-member',
      name: 'New Member',
      type: 'number',
      targetValue: 5,
      weight: 40,
      order: 3,
      role: 'CS',
      placeholder: 'Masukkan jumlah new member'
    }
  ]
};

// Helper function untuk get indicators by role
export function getIndicatorsByRole(allIndicators: Indicator[], role: UserRole): Indicator[] {
  console.log('🔍 DEBUG getIndicatorsByRole:');
  console.log('   Role:', role);
  console.log('   All indicators:', allIndicators);
  console.log('   Indicators with role field:', allIndicators.filter(i => i.role));
  console.log('   Indicators without role field:', allIndicators.filter(i => !i.role));

  // Filter indicators yang sesuai dengan role
  const roleSpecificIndicators = allIndicators.filter(indicator => {
    console.log(`   Checking: ${indicator.name} - role: "${indicator.role}" === "${role}" ?`, indicator.role === role);
    return indicator.role === role;
  });

  console.log('   ✅ Filtered result:', roleSpecificIndicators.length, 'indicators');

  // 🔄 FALLBACK: Jika tidak ada indikator untuk role ini, tampilkan semua indikator tanpa role (backward compatibility)
  if (roleSpecificIndicators.length === 0) {
    console.warn(`⚠️ No indicators found for role: ${role}, showing all indicators without role field`);
    const fallback = allIndicators.filter(indicator => !indicator.role);
    console.log('   📦 Fallback:', fallback.length, 'indicators without role');
    return fallback;
  }

  return roleSpecificIndicators;
}

// Helper function untuk check apakah indicators sudah di-setup untuk role tertentu
export function hasRoleIndicators(allIndicators: Indicator[], role: UserRole): boolean {
  return allIndicators.some(indicator => indicator.role === role);
}

// Helper function untuk initialize default indicators untuk role jika belum ada
export function getOrCreateRoleIndicators(
  existingIndicators: Indicator[],
  role: UserRole
): Indicator[] {
  const roleIndicators = getIndicatorsByRole(existingIndicators, role);

  if (roleIndicators.length > 0) {
    return roleIndicators;
  }

  // Kalau belum ada, return default indicators
  return DEFAULT_ROLE_INDICATORS[role];
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  Advisor: 'Advisor',
  Cashier: 'Cashier',
  CS: 'Customer Service'
};

// Role colors for UI
export const ROLE_COLORS: Record<UserRole, string> = {
  Advisor: 'bg-blue-100 text-blue-800 border-blue-200',
  Cashier: 'bg-green-100 text-green-800 border-green-200',
  CS: 'bg-purple-100 text-purple-800 border-purple-200'
};
