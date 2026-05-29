import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, TrendingUp, Award, Medal } from 'lucide-react';
import { Branch } from '../../types';
import { api } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';

interface SuperAdminRankingProps {
  branches: Branch[];
}

interface BranchRanking {
  branch: Branch;
  averageScore: number;
  totalSubmissions: number;
  perfectScores: number;
  activeUsers: number;
}

export default function SuperAdminRanking({ branches }: SuperAdminRankingProps) {
  // ⚡ INSTANT RENDER: Generate initial dummy ranking from branches
  const generateInitialRanking = (): BranchRanking[] => {
    return branches.map(branch => ({
      branch,
      averageScore: 0,
      totalSubmissions: 0,
      perfectScores: 0,
      activeUsers: 0
    }));
  };

  // ⚡ REACT QUERY: Cache + Stale-While-Revalidate!
  const { data: rankings = generateInitialRanking(), isFetching } = useQuery({
    queryKey: ['branch-rankings', branches.map(b => b.id).join(',')],
    queryFn: async () => {
      console.log('🔄 Fetching rankings for', branches.length, 'branches...');
      const startTime = Date.now();

      // PARALLEL FETCH: Load all branches at once! 
      const rankingData = await Promise.all(
        branches.map(async (branch) => {
          const submissions = await api.getAllSubmissions(branch.id);

          const averageScore = submissions.length > 0
            ? submissions.reduce((sum: number, s: any) => sum + s.totalScore, 0) / submissions.length
            : 0;

          return {
            branch,
            averageScore: Math.round(averageScore * 10) / 10,
            totalSubmissions: submissions.length,
            perfectScores: submissions.filter((s: any) => s.totalScore >= 100).length,
            activeUsers: new Set(submissions.map((s: any) => s.user.nik)).size
          };
        })
      );

      // ⚡ SORT: Submissions count FIRST, then average score!
      rankingData.sort((a, b) => {
        // Primary sort: Total submissions (descending)
        if (b.totalSubmissions !== a.totalSubmissions) {
          return b.totalSubmissions - a.totalSubmissions;
        }
        // Secondary sort: Average score (descending)
        return b.averageScore - a.averageScore;
      });

      const elapsed = Date.now() - startTime;
      console.log(`✅ Rankings loaded in ${elapsed}ms!`);

      return rankingData;
    },
    initialData: generateInitialRanking(), // ⚡ INSTANT: Show branches immediately!
    staleTime: 30 * 1000, // 30 seconds - refresh frequently
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: branches.length > 0,
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 2) return <Award className="w-8 h-8 text-orange-600" />;
    return <TrendingUp className="w-8 h-8 text-gray-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 1) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Ranking Toko (Urut: Submit Terbanyak → Avg Score)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Ranking berdasarkan jumlah submission, lalu average score
              </p>
            </div>
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.map((ranking, idx) => (
              <Card key={ranking.branch.id} className={`border-2 ${idx < 3 ? 'shadow-lg' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-16 h-16 rounded-full ${getRankBadge(idx)} flex items-center justify-center font-bold text-2xl flex-shrink-0`}>
                      #{idx + 1}
                    </div>

                    {/* Medal Icon for Top 3 */}
                    <div className="flex-shrink-0">
                      {getMedalIcon(idx)}
                    </div>

                    {/* Branch Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">
                        {ranking.branch.displayName || ranking.branch.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        NIK: {ranking.branch.nik} | Admin: {ranking.branch.adminName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {ranking.averageScore}%
                        </p>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {ranking.totalSubmissions}
                        </p>
                        <p className="text-xs text-gray-500">Submissions</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-600">
                          {ranking.perfectScores}
                        </p>
                        <p className="text-xs text-gray-500">Perfect (100%)</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {ranking.activeUsers}
                        </p>
                        <p className="text-xs text-gray-500">Active Users</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rankings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Belum ada data untuk ranking
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Highest Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {rankings[0].averageScore}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {rankings[0].branch.displayName || rankings[0].branch.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Most Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {Math.max(...rankings.map(r => r.totalSubmissions))}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {rankings.find(r => r.totalSubmissions === Math.max(...rankings.map(x => x.totalSubmissions)))?.branch.displayName}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Most Perfect Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {Math.max(...rankings.map(r => r.perfectScores))}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {rankings.find(r => r.perfectScores === Math.max(...rankings.map(x => x.perfectScores)))?.branch.displayName}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}