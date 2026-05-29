import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { api } from '../../utils/api';

interface Submission {
  user: { nik: string; nama: string };
  data: any;
  score: { total: number };
  date: string;
  displayDate: string;
}

export default function DashboardView() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [todaySubmissions, setTodaySubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!branch) return;

    loadSubmissions();
    // REMOVED: Auto-refresh setiap 5s - tidak diperlukan, bisa manual refresh saja!
    // const interval = setInterval(loadSubmissions, 5000);
    // return () => clearInterval(interval);
  }, []);

  const avgScore = todaySubmissions.length > 0
    ? todaySubmissions.reduce((sum, s) => sum + s.score.total, 0) / todaySubmissions.length
    : 0;

  const getScoreColor = (score: number) => {
    if (score < 80) return 'text-red-600 bg-red-50';
    if (score >= 100) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getScoreBadge = (score: number) => {
    if (score < 80) return 'bg-red-500';
    if (score >= 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submission Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySubmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Score Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
            <Progress value={avgScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(submissions.map(s => s.user.nik)).size}
            </div>
            <p className="text-xs text-muted-foreground">Semua waktu</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {todaySubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada submission hari ini</p>
          ) : (
            <div className="space-y-3">
              {todaySubmissions.map((submission, idx) => (
                <Card key={idx} className={`${getScoreColor(submission.score.total)} border-2`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full ${getScoreBadge(submission.score.total)} flex items-center justify-center text-white font-bold`}>
                            {submission.score.total}%
                          </div>
                          <div>
                            <p className="font-semibold">{submission.user.nama}</p>
                            <p className="text-sm text-gray-600">NIK: {submission.user.nik}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(submission.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {submission.score.total >= 100 && (
                          <p className="text-xs font-medium text-blue-600 mt-1">🎉 Perfect Score!</p>
                        )}
                        {submission.score.total >= 80 && submission.score.total < 100 && (
                          <p className="text-xs font-medium text-green-600 mt-1">✓ Target Tercapai</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}