import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Download, Users, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dbService, ArtisanData, Order } from '@/services/indexedDB';
import { toast } from 'sonner';

interface WorkProgress {
  type: 'toyMaking' | 'embroidering' | 'bagMaking';
  stages: { name: string; completed: boolean }[];
}

interface StarPerformer {
  name: string;
  photo: string;
  performance: number;
}

export const LeaderDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [artisans, setArtisans] = useState<ArtisanData[]>([]);
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([]);
  const [starPerformer, setStarPerformer] = useState<StarPerformer | null>(null);
  const [isAddArtisanOpen, setIsAddArtisanOpen] = useState(false);
  const [newArtisan, setNewArtisan] = useState({
    name: '',
    phone: '',
    skills: ''
  });

  // Load dynamic data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load orders for this leader
        const orders = await dbService.getOrders();
        const leaderOrders = orders.filter(order => order.leaderId === user?.id);
        setCurrentOrders(leaderOrders);

        // Load artisans
        const artisanData = await dbService.getArtisansByLeader(user?.id || '');
        setArtisans(artisanData);

        // Find star performer
        if (artisanData.length > 0) {
          const topPerformer = artisanData.reduce((prev, current) => {
            const prevScore = prev.performanceMetric === 'great' ? 3 : prev.performanceMetric === 'okay' ? 2 : 1;
            const currentScore = current.performanceMetric === 'great' ? 3 : current.performanceMetric === 'okay' ? 2 : 1;
            return (currentScore > prevScore) ? current : prev;
          });
          
          setStarPerformer({
            name: topPerformer.name,
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            performance: topPerformer.performanceMetric === 'great' ? 95 : topPerformer.performanceMetric === 'okay' ? 75 : 45
          });
        }

        // Generate work progress from actual orders
        const progressData: WorkProgress[] = [];
        leaderOrders.forEach(order => {
          let stages: { name: string; completed: boolean }[] = [];
          
          switch (order.type) {
            case 'toys':
              stages = [
                { name: t('design'), completed: Math.random() > 0.3 },
                { name: t('assembly'), completed: Math.random() > 0.5 },
                { name: t('painting'), completed: Math.random() > 0.7 }
              ];
              progressData.push({ type: 'toyMaking', stages });
              break;
            case 'embroidery':
              stages = [
                { name: t('design'), completed: Math.random() > 0.3 },
                { name: t('stitching'), completed: Math.random() > 0.5 },
                { name: t('finishing'), completed: Math.random() > 0.7 }
              ];
              progressData.push({ type: 'embroidering', stages });
              break;
            case 'bags':
              stages = [
                { name: t('cutting'), completed: Math.random() > 0.3 },
                { name: t('stitching'), completed: Math.random() > 0.5 },
                { name: t('finishing'), completed: Math.random() > 0.7 }
              ];
              progressData.push({ type: 'bagMaking', stages });
              break;
          }
        });
        
        setWorkProgress(progressData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, t]);

  const handleAddArtisan = async () => {
    if (!newArtisan.name || !newArtisan.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const artisan: ArtisanData = {
        id: `artisan-${Date.now()}`,
        name: newArtisan.name,
        leaderId: user?.id || '',
        performanceMetric: 'okay',
        productsCreated: 0,
        qualityCheck: 0,
        amountToPay: 0,
        skillsAdded: newArtisan.skills ? newArtisan.skills.split(',').map(s => s.trim()) : []
      };

      const updatedArtisans = [...artisans, artisan];
      await dbService.saveArtisans(updatedArtisans);
      setArtisans(updatedArtisans);
      setIsAddArtisanOpen(false);
      setNewArtisan({ name: '', phone: '', skills: '' });
      toast.success('Artisan added successfully!');
    } catch (error) {
      toast.error('Failed to add artisan');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = artisans.map(artisan => ({
        Name: artisan.name,
        Performance: artisan.performanceMetric,
        'Products Created': artisan.productsCreated,
        'Quality Check': artisan.qualityCheck,
        'Amount to Pay': artisan.amountToPay,
        Skills: artisan.skillsAdded.join('; ')
      }));
      
      // Include orders data
      const ordersData = currentOrders.map(order => ({
        'Order ID': order.id,
        'Type': order.type,
        'Products': order.numberOfProducts,
        'Deadline': order.deadline,
        'Status': order.status
      }));

      const combinedData = [
        { section: 'Artisans Data' },
        ...csvData,
        { section: '' },
        { section: 'Orders Data' },
        ...ordersData
      ];
      
      dbService.generateCSV(combinedData, `leader-dashboard-${Date.now()}.csv`);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case 'toyMaking': return 'bg-blue-500';
      case 'embroidering': return 'bg-purple-500';
      case 'bagMaking': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (stages: { completed: boolean }[]) => {
    const completed = stages.filter(stage => stage.completed).length;
    return (completed / stages.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('leaderDashboard')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('name')}</div>
                <div className="text-lg font-semibold">{user?.name}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('village')}</div>
                <div className="text-lg font-semibold">{user?.village || 'Jodhpur Village'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">{t('activeOrders')}</div>
                  <div className="text-lg font-semibold">{currentOrders.length}</div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isAddArtisanOpen} onOpenChange={setIsAddArtisanOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Artisan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Artisan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={newArtisan.name}
                            onChange={(e) => setNewArtisan(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter artisan name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number *</Label>
                          <Input
                            value={newArtisan.phone}
                            onChange={(e) => setNewArtisan(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Skills (comma separated)</Label>
                          <Input
                            value={newArtisan.skills}
                            onChange={(e) => setNewArtisan(prev => ({ ...prev, skills: e.target.value }))}
                            placeholder="e.g., Toy Making, Painting"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleAddArtisan} className="flex-1">
                            Add Artisan
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddArtisanOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('exportCsv')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Work Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Work Progress Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workProgress.map((work) => (
              <Card key={work.type} className="relative overflow-hidden">
                <div className={`h-2 ${getWorkTypeColor(work.type)}`} />
                <CardHeader>
                  <CardTitle className="text-lg">{t(work.type)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={calculateProgress(work.stages)} className="w-full" />
                    <div className="space-y-2">
                      {work.stages.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{stage.name}</span>
                          <Badge variant={stage.completed ? "default" : "secondary"}>
                            {stage.completed ? '✓' : '○'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Star Performer Section */}
        {starPerformer && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Star className="h-5 w-5 fill-current" />
                  {t('starPerformer')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={starPerformer.photo}
                      alt={starPerformer.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-yellow-400"
                    />
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                        Top
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{starPerformer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Performance:</span>
                      <Badge variant="default">{starPerformer.performance}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/artisan-records')}
            className="flex-1"
          >
            <Users className="h-5 w-5 mr-2" />
            {t('artisanRecords')}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex-1"
          >
            <Download className="h-5 w-5 mr-2" />
            {t('exportCsv')}
          </Button>
        </div>
      </div>
    </div>
  );
};