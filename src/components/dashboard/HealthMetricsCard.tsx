
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import KeyMetrics from './KeyMetrics';
import MetricsCardGrid from './MetricsCardGrid';
import { HealthMetrics } from '@/contexts/HealthRecordsContext';

interface HealthMetricsCardProps {
  metrics: HealthMetrics[];
  healthRecords: any;
  complianceScore: number;
}

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ metrics, healthRecords, complianceScore }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleViewMore = () => {
    toast({
      title: "View More: Health Metrics",
      description: "Navigating to full health metrics view."
    });
    navigate('/wallet');
  };
  
  return (
    <Card className="md:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Health Metrics</CardTitle>
        <CardDescription className="text-slate-300">Your recent health measurements</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <KeyMetrics 
          healthRecords={healthRecords} 
          complianceScore={complianceScore} 
        />
        
        <MetricsCardGrid metrics={metrics} />
        
        <div className="mt-3 flex justify-end">
          <Button 
            variant="link" 
            className="text-autheo-primary hover:text-autheo-primary/80 p-0"
            onClick={handleViewMore}
          >
            View all metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsCard;
