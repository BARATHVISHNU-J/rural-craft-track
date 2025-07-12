import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/services/indexedDB';
import { toast } from 'sonner';

interface OrderTrackingProps {
  order: Order;
  onUpdateProgress: (orderId: string, progress: any) => void;
  onDispatchOrder: (orderId: string) => void;
}

interface TrackingStage {
  id: string;
  name: string;
  completed: boolean;
}

export const OrderTracking = ({ order, onUpdateProgress, onDispatchOrder }: OrderTrackingProps) => {
  const { t } = useLanguage();
  const [stages, setStages] = useState<TrackingStage[]>([]);
  const [canDispatch, setCanDispatch] = useState(false);

  // Initialize stages based on order type
  useEffect(() => {
    let initialStages: TrackingStage[] = [];
    
    switch (order.type) {
      case 'toys':
        initialStages = [
          { id: 'design', name: t('design'), completed: false },
          { id: 'assembly', name: t('assembly'), completed: false },
          { id: 'painting', name: t('painting'), completed: false },
        ];
        break;
      case 'embroidery':
        initialStages = [
          { id: 'design', name: t('design'), completed: false },
          { id: 'stitching', name: t('stitching'), completed: false },
          { id: 'finishing', name: t('finishing'), completed: false },
        ];
        break;
      case 'bags':
        initialStages = [
          { id: 'cutting', name: t('cutting'), completed: false },
          { id: 'stitching', name: t('stitching'), completed: false },
          { id: 'finishing', name: t('finishing'), completed: false },
        ];
        break;
    }
    
    setStages(initialStages);
  }, [order.type, t]);

  // Check if all stages are completed
  useEffect(() => {
    const allCompleted = stages.length > 0 && stages.every(stage => stage.completed);
    setCanDispatch(allCompleted);
  }, [stages]);

  const handleStageToggle = (stageId: string, completed: boolean) => {
    const updatedStages = stages.map(stage =>
      stage.id === stageId ? { ...stage, completed } : stage
    );
    setStages(updatedStages);
    onUpdateProgress(order.id, updatedStages);
  };

  const handleDispatch = () => {
    if (canDispatch) {
      onDispatchOrder(order.id);
      toast.success('Order dispatched successfully!');
    } else {
      toast.error('Please complete all stages before dispatching');
    }
  };

  const calculateProgress = () => {
    if (stages.length === 0) return 0;
    const completed = stages.filter(stage => stage.completed).length;
    return (completed / stages.length) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Tracking - {order.id}
          </CardTitle>
          <Badge variant={order.status === 'dispatched' ? 'default' : 'secondary'}>
            {order.status === 'dispatched' ? 'Dispatched' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">Type</span>
            <p className="font-semibold">{t(order.type)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Products</span>
            <p className="font-semibold">{order.numberOfProducts}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Deadline</span>
            <p className="font-semibold">{new Date(order.deadline).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Progress</span>
            <p className="font-semibold">{Math.round(calculateProgress())}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <h4 className="font-semibold">Production Checklist</h4>
          <div className="space-y-3">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={stage.id}
                  checked={stage.completed}
                  onCheckedChange={(checked) => handleStageToggle(stage.id, checked as boolean)}
                  disabled={order.status === 'dispatched'}
                />
                <label 
                  htmlFor={stage.id}
                  className={`flex-1 cursor-pointer ${stage.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {stage.name}
                </label>
                {stage.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleDispatch}
            disabled={!canDispatch || order.status === 'dispatched'}
            className="w-full"
            variant={canDispatch ? 'default' : 'secondary'}
          >
            <Truck className="h-4 w-4 mr-2" />
            {order.status === 'dispatched' ? 'Order Dispatched' : 
             canDispatch ? 'Dispatch Order' : 'Complete All Stages to Dispatch'}
          </Button>
          {!canDispatch && order.status !== 'dispatched' && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Complete all checklist items before dispatching the order
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};