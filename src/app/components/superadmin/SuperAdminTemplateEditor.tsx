import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Plus, Edit, Trash2, GripVertical, Save } from 'lucide-react';
import { Indicator } from '../../types';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export default function SuperAdminTemplateEditor() {
  const [template, setTemplate] = useState<Indicator[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'number' as 'number' | 'photo' | 'number+photo' | 'text' | 'dropdown' | 'checkbox',
    targetValue: 0,
    targetPhotos: 0,
    targetText: '',
    dropdownOptions: [] as string[],
    weight: 0,
    icon: 'Target',
    isSpecial: false,
    specialFormula: ''
  });

  const [newDropdownOption, setNewDropdownOption] = useState('');

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    const data = await api.getDefaultTemplate();
    setTemplate(data.sort((a, b) => a.order - b.order));
  };

  const handleSave = async () => {
    if (!formData.name || formData.weight <= 0) {
      toast.error('Nama dan bobot harus diisi!');
      return;
    }

    const totalWeight = template
      .filter(i => i.id !== editingIndicator?.id)
      .reduce((sum, i) => sum + i.weight, 0) + formData.weight;

    if (totalWeight > 100) {
      toast.error(`Total bobot melebihi 100%! (Sekarang: ${totalWeight}%)`);
      return;
    }

    let updatedTemplate: Indicator[];

    if (editingIndicator) {
      updatedTemplate = template.map(ind =>
        ind.id === editingIndicator.id
          ? {
              ...ind,
              name: formData.name,
              type: formData.type,
              targetValue: formData.targetValue || undefined,
              targetPhotos: formData.targetPhotos || undefined,
              targetText: formData.targetText || undefined,
              dropdownOptions: formData.dropdownOptions.length > 0 ? formData.dropdownOptions : undefined,
              weight: formData.weight,
              icon: formData.icon,
              isSpecial: formData.isSpecial,
              specialFormula: formData.specialFormula || undefined
            }
          : ind
      );
    } else {
      const newIndicator: Indicator = {
        id: `template_ind_${Date.now()}`,
        name: formData.name,
        type: formData.type,
        targetValue: formData.targetValue || undefined,
        targetPhotos: formData.targetPhotos || undefined,
        targetText: formData.targetText || undefined,
        dropdownOptions: formData.dropdownOptions.length > 0 ? formData.dropdownOptions : undefined,
        weight: formData.weight,
        icon: formData.icon,
        order: template.length + 1,
        isSpecial: formData.isSpecial,
        specialFormula: formData.specialFormula || undefined
      };
      updatedTemplate = [...template, newIndicator];
    }

    const success = await api.updateDefaultTemplate(updatedTemplate);

    if (success) {
      toast.success(editingIndicator ? 'Template indikator berhasil diupdate!' : 'Template indikator berhasil ditambahkan!');
      setShowDialog(false);
      setEditingIndicator(null);
      resetForm();
      loadTemplate();
    } else {
      toast.error('Gagal menyimpan template!');
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setFormData({
      name: indicator.name,
      type: indicator.type,
      targetValue: indicator.targetValue || 0,
      targetPhotos: indicator.targetPhotos || 0,
      targetText: indicator.targetText || '',
      dropdownOptions: indicator.dropdownOptions || [],
      weight: indicator.weight,
      icon: indicator.icon || 'Target',
      isSpecial: indicator.isSpecial || false,
      specialFormula: indicator.specialFormula || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (indicatorId: string) => {
    if (!confirm('Yakin ingin menghapus indikator dari template?')) return;

    const updatedTemplate = template
      .filter(i => i.id !== indicatorId)
      .map((ind, idx) => ({ ...ind, order: idx + 1 }));

    const success = await api.updateDefaultTemplate(updatedTemplate);

    if (success) {
      toast.success('Template indikator berhasil dihapus!');
      loadTemplate();
    } else {
      toast.error('Gagal menghapus template!');
    }
  };

  const moveIndicator = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.length) return;

    const updatedTemplate = [...template];
    [updatedTemplate[index], updatedTemplate[newIndex]] = [updatedTemplate[newIndex], updatedTemplate[index]];

    const reordered = updatedTemplate.map((ind, idx) => ({ ...ind, order: idx + 1 }));

    const success = await api.updateDefaultTemplate(reordered);

    if (success) {
      setTemplate(reordered);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'number',
      targetValue: 0,
      targetPhotos: 0,
      targetText: '',
      dropdownOptions: [],
      weight: 0,
      icon: 'Target',
      isSpecial: false,
      specialFormula: ''
    });
    setNewDropdownOption('');
  };

  const addDropdownOption = () => {
    if (newDropdownOption.trim()) {
      setFormData({
        ...formData,
        dropdownOptions: [...formData.dropdownOptions, newDropdownOption.trim()]
      });
      setNewDropdownOption('');
    }
  };

  const removeDropdownOption = (index: number) => {
    setFormData({
      ...formData,
      dropdownOptions: formData.dropdownOptions.filter((_, i) => i !== index)
    });
  };

  const totalWeight = template.reduce((sum, i) => sum + i.weight, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Template Indikator Default</CardTitle>
              <CardDescription>
                Template ini akan digunakan untuk semua cabang baru. Total bobot: {totalWeight}%
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingIndicator(null);
                resetForm();
                setShowDialog(true);
              }}
              className="bg-gradient-to-r from-red-600 to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Indikator
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {template.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada template indikator</p>
          ) : (
            <div className="space-y-3">
              {template.map((indicator, idx) => (
                <Card key={indicator.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveIndicator(idx, 'up')}
                          disabled={idx === 0}
                        >
                          <GripVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold">{indicator.name}</h4>
                        <p className="text-sm text-gray-600">
                          Tipe: {indicator.type} |
                          {indicator.targetValue && ` Target: ${indicator.targetValue} |`}
                          {indicator.targetPhotos && ` Foto: ${indicator.targetPhotos} |`}
                          {indicator.targetText && ` Text: "${indicator.targetText}" |`}
                          {indicator.dropdownOptions && ` Options: ${indicator.dropdownOptions.length} |`}
                          {indicator.isSpecial && ` Formula: ${indicator.specialFormula} |`}
                          Bobot: {indicator.weight}%
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(indicator)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(indicator.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndicator ? 'Edit Template Indikator' : 'Tambah Template Indikator'}
            </DialogTitle>
            <DialogDescription>
              Template ini akan otomatis diterapkan ke semua cabang baru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Indikator</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Sales"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipe Indikator</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Angka</SelectItem>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="number+photo">Angka + Foto</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.type === 'number' || formData.type === 'number+photo') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Nilai (0 jika tidak ada target)</label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            {(formData.type === 'photo' || formData.type === 'number+photo') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah Foto yang Dibutuhkan</label>
                <Input
                  type="number"
                  value={formData.targetPhotos}
                  onChange={(e) => setFormData({ ...formData, targetPhotos: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            {formData.type === 'text' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Placeholder Text (opsional)</label>
                <Input
                  value={formData.targetText}
                  onChange={(e) => setFormData({ ...formData, targetText: e.target.value })}
                  placeholder="Contoh: Masukkan keterangan"
                />
              </div>
            )}

            {formData.type === 'dropdown' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilihan Dropdown</label>
                <div className="flex gap-2">
                  <Input
                    value={newDropdownOption}
                    onChange={(e) => setNewDropdownOption(e.target.value)}
                    placeholder="Tambah pilihan..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDropdownOption())}
                  />
                  <Button type="button" onClick={addDropdownOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.dropdownOptions.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.dropdownOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{option}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDropdownOption(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bobot (%)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">Total saat ini: {totalWeight}%</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                    <SelectItem value="ShoppingCart">ShoppingCart</SelectItem>
                    <SelectItem value="DollarSign">DollarSign</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="UserPlus">UserPlus</SelectItem>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="ThumbsUp">ThumbsUp</SelectItem>
                    <SelectItem value="Target">Target</SelectItem>
                    <SelectItem value="Camera">Camera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSpecial"
                checked={formData.isSpecial}
                onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isSpecial" className="text-sm font-medium">Indikator dengan Formula Khusus</label>
            </div>

            {formData.isSpecial && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Formula Khusus</label>
                <Input
                  value={formData.specialFormula}
                  onChange={(e) => setFormData({ ...formData, specialFormula: e.target.value })}
                  placeholder="Contoh: 50% dari Transaksi"
                />
              </div>
            )}

            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-red-600 to-orange-600">
              <Save className="w-4 h-4 mr-2" />
              Simpan Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
