import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Download, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dbService } from '@/services/indexedDB';

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
  
  const [currentOrderId, setCurrentOrderId] = useState('ORD-2024-001');
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([
    {
      type: 'toyMaking',
      stages: [
        { name: t('design'), completed: true },
        { name: t('assembly'), completed: true },
        { name: t('painting'), completed: false }
      ]
    },
    {
      type: 'embroidering',
      stages: [
        { name: t('design'), completed: true },
        { name: t('stitching'), completed: false },
        { name: t('finishing'), completed: false }
      ]
    },
    {
      type: 'bagMaking',
      stages: [
        { name: t('cutting'), completed: true },
        { name: t('stitching'), completed: true },
        { name: t('finishing'), completed: true }
      ]
    }
  ]);

  const [starPerformer] = useState<StarPerformer>({
    name: 'Rahul Sharma',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    performance: 95
  });

  const handleExportCSV = async () => {
    try {
      const artisans = await dbService.getArtisansByLeader(user?.id || '');
      const csvData = artisans.map(artisan => ({
        Name: artisan.name,
        Performance: artisan.performanceMetric,
        'Products Created': artisan.productsCreated,
        'Quality Check': artisan.qualityCheck,
        'Amount to Pay': artisan.amountToPay,
        Skills: artisan.skillsAdded.join('; ')
      }));
      
      dbService.generateCSV(csvData, `leader-dashboard-${Date.now()}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
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
                  <div className="text-sm text-muted-foreground">{t('currentOrderId')}</div>
                  <div className="text-lg font-semibold">{currentOrderId}</div>
                </div>
                <Button size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('exportCsv')}
                </Button>
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