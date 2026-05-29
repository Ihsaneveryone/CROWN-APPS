import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Crown, LogOut, Users, Shield, Building2, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import LoadingScreen from './LoadingScreen';

export default function CrownAdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('super-admins');

  // Super Admin states
  const [superAdmins, setSuperAdmins] = useState([
    { nik: 'SUPER001', code: 'IHSANAZKO', nama: 'Super Admin' }
  ]);

  useEffect(() => {
    const initializeAdmin = async () => {
      const session = localStorage.getItem('crown_admin_session');
      if (!session) {
        navigate('/crown-select');
        return;
      }
      setUser(JSON.parse(session));

      // Load super admins from localStorage
      const savedSuperAdmins = localStorage.getItem('super_admins');
      if (savedSuperAdmins) {
        setSuperAdmins(JSON.parse(savedSuperAdmins));
      }

      setLoading(false);
    };
    initializeAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('crown_admin_session');
    navigate('/crown-select');
  };

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 border-b-4 border-yellow-600 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-yellow-300">
                <Crown className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">ADMIN CROWN</h1>
                <p className="text-sm text-yellow-100">{user.nama} - Supreme Authority</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Super Admins</p>
                  <p className="text-3xl font-bold text-blue-600">{superAdmins.length}</p>
                </div>
                <Shield className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Branch Admins</p>
                  <p className="text-3xl font-bold text-green-600">-</p>
                </div>
                <Users className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Branches</p>
                  <p className="text-3xl font-bold text-orange-600">-</p>
                </div>
                <Building2 className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Access</p>
                  <p className="text-xl font-bold text-yellow-600">Full Control</p>
                </div>
                <Crown className="w-12 h-12 text-yellow-500 opacity-20" fill="currentColor" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="super-admins">
                  <Shield className="w-4 h-4 mr-2" />
                  Super Admins
                </TabsTrigger>
                <TabsTrigger value="branch-admins">
                  <Users className="w-4 h-4 mr-2" />
                  Branch Admins
                </TabsTrigger>
                <TabsTrigger value="branches">
                  <Building2 className="w-4 h-4 mr-2" />
                  Branches
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="super-admins">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Super Administrator List</h3>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Add Super Admin
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {superAdmins.map((admin, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{admin.nama}</p>
                              <p className="text-sm text-gray-600">NIK: {admin.nik}</p>
                              <p className="text-xs text-gray-500">Code: {admin.code}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="branch-admins">
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Branch Admin management - Coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="branches">
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Branch management - Coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>System settings - Coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}
