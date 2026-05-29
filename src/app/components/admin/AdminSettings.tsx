import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Save, User } from 'lucide-react';
import { Branch, BranchSettings, BranchAdmin } from '../../types';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface AdminSettingsProps {
  branch: Branch;
  user: any;
}

export default function AdminSettings({ branch, user }: AdminSettingsProps) {
  const [settings, setSettings] = useState<BranchSettings>({
    loginTitle: 'CROWN | DAILY INDICATORS',
    loginSubtitle: 'Silakan masuk dengan NIK dan Nama Anda',
    minSubmitScore: 80
  });
  const [adminData, setAdminData] = useState<BranchAdmin | null>(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [previousNames, setPreviousNames] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [branch.id]);

  const loadData = async () => {
    const [sets, admin] = await Promise.all([
      api.getSettings(branch.id),
      api.getBranchAdmin(branch.id)
    ]);

    if (sets) {
      setSettings({
        loginTitle: sets.loginTitle || 'CROWN | DAILY INDICATORS',
        loginSubtitle: sets.loginSubtitle || 'Silakan masuk dengan NIK dan Nama Anda',
        minSubmitScore: sets.minSubmitScore || sets.minScore || 80
      });
    }

    if (admin) {
      setAdminData(admin);
      setNewAdminName(admin.name || '');
      // Load previous names from localStorage
      const saved = localStorage.getItem(`branch_${branch.id}_previous_names`);
      if (saved) {
        setPreviousNames(JSON.parse(saved));
      }
    } else {
      // Initialize admin data
      const initialAdmin: BranchAdmin = {
        nik: branch.nik,
        name: branch.adminName || '',
        lastNameChange: new Date().toISOString()
      };
      await api.updateBranchAdmin(branch.id, initialAdmin);
      setAdminData(initialAdmin);
      setNewAdminName(branch.adminName || '');
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    const success = await api.updateSettings(branch.id, settings);

    if (success) {
      toast.success('Pengaturan berhasil disimpan!');
    } else {
      toast.error('Gagal menyimpan pengaturan!');
    }
  };

  const handleChangeAdminName = async () => {
    if (!newAdminName.trim()) {
      toast.error('Nama admin harus diisi!');
      return;
    }

    if (newAdminName.toUpperCase() === adminData?.name.toUpperCase()) {
      toast.error('Nama baru harus berbeda dari nama sekarang!');
      return;
    }

    if (previousNames.some(name => name.toUpperCase() === newAdminName.toUpperCase())) {
      toast.error('Nama ini sudah pernah digunakan sebelumnya!');
      return;
    }

    const updatedAdmin: BranchAdmin = {
      nik: branch.nik,
      name: newAdminName.trim(),
      lastNameChange: new Date().toISOString()
    };

    const success = await api.updateBranchAdmin(branch.id, updatedAdmin);

    if (success) {
      // Save to previous names
      const newPreviousNames = [...previousNames, adminData?.name || ''].filter(Boolean);
      localStorage.setItem(`branch_${branch.id}_previous_names`, JSON.stringify(newPreviousNames));
      setPreviousNames(newPreviousNames);

      setAdminData(updatedAdmin);
      toast.success('Nama admin berhasil diubah!');
    } else {
      toast.error('Gagal mengubah nama admin!');
    }
  };

  const daysSinceLastChange = adminData?.lastNameChange
    ? Math.floor((new Date().getTime() - new Date(adminData.lastNameChange).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Login Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Halaman Login</CardTitle>
          <CardDescription>
            Ubah tampilan judul dan subtitle di halaman login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="loginTitle" className="text-sm font-medium">Judul Login</label>
            <Input
              id="loginTitle"
              value={settings.loginTitle}
              onChange={(e) => setSettings({ ...settings, loginTitle: e.target.value })}
              placeholder="DAILY INDICATORS A336"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="loginSubtitle" className="text-sm font-medium">Subtitle Login</label>
            <Input
              id="loginSubtitle"
              value={settings.loginSubtitle}
              onChange={(e) => setSettings({ ...settings, loginSubtitle: e.target.value })}
              placeholder="Silakan masuk dengan NIK dan Nama Anda"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="minScore" className="text-sm font-medium">Minimum Score untuk Submit (%)</label>
            <Input
              id="minScore"
              type="number"
              value={settings.minSubmitScore || 80}
              onChange={(e) => setSettings({ ...settings, minSubmitScore: parseInt(e.target.value) || 80 })}
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>

      {/* Admin Name Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Pergantian Nama Admin
          </CardTitle>
          <CardDescription>
            Wajib mengganti nama setiap bulan (30 hari). Nama baru harus berbeda dari yang sebelumnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>Nama Admin Saat Ini:</strong> {adminData?.name || '-'}
            </p>
            <p className="text-sm mt-1">
              <strong>Terakhir Diganti:</strong>{' '}
              {adminData?.lastNameChange
                ? new Date(adminData.lastNameChange).toLocaleDateString('id-ID')
                : 'Belum pernah'}
            </p>
            <p className={`text-sm mt-1 font-medium ${daysSinceLastChange > 30 ? 'text-red-600' : 'text-green-600'}`}>
              <strong>Status:</strong>{' '}
              {daysSinceLastChange > 30
                ? `⚠️ Sudah ${daysSinceLastChange} hari, segera ganti nama!`
                : `✓ Masih ${30 - daysSinceLastChange} hari lagi`}
            </p>
          </div>

          {previousNames.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Nama-nama Sebelumnya:</p>
              <ul className="text-sm space-y-1">
                {previousNames.map((name, idx) => (
                  <li key={idx} className="text-gray-600">
                    • {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="newAdminName" className="text-sm font-medium">Nama Admin Baru</label>
            <Input
              id="newAdminName"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="Masukkan nama baru yang berbeda"
            />
          </div>

          <Button
            onClick={handleChangeAdminName}
            variant={daysSinceLastChange > 30 ? 'destructive' : 'default'}
            className="w-full"
          >
            Ganti Nama Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
