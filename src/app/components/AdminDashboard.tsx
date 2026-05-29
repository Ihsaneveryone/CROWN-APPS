import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Settings, History, Target as TargetIcon, ArrowLeft, Crown } from 'lucide-react';
import { Branch } from '../types';
import AdminIndicators from './admin/AdminIndicators';
import AdminHistory from './admin/AdminHistory';
import AdminSettings from './admin/AdminSettings';

interface AdminDashboardProps {
  user: any;
  branch: Branch;
  onLogout: () => void;
  onBack: () => void;
}

export default function AdminDashboard({ user, branch, onLogout, onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('indicators');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-red-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  CROWN Admin Panel
                </h1>
                <p className="text-sm text-gray-600">{branch.displayName || branch.name} - {user.nama}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Only show Back button if it's different from Logout (accessed from main page) */}
              {onBack !== onLogout && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              )}
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="indicators">
              <TargetIcon className="w-4 h-4 mr-2" />
              Kelola Indikator
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Riwayat
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="indicators">
            <AdminIndicators branch={branch} />
          </TabsContent>

          <TabsContent value="history">
            <AdminHistory branch={branch} />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings branch={branch} user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
