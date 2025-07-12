import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Filter, Calendar, Package, User, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { dbService, Order } from '@/services/indexedDB';
import { OrderTracking } from './OrderTracking';
import { toast } from 'sonner';

export const OrdersPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    deadline: ''
  });
  const [orderProgress, setOrderProgress] = useState<{[key: string]: {design: boolean, assembly: boolean, painting: boolean, stitching: boolean, finishing: boolean, cutting: boolean}}>({});
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);

  // Mock data initialization
  useEffect(() => {
    const initializeOrders = async () => {
      const mockOrders: Order[] = [
        {
          id: 'ORD-2024-001',
          type: 'toys',
          numberOfProducts: 50,
          deadline: '2024-12-31',
          leaderId: '1',
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: 'ORD-2024-002',
          type: 'embroidery',
          numberOfProducts: 30,
          deadline: '2024-12-25',
          leaderId: '2',
          status: 'pending',
          createdAt: '2024-01-20'
        },
        {
          id: 'ORD-2024-003',
          type: 'bags',
          numberOfProducts: 25,
          deadline: '2024-12-20',
          leaderId: '1',
          status: 'active',
          createdAt: '2024-01-25'
        }
      ];

      await dbService.saveOrders(mockOrders);
      const savedOrders = await dbService.getOrders();
      setOrders(savedOrders);
      setFilteredOrders(savedOrders);
    };

    initializeOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(order => order.type === filters.type);
    }

    if (filters.deadline) {
      filtered = filtered.filter(order => 
        new Date(order.deadline) <= new Date(filters.deadline)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const [newOrder, setNewOrder] = useState({
    type: '',
    numberOfProducts: '',
    deadline: '',
    leaderId: ''
  });

  const leaders = [
    { id: '1', name: 'Priya Sharma', performanceScore: 95, orderType: 'toys' },
    { id: '2', name: 'Rahul Kumar', performanceScore: 88, orderType: 'embroidery' },
    { id: '3', name: 'Meera Singh', performanceScore: 92, orderType: 'bags' }
  ];

  const handleAddOrder = async () => {
    if (!newOrder.type || !newOrder.numberOfProducts || !newOrder.deadline || !newOrder.leaderId) {
      toast.error('Please fill all fields');
      return;
    }

    const order: Order = {
      id: `ORD-${Date.now()}`,
      type: newOrder.type as 'toys' | 'embroidery' | 'bags',
      numberOfProducts: parseInt(newOrder.numberOfProducts),
      deadline: newOrder.deadline,
      leaderId: newOrder.leaderId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await dbService.addOrder(order);
      const updatedOrders = await dbService.getOrders();
      setOrders(updatedOrders);
      setIsAddOrderOpen(false);
      setNewOrder({ type: '', numberOfProducts: '', deadline: '', leaderId: '' });
      toast.success('Order added successfully!');
    } catch (error) {
      toast.error('Failed to add order');
    }
  };

  const handleUpdateProgress = (orderId: string, progress: any) => {
    // Update progress in local state or database
    console.log('Updating progress for order:', orderId, progress);
  };

  const handleDispatchOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder: Order = { ...order, status: 'dispatched' };
        const updatedOrders = orders.map(o => o.id === orderId ? updatedOrder : o);
        await dbService.saveOrders(updatedOrders);
        setOrders(updatedOrders);
        setSelectedOrderForTracking(null);
        toast.success('Order dispatched successfully!');
      }
    } catch (error) {
      toast.error('Failed to dispatch order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'dispatched': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('orders')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all artisan orders
            </p>
          </div>

          {user?.role === 'admin' && (
            <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addNewOrder')}
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('addNewOrder')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('orderType')}</Label>
                  <Select value={newOrder.type} onValueChange={(value) => setNewOrder(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toys">{t('toys')}</SelectItem>
                      <SelectItem value="embroidery">{t('embroidery')}</SelectItem>
                      <SelectItem value="bags">{t('bags')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('numberOfProducts')}</Label>
                  <Input
                    type="number"
                    value={newOrder.numberOfProducts}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, numberOfProducts: e.target.value }))}
                    placeholder="Enter number of products"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('deadline')}</Label>
                  <Input
                    type="date"
                    value={newOrder.deadline}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('leader')}</Label>
                  <Select value={newOrder.leaderId} onValueChange={(value) => setNewOrder(prev => ({ ...prev, leaderId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders
                        .sort((a, b) => b.performanceScore - a.performanceScore)
                        .map((leader) => (
                          <SelectItem key={leader.id} value={leader.id}>
                            {leader.name} (Score: {leader.performanceScore})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddOrder} className="flex-1">
                    {t('submit')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddOrderOpen(false)} className="flex-1">
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('filter')} {t('orders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="toys">{t('toys')}</SelectItem>
                    <SelectItem value="embroidery">{t('embroidery')}</SelectItem>
                    <SelectItem value="bags">{t('bags')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Deadline Before</Label>
                <Input
                  type="date"
                  value={filters.deadline}
                  onChange={(e) => setFilters(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {t(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getTypeColor(order.type)}>
                      {t(order.type)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Products:</span>
                    <span className="font-semibold">{order.numberOfProducts}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Deadline: {new Date(order.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {leaders.find(l => l.id === order.leaderId)?.name || 'Unknown Leader'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">
                      Created: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Track Order Button for Leaders */}
                  {user?.role === 'leader' && order.leaderId === user.id && order.status !== 'dispatched' && (
                    <div className="pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedOrderForTracking(order.id)}
                        className="w-full"
                      >
                        Track Order Progress
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              No orders found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or add a new order
            </p>
          </div>
        )}

        {/* Order Tracking Modal */}
        {selectedOrderForTracking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order Tracking</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrderForTracking(null)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4">
                {orders
                  .filter(order => order.id === selectedOrderForTracking)
                  .map(order => (
                    <OrderTracking
                      key={order.id}
                      order={order}
                      onUpdateProgress={handleUpdateProgress}
                      onDispatchOrder={handleDispatchOrder}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};