import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Download, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { dbService, ArtisanData } from '@/services/indexedDB';
import { toast } from 'sonner';

export const ArtisanRecordsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [artisans, setArtisans] = useState<ArtisanData[]>([]);
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>('');
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanData | null>(null);
  const [editData, setEditData] = useState<Partial<ArtisanData>>({});

  // Initialize mock data
  useEffect(() => {
    const initializeArtisans = async () => {
      const mockArtisans: ArtisanData[] = [
        {
          id: '1',
          name: 'Rahul Sharma',
          leaderId: user?.id || '1',
          performanceMetric: 'great',
          productsCreated: 45,
          qualityCheck: 5,
          amountToPay: 2250,
          skillsAdded: ['Toy Painting', 'Quality Control']
        },
        {
          id: '2',
          name: 'Sunita Devi',
          leaderId: user?.id || '1',
          performanceMetric: 'okay',
          productsCreated: 32,
          qualityCheck: 3,
          amountToPay: 1600,
          skillsAdded: ['Embroidery', 'Pattern Design']
        },
        {
          id: '3',
          name: 'Vijay Kumar',
          leaderId: user?.id || '1',
          performanceMetric: 'great',
          productsCreated: 38,
          qualityCheck: 4,
          amountToPay: 1900,
          skillsAdded: ['Bag Stitching', 'Material Cutting']
        },
        {
          id: '4',
          name: 'Anita Patel',
          leaderId: user?.id || '1',
          performanceMetric: 'worst',
          productsCreated: 18,
          qualityCheck: 2,
          amountToPay: 900,
          skillsAdded: ['Basic Stitching']
        }
      ];

      await dbService.saveArtisans(mockArtisans);
      const savedArtisans = await dbService.getArtisansByLeader(user?.id || '1');
      setArtisans(savedArtisans);
    };

    initializeArtisans();
  }, [user?.id]);

  // Handle artisan selection
  useEffect(() => {
    if (selectedArtisanId) {
      const artisan = artisans.find(a => a.id === selectedArtisanId);
      if (artisan) {
        setSelectedArtisan(artisan);
        setEditData({
          performanceMetric: artisan.performanceMetric,
          productsCreated: artisan.productsCreated,
          qualityCheck: artisan.qualityCheck,
          amountToPay: artisan.amountToPay,
          skillsAdded: artisan.skillsAdded
        });
      }
    } else {
      setSelectedArtisan(null);
      setEditData({});
    }
  }, [selectedArtisanId, artisans]);

  // Calculate dynamic values
  useEffect(() => {
    if (editData.productsCreated) {
      const productsCreated = editData.productsCreated;
      // Calculate quality check as 10% of products created
      const autoQualityCheck = Math.ceil(productsCreated * 0.1);
      // Calculate amount to pay (₹50 per product in this example)
      const amountToPay = productsCreated * 50;
      
      setEditData(prev => ({
        ...prev,
        amountToPay
      }));
    }
  }, [editData.productsCreated]);

  const handleSave = async () => {
    if (!selectedArtisan || !editData.performanceMetric || !editData.productsCreated) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const updatedArtisan: ArtisanData = {
        ...selectedArtisan,
        ...editData,
        skillsAdded: editData.skillsAdded || []
      };

      // Update in IndexedDB (in real app, this would be API call)
      const updatedArtisans = artisans.map(a => 
        a.id === selectedArtisan.id ? updatedArtisan : a
      );
      await dbService.saveArtisans(updatedArtisans);
      setArtisans(updatedArtisans);
      
      toast.success('Artisan record updated successfully!');
    } catch (error) {
      toast.error('Failed to update artisan record');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = artisans.map(artisan => ({
        Name: artisan.name,
        Performance: artisan.performanceMetric,
        'Products Created': artisan.productsCreated,
        'Quality Check': artisan.qualityCheck,
        'Amount to Pay': `₹${artisan.amountToPay}`,
        Skills: artisan.skillsAdded.join('; ')
      }));
      
      dbService.generateCSV(csvData, `artisan-records-${Date.now()}.csv`);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getPerformanceColor = (metric: string) => {
    switch (metric) {
      case 'great': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'okay': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'worst': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditData(prev => ({ ...prev, skillsAdded: skillsArray }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('artisanRecords')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage artisan performance and records
            </p>
          </div>

          <Button onClick={handleExportCSV} className="mt-4 sm:mt-0">
            <Download className="h-4 w-4 mr-2" />
            {t('exportCsv')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Artisan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Artisan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedArtisanId} onValueChange={setSelectedArtisanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an artisan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {artisans.map((artisan) => (
                      <SelectItem key={artisan.id} value={artisan.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{artisan.name}</span>
                          <Badge className={`ml-2 ${getPerformanceColor(artisan.performanceMetric)}`}>
                            {t(artisan.performanceMetric)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Artisans List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">All Artisans</h4>
                  {artisans.map((artisan) => (
                    <div 
                      key={artisan.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedArtisanId === artisan.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setSelectedArtisanId(artisan.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{artisan.name}</span>
                        <Badge className={getPerformanceColor(artisan.performanceMetric)}>
                          {t(artisan.performanceMetric)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {artisan.productsCreated} products • ₹{artisan.amountToPay}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artisan Details Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedArtisan ? `${selectedArtisan.name} - Details` : 'Select an artisan to view details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedArtisan ? (
                <div className="space-y-6">
                  {/* Performance Metric */}
                  <div className="space-y-2">
                    <Label>{t('performanceMetric')}</Label>
                    <Select 
                      value={editData.performanceMetric || ''} 
                      onValueChange={(value) => setEditData(prev => ({ ...prev, performanceMetric: value as 'worst' | 'okay' | 'great' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worst">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            {t('worst')}
                          </div>
                        </SelectItem>
                        <SelectItem value="okay">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            {t('okay')}
                          </div>
                        </SelectItem>
                        <SelectItem value="great">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            {t('great')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Products Created */}
                  <div className="space-y-2">
                    <Label>{t('productsCreated')}</Label>
                    <Input
                      type="number"
                      value={editData.productsCreated || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, productsCreated: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter number of products"
                    />
                  </div>

                  {/* Auto-calculated Quality Check */}
                  <div className="space-y-2">
                    <Label>Check Products (10% of total)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editData.productsCreated ? Math.ceil(editData.productsCreated * 0.1) : ''}
                        disabled
                        className="bg-muted"
                      />
                      <span className="text-xs text-muted-foreground">Auto-calculated</span>
                    </div>
                  </div>

                  {/* Editable Quality Check */}
                  <div className="space-y-2">
                    <Label>{t('qualityCheck')} (Actual)</Label>
                    <Input
                      type="number"
                      value={editData.qualityCheck || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, qualityCheck: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter actual quality check number"
                    />
                  </div>

                  {/* Amount to Pay */}
                  <div className="space-y-2">
                    <Label>{t('amountToPay')}</Label>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-primary">
                        ₹{editData.amountToPay || 0}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        (₹50 per product)
                      </span>
                    </div>
                  </div>

                  {/* Skills Added */}
                  <div className="space-y-2">
                    <Label>{t('skillsAdded')}</Label>
                    <Textarea
                      value={editData.skillsAdded?.join(', ') || ''}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      placeholder="Enter skills separated by commas (e.g., Toy Painting, Quality Control)"
                      rows={3}
                    />
                    <div className="text-xs text-muted-foreground">
                      Separate multiple skills with commas
                    </div>
                  </div>

                  {/* Skills Display */}
                  {editData.skillsAdded && editData.skillsAdded.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {editData.skillsAdded.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {t('save')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Select an artisan
                  </h3>
                  <p className="text-muted-foreground">
                    Choose an artisan from the dropdown to view and edit their details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};