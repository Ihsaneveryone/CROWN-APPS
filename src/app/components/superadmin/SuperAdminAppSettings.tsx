import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Settings, Save } from 'lucide-react';
import { AppSettings } from '../../types';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export default function SuperAdminAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    mainTitle: 'CROWN | DAILY INDICATORS STAFF',
    mainSubtitle: 'Your Home Life Improvement Partner',
    secondarySubtitle: 'Pilih Toko Anda'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await api.getAppSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await api.updateAppSettings(settings);
    setSaving(false);

    if (success) {
      toast.success('Pengaturan aplikasi berhasil disimpan!');
    } else {
      toast.error('Gagal menyimpan pengaturan!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" />
            <CardTitle>Pengaturan Halaman Utama</CardTitle>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Atur judul dan subtitle yang muncul di halaman pilih cabang
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="mainTitle" className="text-sm font-medium">Judul Utama</label>
            <Input
              id="mainTitle"
              value={settings.mainTitle}
              onChange={(e) => setSettings({ ...settings, mainTitle: e.target.value })}
              placeholder="CROWN | DAILY INDICATORS STAFF"
            />
            <p className="text-xs text-gray-500">
              Contoh: CROWN | DAILY INDICATORS STAFF
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="mainSubtitle" className="text-sm font-medium">Subtitle Pertama</label>
            <Input
              id="mainSubtitle"
              value={settings.mainSubtitle}
              onChange={(e) => setSettings({ ...settings, mainSubtitle: e.target.value })}
              placeholder="Your Home Life Improvement Partner"
            />
            <p className="text-xs text-gray-500">
              Contoh: Your Home Life Improvement Partner
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="secondarySubtitle" className="text-sm font-medium">Subtitle Kedua</label>
            <Input
              id="secondarySubtitle"
              value={settings.secondarySubtitle}
              onChange={(e) => setSettings({ ...settings, secondarySubtitle: e.target.value })}
              placeholder="Pilih Toko Anda"
            />
            <p className="text-xs text-gray-500">
              Contoh: Pilih Toko Anda
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Pratinjau tampilan halaman utama
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8 rounded-lg text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
              {settings.mainTitle}
            </h1>
            <p className="text-gray-700 text-lg font-medium">
              {settings.mainSubtitle}
            </p>
            <p className="text-gray-600 text-base mt-2">
              {settings.secondarySubtitle}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
