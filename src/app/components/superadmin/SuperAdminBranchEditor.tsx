import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Save, Upload, X } from 'lucide-react';
import { Branch } from '../../types';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface SuperAdminBranchEditorProps {
  branch: Branch;
  onClose: () => void;
}

export default function SuperAdminBranchEditor({ branch, onClose }: SuperAdminBranchEditorProps) {
  const [formData, setFormData] = useState({
    displayName: branch.displayName || branch.name,
    name: branch.name,
    adminName: branch.adminName,
    logo: branch.logo || ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(branch.logo || '');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Ukuran file maksimal 2MB!');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoFile(file);
      setLogoPreview(base64String);
      setFormData({ ...formData, logo: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData({ ...formData, logo: '' });
  };

  const handleSave = async () => {
    const updatedBranch: Branch = {
      ...branch,
      displayName: formData.displayName,
      name: formData.name,
      adminName: formData.adminName,
      logo: formData.logo
    };

    const success = await api.updateBranch(updatedBranch);

    if (success) {
      toast.success('Cabang berhasil diupdate!');
      onClose();
    } else {
      toast.error('Gagal mengupdate cabang!');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Cabang - {branch.nik}</DialogTitle>
          <DialogDescription>
            Edit informasi cabang yang ditampilkan di halaman login
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">Nama Tampilan (di halaman pilih cabang)</label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Contoh: AZKO Palembang"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nama Lengkap Cabang</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Toko AZKO Palembang"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="adminName" className="text-sm font-medium">Nama Admin</label>
            <Input
              id="adminName"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              placeholder="Contoh: Manager Palembang"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo Toko (opsional)</label>

            {!logoPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label htmlFor="logoUpload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Upload Logo Toko</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 2MB)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {logoFile ? `File: ${logoFile.name}` : 'Logo dari database'}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Kosongkan untuk menggunakan logo AZKO default
            </p>
          </div>

          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-red-600 to-orange-600">
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
