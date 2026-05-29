import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, Calendar, User } from 'lucide-react';
import { Input } from '../ui/input';
import { api } from '../../utils/api';

interface Submission {
  user: { nik: string; nama: string };
  data: any;
  score: any;
  date: string;
  displayDate: string;
}

export default function RiwayatView() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterNik, setFilterNik] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!branch) return;

    loadSubmissions();
    // REMOVED: Auto-refresh setiap 5s - tidak diperlukan, bisa manual refresh saja!
    // const interval = setInterval(loadSubmissions, 5000);
    // return () => clearInterval(interval);
  }, []);

  const filteredSubmissions = submissions.filter(s => {
    const nikMatch = !filterNik || s.user.nik.toLowerCase().includes(filterNik.toLowerCase());
    const dateMatch = !filterDate || new Date(s.date).toDateString() === new Date(filterDate).toDateString();
    return nikMatch && dateMatch;
  });

  const getScoreBadge = (score: number) => {
    if (score < 80) return <Badge variant="destructive">{score}%</Badge>;
    if (score >= 100) return <Badge className="bg-blue-500">{score}%</Badge>;
    return <Badge className="bg-green-500">{score}%</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Waktu', 'NIK', 'Nama', 'Total Score', 'Sales', 'Transaksi', 'Basket Size', 'No Baru', 'WA Personal', 'After Sales', 'Proteksi', 'VOC/GR', 'MGB'];

    const rows = filteredSubmissions.map(s => {
      const date = new Date(s.date);
      return [
        date.toLocaleDateString('id-ID'),
        date.toLocaleTimeString('id-ID'),
        s.user.nik,
        s.user.nama,
        s.score.total,
        s.data.sales || 0,
        s.data.transaksi || 0,
        s.data.basketSize || 0,
        s.data.noBaru || 0,
        s.data.waPersonal || 0,
        s.data.afterSalesPhotos?.length || 0,
        s.data.proteksi || 0,
        s.data.vocGr || 0,
        s.data.mgbPhotos?.length || 0
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Semua Submission</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Total: {filteredSubmissions.length} submission</p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filter berdasarkan NIK..."
                  value={filterNik}
                  onChange={(e) => setFilterNik(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Tidak ada data submission</p>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-center">Total Score</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Trx</TableHead>
                    <TableHead className="text-right">Basket</TableHead>
                    <TableHead className="text-right">No Baru</TableHead>
                    <TableHead className="text-right">WA</TableHead>
                    <TableHead className="text-center">AS</TableHead>
                    <TableHead className="text-right">Prot</TableHead>
                    <TableHead className="text-right">VOC</TableHead>
                    <TableHead className="text-center">MGB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission, idx) => {
                    const date = new Date(submission.date);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            <div>{date.toLocaleDateString('id-ID')}</div>
                            <div className="text-xs text-gray-500">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{submission.user.nik}</TableCell>
                        <TableCell>{submission.user.nama}</TableCell>
                        <TableCell className="text-center">
                          {getScoreBadge(submission.score.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseInt(submission.data.sales || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">{submission.data.transaksi || 0}</TableCell>
                        <TableCell className="text-right">
                          {parseInt(submission.data.basketSize || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-right">{submission.data.noBaru || 0}</TableCell>
                        <TableCell className="text-right">{submission.data.waPersonal || 0}</TableCell>
                        <TableCell className="text-center">
                          {submission.data.afterSalesPhotos?.length > 0 ? '✓' : '-'}
                        </TableCell>
                        <TableCell className="text-right">{submission.data.proteksi || 0}</TableCell>
                        <TableCell className="text-right">{submission.data.vocGr || 0}</TableCell>
                        <TableCell className="text-center">
                          {submission.data.mgbPhotos?.length || 0}/3
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              Rp {Math.round(filteredSubmissions.reduce((sum, s) => sum + (parseInt(s.data.sales) || 0), 0) / (filteredSubmissions.length || 1)).toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {(filteredSubmissions.reduce((sum, s) => sum + (parseInt(s.data.transaksi) || 0), 0) / (filteredSubmissions.length || 1)).toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {(filteredSubmissions.reduce((sum, s) => sum + s.score.total, 0) / (filteredSubmissions.length || 1)).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Perfect Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {filteredSubmissions.filter(s => s.score.total >= 100).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}