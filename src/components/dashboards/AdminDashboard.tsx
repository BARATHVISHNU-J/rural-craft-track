import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dbService } from '@/services/indexedDB';

interface DashboardStats {
  totalLeaders: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalArtisans: number;
  thisMonthOrders: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalLeaders: 12,
    totalOrders: 48,
    activeOrders: 15,
    completedOrders: 33,
    totalArtisans: 156,
    thisMonthOrders: 8
  });

  const [recentActivities] = useState([
    { id: 1, type: 'order', message: 'New toy order assigned to Priya Sharma', time: '2 hours ago' },
    { id: 2, type: 'leader', message: 'Rahul Kumar completed embroidery order', time: '4 hours ago' },
    { id: 3, type: 'artisan', message: '5 new artisans registered under Meera Singh', time: '6 hours ago' },
    { id: 4, type: 'order', message: 'Bag making order deadline extended', time: '1 day ago' },
  ]);

  const handleExportAllData = async () => {
    try {
      // Export comprehensive data
      const [leaders, orders, artisans] = await Promise.all([
        dbService.getLeaders(),
        dbService.getOrders(),
        dbService.getArtisans()
      ]);

      // Create summary report
      const summaryData = [{
        'Total Leaders': leaders.length,
        'Total Orders': orders.length,
        'Active Orders': orders.filter(o => o.status === 'active').length,
        'Total Artisans': artisans.length,
        'Report Date': new Date().toLocaleDateString()
      }];

      dbService.generateCSV(summaryData, `admin-dashboard-summary-${Date.now()}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    color = "primary" 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    change?: string; 
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-green-600 mt-1">{change}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('adminDashboard')}
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
            <Button onClick={handleExportAllData} className="mt-4 sm:mt-0">
              <Download className="h-4 w-4 mr-2" />
              {t('exportCsv')}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leaders"
            value={stats.totalLeaders}
            icon={Users}
            change="+2 this month"
            color="primary"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            change="+8 this month"
            color="success"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={TrendingUp}
            color="warning"
          />
          <StatCard
            title="Total Artisans"
            value={stats.totalArtisans}
            icon={UserCheck}
            change="+15 this month"
            color="primary"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Manage Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage all artisan orders
              </p>
              <Button 
                onClick={() => navigate('/orders')} 
                className="w-full"
              >
                View {t('orders')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View leader performance and details
              </p>
              <Button 
                onClick={() => navigate('/leaders')} 
                variant="outline" 
                className="w-full"
              >
                View {t('leaders')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed performance analytics
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportAllData}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="ml-2"
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};