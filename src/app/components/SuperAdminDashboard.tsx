import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Crown, LogOut, Plus, Building2, Users, BarChart3, Edit, Trash2, Eye, Settings, Palette, BookOpen } from 'lucide-react';
import { Branch } from '../types';
import { api } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import LoadingScreen from './LoadingScreen';
import SuperAdminBranchEditor from './superadmin/SuperAdminBranchEditor';
import SuperAdminTemplateEditor from './superadmin/SuperAdminTemplateEditor';
import SuperAdminRanking from './superadmin/SuperAdminRanking';
import SuperAdminAppSettings from './superadmin/SuperAdminAppSettings';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchStats, setBranchStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('branches');

  const [newBranchNik, setNewBranchNik] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAdmin, setNewBranchAdmin] = useState('');
  const [newSpreadsheetUrl, setNewSpreadsheetUrl] = useState('');
  const [newAppsScriptUrl, setNewAppsScriptUrl] = useState('');
  const [newGdriveFolderId, setNewGdriveFolderId] = useState(''); // ✅ Google Drive folder ID
  const [creatingBranch, setCreatingBranch] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      const session = localStorage.getItem('super_admin_session');
      if (!session) {
        navigate('/crown-select');
        return;
      }
      setUser(JSON.parse(session));
      await loadBranches();
      setLoading(false);
    };
    initializeAdmin();
  }, [navigate]);

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
      toast.error('Gagal memuat data cabang');
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchNik || !newBranchName || !newBranchAdmin || !newSpreadsheetUrl || !newAppsScriptUrl || !newGdriveFolderId) {
      toast.error('Semua field harus diisi (NIK, Nama, Admin, Spreadsheet URL, Apps Script URL, Google Drive Folder ID)!');
      return;
    }

    setCreatingBranch(true);
    try {
      const result = await api.createBranch({
        id: newBranchNik,
        nik: newBranchNik,
        name: newBranchName,
        displayName: newBranchName,
        adminName: newBranchAdmin,
        spreadsheetUrl: newSpreadsheetUrl,
        appsScriptUrl: newAppsScriptUrl,
        gdriveFolderId: newGdriveFolderId // ✅ Pass Drive folder ID
      });

      if (result.success) {
        toast.success('Cabang baru berhasil dibuat!');
        setShowCreateDialog(false);
        setNewBranchNik('');
        setNewBranchName('');
        setNewBranchAdmin('');
        setNewSpreadsheetUrl('');
        setNewAppsScriptUrl('');
        setNewGdriveFolderId('');
        loadBranches();
      } else {
        toast.error(result.error || 'Gagal membuat cabang baru!');
      }
    } finally {
      setCreatingBranch(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Yakin ingin menghapus cabang ini? Semua data akan terhapus!')) return;

    const success = await api.deleteBranch(branchId);

    if (success) {
      toast.success('Cabang berhasil dihapus!');
      loadBranches();
    } else {
      toast.error('Gagal menghapus cabang!');
    }
  };

  const handleViewDetails = async (branch: Branch) => {
    setSelectedBranch(branch);

    // Load branch statistics
    const submissions = await api.getAllSubmissions(branch.id); // Get all for stats

    const stats = {
      totalSubmissions: submissions.length,
      averageScore: submissions.length > 0
        ? (submissions.reduce((sum: number, s: any) => sum + s.totalScore, 0) / submissions.length).toFixed(1)
        : 0,
      perfectScores: submissions.filter((s: any) => s.totalScore >= 100).length,
      above80: submissions.filter((s: any) => s.totalScore >= 80 && s.totalScore < 100).length,
      below80: submissions.filter((s: any) => s.totalScore < 80).length,
      uniqueUsers: new Set(submissions.map((s: any) => s.user.nik)).size
    };

    setBranchStats(stats);
    setShowDetailsDialog(true);
  };

  const totalStats = {
    branches: branches.length,
    totalSubmissions: 0,
    activeUsers: 0
  };

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{user.nama}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/documentation')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Dokumentasi
              </Button>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('super_admin_session');
                navigate('/crown-select');
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="branches">
              <Building2 className="w-4 h-4 mr-2" />
              Kelola Cabang
            </TabsTrigger>
            <TabsTrigger value="ranking">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ranking Toko
            </TabsTrigger>
            <TabsTrigger value="template">
              <Settings className="w-4 h-4 mr-2" />
              Template Indikator
            </TabsTrigger>
            <TabsTrigger value="appsettings">
              <Palette className="w-4 h-4 mr-2" />
              Pengaturan Aplikasi
            </TabsTrigger>
          </TabsList>

          {/* Tab: Kelola Cabang */}
          <TabsContent value="branches">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cabang</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.branches}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalSubmissions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.activeUsers}</div>
                </CardContent>
              </Card>
            </div>

            {/* Branches List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Daftar Cabang</CardTitle>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-red-600 to-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Cabang Baru
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <Card key={branch.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                              <Building2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {branch.displayName || branch.name} ({branch.nik})
                              </h3>
                              <p className="text-sm text-gray-600">
                                Admin: {branch.adminName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Dibuat: {new Date(branch.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(branch)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detail
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBranch(branch)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Ranking */}
          <TabsContent value="ranking">
            <SuperAdminRanking branches={branches} />
          </TabsContent>

          {/* Tab: Template */}
          <TabsContent value="template">
            <SuperAdminTemplateEditor />
          </TabsContent>

          {/* Tab: App Settings */}
          <TabsContent value="appsettings">
            <SuperAdminAppSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Cabang Baru</DialogTitle>
            <DialogDescription>
              Buat cabang baru dengan admin dan database terpisah
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="nik" className="text-sm font-medium">NIK Cabang</label>
              <Input
                id="nik"
                placeholder="Contoh: A417"
                value={newBranchNik}
                onChange={(e) => setNewBranchNik(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nama Cabang</label>
              <Input
                id="name"
                placeholder="Contoh: Toko A417"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin" className="text-sm font-medium">Nama Admin</label>
              <Input
                id="admin"
                placeholder="Contoh: Manager A417"
                value={newBranchAdmin}
                onChange={(e) => setNewBranchAdmin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="spreadsheet" className="text-sm font-medium">URL Google Spreadsheet</label>
              <Input
                id="spreadsheet"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={newSpreadsheetUrl}
                onChange={(e) => setNewSpreadsheetUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Pastikan spreadsheet sudah dishare ke "Anyone with the link" (Viewer) dan formatnya sama dengan template.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="appsscript" className="text-sm font-medium">URL Apps Script Deployment</label>
              <Input
                id="appsscript"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={newAppsScriptUrl}
                onChange={(e) => setNewAppsScriptUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                URL deployment Apps Script yang sudah di-deploy di spreadsheet cabang ini. Setiap cabang harus punya Apps Script sendiri untuk menghindari quota limit.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="gdrive" className="text-sm font-medium">Google Drive Folder ID (untuk simpan foto)</label>
              <Input
                id="gdrive"
                placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j"
                value={newGdriveFolderId}
                onChange={(e) => setNewGdriveFolderId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                ID folder Google Drive untuk menyimpan foto submissions cabang ini. Buat folder baru di Google Drive, klik kanan → Share → "Anyone with the link" (Viewer), lalu copy ID dari URL folder.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>ℹ️ Penting:</strong> Setiap cabang perlu 3 link: (1) Google Spreadsheet, (2) Apps Script Deployment URL, (3) Google Drive Folder ID untuk foto.
              </p>
            </div>
            <Button
              onClick={handleCreateBranch}
              disabled={creatingBranch}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600"
            >
              {creatingBranch ? 'Memproses...' : 'Buat Cabang'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      {editingBranch && (
        <SuperAdminBranchEditor
          branch={editingBranch}
          onClose={() => {
            setEditingBranch(null);
            loadBranches();
          }}
        />
      )}

      {/* Branch Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Cabang - {selectedBranch?.displayName || selectedBranch?.name}</DialogTitle>
            <DialogDescription>
              Statistik dan pencapaian rata-rata cabang
            </DialogDescription>
          </DialogHeader>
          {branchStats && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold">{branchStats.totalSubmissions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold">{branchStats.averageScore}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Perfect Scores (100%)</p>
                    <p className="text-2xl font-bold text-blue-600">{branchStats.perfectScores}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Above 80%</p>
                    <p className="text-2xl font-bold text-green-600">{branchStats.above80}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Below 80%</p>
                    <p className="text-2xl font-bold text-red-600">{branchStats.below80}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{branchStats.uniqueUsers}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}