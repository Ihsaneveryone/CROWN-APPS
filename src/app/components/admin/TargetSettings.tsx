import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Save, RotateCcw } from 'lucide-react';
import { api } from '../../utils/api';

interface Targets {
  sales: number;
  transaksi: number;
  basketSize: number;
  waPersonal: number;
}

const DEFAULT_TARGETS: Targets = {
  sales: 7000000,
  transaksi: 5,
  basketSize: 1400000,
  waPersonal: 10
};

export default function TargetSettings() {
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);

  useEffect(() => {
    const loadTargets = async () => {
      const data = await api.getTargets();
      setTargets(data);
    };
    loadTargets();
  }, []);

  const handleSave = async () => {
    const success = await api.updateTargets(targets);
    if (success) {
      toast.success('Target berhasil disimpan!');
    } else {
      toast.error('Gagal menyimpan target. Coba lagi!');
    }
  };

  const handleReset = async () => {
    setTargets(DEFAULT_TARGETS);
    const success = await api.updateTargets(DEFAULT_TARGETS);
    if (success) {
      toast.success('Target direset ke nilai default!');
    } else {
      toast.error('Gagal reset target. Coba lagi!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Target Indikator</CardTitle>
          <CardDescription>
            Ubah target untuk setiap indikator. Target ini akan berlaku untuk semua karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="sales" className="text-sm font-medium">Target Sales (Bobot: 50%)</label>
              <Input
                id="sales"
                type="number"
                value={targets.sales}
                onChange={(e) => setTargets({ ...targets, sales: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Default: Rp 7.000.000</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="transaksi" className="text-sm font-medium">Target Transaksi (Bobot: 5%)</label>
              <Input
                id="transaksi"
                type="number"
                value={targets.transaksi}
                onChange={(e) => setTargets({ ...targets, transaksi: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Default: 5 transaksi</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="basketSize" className="text-sm font-medium">Target Basket Size (Bobot: 5%)</label>
              <Input
                id="basketSize"
                type="number"
                value={targets.basketSize}
                onChange={(e) => setTargets({ ...targets, basketSize: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Default: Rp 1.400.000</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="waPersonal" className="text-sm font-medium">Target WA Personal (Bobot: 5%)</label>
              <Input
                id="waPersonal"
                type="number"
                value={targets.waPersonal}
                onChange={(e) => setTargets({ ...targets, waPersonal: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Default: 10 WA</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Target Tetap (Tidak Dapat Diubah):</p>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>No Baru Customer:</strong> 50% dari transaksi yang dicapai (Bobot: 5%)</li>
              <li>• <strong>After Sales Service:</strong> 1 foto bukti (Bobot: 5%)</li>
              <li>• <strong>Proteksi:</strong> 1 proteksi = 10% (Bobot: 10%)</li>
              <li>• <strong>VOC/GR:</strong> Minimal 1 (Bobot: 5%)</li>
              <li>• <strong>MGB:</strong> 3 foto bukti (Bobot: 10%)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Simpan Target
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset ke Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
