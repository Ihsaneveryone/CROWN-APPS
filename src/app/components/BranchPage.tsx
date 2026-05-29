import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Toaster } from './ui/sonner';
import { AlertCircle } from 'lucide-react';
import LoginPage from './LoginPage';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';
import LoadingScreen from './LoadingScreen';
import { Branch, UserRole } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';

type UserSession = {
  branchId: string;
  nik: string;
  nama: string;
  role: UserRole;
  isBranchAdmin: boolean;
  isSuperAdmin: boolean;
} | null;

export default function BranchPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [user, setUser] = useState<UserSession>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [branchNotFound, setBranchNotFound] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Memuat data toko...');

  // 🔥 CRITICAL FIX: Auto-detect and clear corrupted cache
  useEffect(() => {
    console.log('🔍 AUTO-CHECK: Scanning for corrupted cache...');

    try {
      // Check ALL localStorage keys for corrupted data
      const keysToCheck = Object.keys(localStorage);

      keysToCheck.forEach(key => {
        if (key.startsWith('session_')) {
          try {
            const session = JSON.parse(localStorage.getItem(key) || '{}');

            // Detect corruption: role should be "Advisor", "Cashier", or "CS", NOT a date
            if (session.role && (
              session.role.includes('-20') ||  // Contains year
              session.role.includes(':') ||     // Contains time
              session.role.length > 15          // Too long for a role name
            )) {
              console.log(`❌ CORRUPTED SESSION: ${key}`);
              console.log('   Role value:', session.role);
              console.log('   This looks like a date/timestamp, not a role!');

              // Delete corrupted session
              localStorage.removeItem(key);
              console.log(`   ✅ Deleted corrupted session: ${key}`);
            }
          } catch (e) {
            console.log(`   ⚠️ Could not parse ${key}, deleting...`);
            localStorage.removeItem(key);
          }
        }
      });

      console.log('✅ Cache scan complete!');
    } catch (e) {
      console.error('Error during cache scan:', e);
    }
  }, []);

  useEffect(() => {
    const loadBranch = async () => {
      if (!branchId) {
        setBranchNotFound(true);
        setIsLoading(false);
        return;
      }

      // ⚡ INSTANT: Check for saved session for this branch
      const savedSession = localStorage.getItem(`session_${branchId}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setUser(session);
      }

      // ⚡ INSTANT: Load branch from cache FIRST - no expiry check for instant load!
      try {
        const cached = localStorage.getItem('branches_cache');
        if (cached) {
          const cachedData = JSON.parse(cached);
          const foundBranch = cachedData.data?.find((b: Branch) => b.id === branchId);
          if (foundBranch) {
            console.log('⚡ Branch loaded from cache INSTANTLY (no waiting!)');
            setBranch(foundBranch);
            setIsLoading(false);

            // ⚡ DISABLED: Background refresh untuk performa maksimal - cache sudah cukup!
            // Tidak perlu background refresh karena cache sudah 30 menit

            return;
          }
        }
      } catch (e) {
        console.error('Cache read error:', e);
      }

      // ⚡ ULTRA FAST LOAD: Load dari server dengan timeout minimal
      try {
        console.log('🔄 Loading branches from server...');

        // ⚡ ULTRA FAST: Hanya tunggu 800ms untuk server response
        const timeoutPromise = new Promise<Branch[]>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 800)
        );

        const branches = await Promise.race([
          api.getBranches(),
          timeoutPromise
        ]);

        const foundBranch = branches.find(b => b.id === branchId);

        if (foundBranch) {
          console.log('✅ Branch loaded from server:', foundBranch.name);
          setBranch(foundBranch);

          // Cache for next time
          localStorage.setItem('branches_cache', JSON.stringify({
            data: branches,
            timestamp: Date.now()
          }));
        } else {
          setBranchNotFound(true);
        }
      } catch (error) {
        console.log('ℹ️ Server timeout/error, branch not found:', error);
        setBranchNotFound(true);
      }

      setIsLoading(false);
    };

    loadBranch();
  }, [branchId, navigate]);

  const handleLogin = (userData: UserSession) => {
    // ⚡ INSTANT LOGIN - No delay!
    setUser(userData);
    if (branchId) {
      localStorage.setItem(`session_${branchId}`, JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (branchId) {
      localStorage.removeItem(`session_${branchId}`);
    }
    // Don't navigate anywhere - just clear session and stay on this branch
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  // Branch not found - show error page WITHOUT link to main page
  if (branchNotFound || !branch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Toko Tidak Ditemukan</h1>
              <p className="text-gray-600">
                Toko dengan kode <span className="font-mono font-bold text-red-600">{branchId}</span> tidak tersedia dalam sistem.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-left">
              <p className="text-gray-700">
                <strong>Kemungkinan penyebab:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>Kode toko salah atau tidak terdaftar</li>
                <li>Toko sudah dihapus dari sistem</li>
                <li>Link yang Anda gunakan sudah tidak valid</li>
              </ul>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Silakan hubungi administrator untuk mendapatkan link yang benar.
              </p>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Branch Admin Dashboard
  if (user?.isBranchAdmin && branch) {
    return (
      <>
        <AdminDashboard
          user={user}
          branch={branch}
          onLogout={handleLogout}
          onBack={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // Staff Dashboard
  if (user && branch) {
    return (
      <>
        <StaffDashboard
          user={user}
          branch={branch}
          onLogout={handleLogout}
          onBack={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  // Login Page - no back button to protect main page privacy
  return (
    <>
      <LoginPage
        branch={branch}
        onLogin={handleLogin}
        onBack={null}
      />
      <Toaster />
    </>
  );
}