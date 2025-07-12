import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, MapPin, Phone, Star, TrendingUp, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { dbService, Leader } from '@/services/indexedDB';

export const LeadersPage = () => {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [filteredLeaders, setFilteredLeaders] = useState<Leader[]>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize mock data
  useEffect(() => {
    const initializeLeaders = async () => {
      const mockLeaders: Leader[] = [
        {
          id: '1',
          name: 'Priya Sharma',
          phone: '+91 98765 43210',
          numberOfArtisans: 15,
          ordersReceived: 8,
          currentOrderId: 'ORD-2024-001',
          performanceScore: 95,
          location: 'Jodhpur Village',
          orderType: 'toys'
        },
        {
          id: '2',
          name: 'Rahul Kumar',
          phone: '+91 87654 32109',
          numberOfArtisans: 12,
          ordersReceived: 6,
          currentOrderId: 'ORD-2024-002',
          performanceScore: 88,
          location: 'Udaipur District',
          orderType: 'embroidery'
        },
        {
          id: '3',
          name: 'Meera Singh',
          phone: '+91 76543 21098',
          numberOfArtisans: 18,
          ordersReceived: 10,
          currentOrderId: 'ORD-2024-003',
          performanceScore: 92,
          location: 'Jaisalmer Region',
          orderType: 'bags'
        },
        {
          id: '4',
          name: 'Arjun Patel',
          phone: '+91 65432 10987',
          numberOfArtisans: 9,
          ordersReceived: 4,
          currentOrderId: 'ORD-2024-004',
          performanceScore: 78,
          location: 'Bikaner City',
          orderType: 'toys'
        },
        {
          id: '5',
          name: 'Kavita Agarwal',
          phone: '+91 54321 09876',
          numberOfArtisans: 14,
          ordersReceived: 7,
          currentOrderId: 'ORD-2024-005',
          performanceScore: 90,
          location: 'Ajmer Village',
          orderType: 'embroidery'
        }
      ];

      await dbService.saveLeaders(mockLeaders);
      const savedLeaders = await dbService.getLeaders();
      setLeaders(savedLeaders);
      setFilteredLeaders(savedLeaders);
    };

    initializeLeaders();
  }, []);

  // Filter leaders
  useEffect(() => {
    let filtered = leaders;

    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(leader => leader.orderType === orderTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(leader => 
        leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leader.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaders(filtered);
  }, [leaders, orderTypeFilter, searchTerm]);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'toys': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'embroidery': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'bags': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('leaders')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage cluster leaders and their performance
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Order Types</SelectItem>
                    <SelectItem value="toys">{t('toys')}</SelectItem>
                    <SelectItem value="embroidery">{t('embroidery')}</SelectItem>
                    <SelectItem value="bags">{t('bags')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaders.map((leader) => (
            <Card key={leader.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{leader.name}</CardTitle>
                  <Badge className={getPerformanceColor(leader.performanceScore)}>
                    <Star className="h-3 w-3 mr-1" />
                    {leader.performanceScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{leader.phone}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{leader.location}</span>
                  </div>

                  {/* Artisans Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Artisans</span>
                    </div>
                    <Badge variant="secondary">
                      {leader.numberOfArtisans}
                    </Badge>
                  </div>

                  {/* Orders Received */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Orders Received</span>
                    </div>
                    <Badge variant="secondary">
                      {leader.ordersReceived}
                    </Badge>
                  </div>

                  {/* Current Order */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Current Order</span>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {leader.currentOrderId}
                    </span>
                  </div>

                  {/* Order Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Specialization</span>
                    <Badge className={getOrderTypeColor(leader.orderType)}>
                      {t(leader.orderType)}
                    </Badge>
                  </div>

                  {/* Performance Score Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Performance</span>
                      <span className="text-sm font-semibold">{leader.performanceScore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${leader.performanceScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLeaders.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              No leaders found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};