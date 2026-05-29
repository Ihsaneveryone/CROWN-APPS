import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Branch } from '../../types';

interface AdminIndicatorsProps {
  branch: Branch;
}

export default function AdminIndicators({ branch }: AdminIndicatorsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-orange-900 mb-2">Kelola Indikator</CardTitle>
              <CardDescription className="text-orange-800">
                Informasi tentang pengelolaan indikator untuk cabang ini
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-6 border-2 border-orange-300">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  UPDATE INDIKATOR DAPAT DILAKUKAN DI SPREADSHEET DATABASE TOKO
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Untuk menambah, mengedit, atau menghapus indikator, silakan akses Google Spreadsheet database toko Anda.
                  Perubahan yang dilakukan di spreadsheet akan otomatis tersinkronisasi dengan aplikasi.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-orange-200">
              <p className="text-sm text-gray-600">
                <strong>Catatan:</strong> Pastikan Anda memiliki akses ke spreadsheet database toko untuk melakukan perubahan indikator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}