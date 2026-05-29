import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Building2, Crown, Plus, Lock, Trophy, Award } from 'lucide-react';
import { Branch, AppSettings, Submission } from '../types';
import { api } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { preSeedBranches } from '../utils/preSeedCache';
import azkoLogo from '../../imports/images__1_-3.jpg';

export default function BranchSelector() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false);
  const [superAdminNik, setSuperAdminNik] = useState('');
  const [superAdminCode, setSuperAdminCode] = useState('');

  // Crown Admin states
  const [showCrownAdminDialog, setShowCrownAdminDialog] = useState(false);
  const [crownAdminNik, setCrownAdminNik] = useState('');
  const [crownAdminNama, setCrownAdminNama] = useState('');

  const [appSettings, setAppSettings] = useState<AppSettings>({
    mainTitle: 'CROWN | DAILY INDICATORS STAFF',
    mainSubtitle: 'Your Home Life Improvement Partner',
    secondarySubtitle: 'Pilih Toko Anda'
  });

  // Ranking states
  const [showStoreRanking, setShowStoreRanking] = useState(false);
  const [storeRanking, setStoreRanking] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  useEffect(() => {
    // Pre-seed branches for instant load (SYNC - instant!)
    preSeedBranches();

    // Load branches and settings in PARALLEL for max speed
    Promise.all([
      loadBranches(),
      loadAppSettings()
    ]).catch(err => {
      console.error('Failed to load initial data:', err);
    });
  }, []);

  const loadBranches = async () => {
    // ⚡ INSTANT: Load dari cache dulu untuk tampilan langsung!
    try {
      const cached = localStorage.getItem('branches_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data && parsed.data.length > 0) {
          console.log('⚡ Branches loaded from cache instantly');
          setBranches(parsed.data);
          setLoading(false);
          return; // Skip network - cache sudah cukup!
        }
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }

    // Load dari server hanya jika cache tidak ada
    setLoading(true);
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast.error('Gagal memuat data cabang. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const loadAppSettings = async () => {
    // ⚡ INSTANT: Load dari cache dulu
    try {
      const cached = localStorage.getItem('app_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          console.log('⚡ App settings loaded from cache instantly');
          setAppSettings(parsed.data);
          return; // Skip network!
        }
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }

    // Load dari server hanya jika cache tidak ada
    const settings = await api.getAppSettings();
    setAppSettings(settings);

    // Save to cache
    try {
      localStorage.setItem('app_settings_cache', JSON.stringify({
        data: settings,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  };

  const handleSuperAdminLogin = async () => {
    if (superAdminNik === '191924' && superAdminCode === 'Muhammad Ihsan') {
      const session = {
        branchId: 'super',
        nik: '191924',
        nama: 'Super Admin',
        isBranchAdmin: false,
        isSuperAdmin: true
      };
      localStorage.setItem('super_admin_session', JSON.stringify(session));
      toast.success('Login Super Admin berhasil!');
      navigate('/super-admin');
    } else {
      toast.error('NIK atau Secret Code salah!');
    }
  };

  const handleCrownAdminLogin = async () => {
    if (crownAdminNik === '191924' && crownAdminNama.toUpperCase() === 'MUHAMMAD IHSAN') {
      const session = {
        nik: '191924',
        nama: 'Muhammad Ihsan',
        role: 'crown_admin'
      };
      localStorage.setItem('crown_admin_session', JSON.stringify(session));
      toast.success('Login ADMIN CROWN berhasil!');
      navigate('/crown-admin');
    } else {
      toast.error('NIK atau Nama salah!');
    }
  };

  const loadStoreRanking = async () => {
    try {
      setLoadingRanking(true);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // OPTIMASI: Load ranking hanya untuk max 10 cabang pertama
      const branchesToLoad = branches.slice(0, 10);
      
      console.log(`📊 Loading ranking for ${branchesToLoad.length} branches...`);

      const statsPromises = await Promise.all(
        branchesToLoad.map(async (branch) => {
          try {
            // OPTIMASI: Hanya load 100 submissions terbaru untuk ranking bulan ini
            const { submissions } = await api.getSubmissions(branch.id, 1, 100);
            const monthSubmissions = submissions.filter((s: any) => {
              const subDate = new Date(s.date);
              return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
            });

            const avgScore = monthSubmissions.length > 0
              ? monthSubmissions.reduce((sum: number, s: any) => sum + s.totalScore, 0) / monthSubmissions.length
              : 0;

            return {
              branch,
              avgScore: Math.round(avgScore),
              totalSubmissions: monthSubmissions.length
            };
          } catch (error) {
            console.error(`❌ Error loading submissions for branch ${branch.id}:`, error);
            return {
              branch,
              avgScore: 0,
              totalSubmissions: 0
            };
          }
        })
      );

      const sorted = statsPromises
        .filter(b => b.totalSubmissions > 0)
        .sort((a, b) => b.avgScore - a.avgScore);

      setStoreRanking(sorted);
    } catch (error) {
      console.error('Error loading store ranking:', error);
      toast.error('Gagal memuat ranking toko');
    } finally {
      setLoadingRanking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header with Crown Theme */}
        <div className="text-center mb-8 md:mb-12">
          {/* Crown Badge with AZKO Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            {/* Crown decoration - RESPONSIVE SIZE - SECRET CLICK */}
            <div
              className="mb-2 cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={() => setShowCrownAdminDialog(true)}
              title="Secret Access"
            >
              <Crown className="w-16 h-16 md:w-24 md:h-24 text-yellow-500 drop-shadow-2xl" fill="currentColor" strokeWidth={1.5} />
            </div>

            {/* Logo container - RESPONSIVE */}
            <div className="relative -mt-7 md:-mt-10">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>

              {/* Main logo container - Lingkaran putih */}
              <div className="relative bg-white rounded-full p-3 md:p-4 shadow-2xl border-3 md:border-4 border-pink-100">
                {/* Logo AZKO di dalam lingkaran - RESPONSIVE SIZE */}
                <img
                  src={azkoLogo}
                  alt="Logo AZKO"
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover"
                />

                {/* Bottom accent */}
                <div className="absolute -bottom-2 md:-bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-1.5 md:h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full blur-sm"></div>
              </div>
            </div>
          </div>

          {/* Title - RESPONSIVE */}
          <div className="space-y-2 md:space-y-3 px-4">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3 md:mb-4 leading-tight">
              {appSettings.mainTitle}
            </h1>

            <p className="text-gray-700 text-base md:text-lg font-medium">
              {appSettings.mainSubtitle}
            </p>

            <p className="text-gray-600 text-sm md:text-base mt-2">
              {appSettings.secondarySubtitle}
            </p>
          </div>
        </div>

        {/* Branches Grid */}
        <div className="max-w-5xl mx-auto mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading cabang...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card
                  key={branch.id}
                  className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-red-100 hover:border-red-400 group relative overflow-hidden"
                  onClick={() => navigate(`/branch/${branch.id}`)}
                >
                  {/* Crown badge for top-right corner */}
                  <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        {branch.logo ? (
                          // Logo toko jika ada
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 p-0.5">
                              <img
                                src={branch.logo}
                                alt={`Logo ${branch.displayName || branch.nik}`}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  // Fallback ke icon jika logo gagal load
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-white rounded-xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>';
                                  }
                                }}
                              />
                            </div>
                            {/* Small crown accent */}
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          // Icon bangunan default jika tidak ada logo
                          <div className="relative">
                            <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            {/* Small crown accent */}
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                          {branch.displayName || `Toko ${branch.nik}`}
                        </h3>
                        <p className="text-sm text-gray-600">{branch.name}</p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Bottom gradient accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
              ))}

              {/* Add New Branch Card - Only visible to super admin but shown as locked */}
              <Card className="border-2 border-dashed border-red-200 hover:border-red-400 transition-all cursor-pointer group relative overflow-hidden">
                <CardContent className="p-6 flex items-center justify-center min-h-[140px]">
                  <div className="text-center">
                    <div className="relative inline-block mb-2">
                      <div className="p-3 bg-gradient-to-br from-gray-100 to-red-50 group-hover:from-red-100 group-hover:to-orange-100 rounded-xl transition-all">
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-all" />
                      </div>
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium group-hover:text-red-600 transition-colors">Tambah Cabang Baru</p>
                    <p className="text-xs text-gray-500 mt-1">(Hanya Super Admin)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Ranking & Super Admin Access - RESPONSIVE */}
        <div className="text-center px-4 space-y-3">
          {/* Ranking Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setShowStoreRanking(true);
                loadStoreRanking();
              }}
              disabled={loadingRanking}
              variant="outline"
              className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-4 md:px-6 py-4 md:py-5 text-sm md:text-base relative group w-full md:w-auto"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span className="font-semibold">🏆 Ranking Toko Bulan Ini</span>
            </Button>
          </div>

          {/* Super Admin Button */}
          <Button
            onClick={() => setShowSuperAdminDialog(true)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-700 px-4 md:px-6 py-4 md:py-6 text-sm md:text-base relative group overflow-hidden w-full md:w-auto"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

            <div className="relative flex items-center justify-center gap-2">
              <div className="bg-yellow-400 rounded-full p-1 md:p-1.5">
                <Crown className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <span className="font-bold">Login Sebagai Super Admin</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Super Admin Login Dialog */}
      <Dialog open={showSuperAdminDialog} onOpenChange={setShowSuperAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-600" />
              Login Super Admin
            </DialogTitle>
            <DialogDescription>
              Masukkan NIK dan Secret Code untuk akses Super Admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="superNik" className="text-sm font-medium">NIK Super Admin</label>
              <Input
                id="superNik"
                placeholder="Masukkan NIK Super Admin"
                value={superAdminNik}
                onChange={(e) => setSuperAdminNik(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="superCode" className="text-sm font-medium">Secret Code</label>
              <Input
                id="superCode"
                type="password"
                placeholder="Masukkan Secret Code"
                value={superAdminCode}
                onChange={(e) => setSuperAdminCode(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSuperAdminLogin}
              className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crown Admin Dialog - SECRET LOGIN */}
      <Dialog open={showCrownAdminDialog} onOpenChange={setShowCrownAdminDialog}>
        <DialogContent className="border-4 border-yellow-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-7 h-7 text-yellow-500" fill="currentColor" />
              ADMIN CROWN
            </DialogTitle>
            <DialogDescription className="text-yellow-700 font-semibold">
              🔒 Secret Access - Highest Authority
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-semibold">⚠️ Restricted Area</p>
              <p className="text-xs mt-1">Full system access with all permissions</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="crownNik" className="text-sm font-medium">NIK</label>
              <Input
                id="crownNik"
                placeholder="Masukkan NIK"
                value={crownAdminNik}
                onChange={(e) => setCrownAdminNik(e.target.value)}
                className="border-yellow-300 focus:border-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="crownNama" className="text-sm font-medium">Nama Lengkap</label>
              <Input
                id="crownNama"
                type="password"
                placeholder="Masukkan Nama Lengkap"
                value={crownAdminNama}
                onChange={(e) => setCrownAdminNama(e.target.value)}
                className="border-yellow-300 focus:border-yellow-500"
              />
            </div>
            <Button
              onClick={handleCrownAdminLogin}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
            >
              <Crown className="w-4 h-4 mr-2" fill="currentColor" />
              Masuk
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Branch Ranking Dialog */}
      {/* Store Ranking Dialog */}
      <Dialog open={showStoreRanking} onOpenChange={setShowStoreRanking}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="w-6 h-6 text-yellow-600" />
              🏆 Ranking Toko Bulan Ini
            </DialogTitle>
            <DialogDescription>
              Peringkat toko berdasarkan rata-rata score submission bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingRanking ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-sm">Loading ranking...</p>
              </div>
            ) : storeRanking.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Belum ada data submission bulan ini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {storeRanking.map((item, index) => (
                  <div
                    key={item.branch.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      index === 0
                        ? 'bg-yellow-50 border-yellow-400'
                        : index === 1
                        ? 'bg-gray-50 border-gray-300'
                        : index === 2
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.branch.displayName || item.branch.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.branch.nik} • {item.totalSubmissions} submission{item.totalSubmissions > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      item.avgScore >= 100 ? 'text-green-600' : item.avgScore >= 80 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {item.avgScore}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}