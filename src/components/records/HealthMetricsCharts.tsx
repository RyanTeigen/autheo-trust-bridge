
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Scale, Ruler, ChartBar, Share } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import HealthDataChart, { HealthDataPoint } from '@/components/emr/HealthDataChart';

interface HealthMetricsChartsProps {
  onShare?: () => void;
}

const HealthMetricsCharts: React.FC<HealthMetricsChartsProps> = ({ onShare }) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>('1m');
  
  // Mock data for the charts
  const weightData: HealthDataPoint[] = [
    { date: '2025-04-01', value: 73.5 },
    { date: '2025-03-15', value: 74.2 },
    { date: '2025-03-01', value: 75.0 },
    { date: '2025-02-15', value: 75.8 },
    { date: '2025-02-01', value: 76.3 },
    { date: '2025-01-15', value: 77.1 },
  ];
  
  const heightData: HealthDataPoint[] = [
    { date: '2025-04-01', value: 171.5 },
    { date: '2024-10-01', value: 171.5 },
    { date: '2024-04-01', value: 171.0 },
    { date: '2023-10-01', value: 171.0 },
  ];
  
  // Calculate BMI data based on height and weight data
  const bmiData: HealthDataPoint[] = weightData.map(weightPoint => {
    // Find the closest height measurement
    const closestHeight = heightData.reduce((prev, curr) => {
      return (new Date(curr.date).getTime() <= new Date(weightPoint.date).getTime() && 
              new Date(curr.date).getTime() > new Date(prev.date).getTime()) 
              ? curr : prev;
    }, heightData[heightData.length - 1]);
    
    // Calculate BMI: weight(kg) / (height(m))²
    const heightInMeters = closestHeight.value / 100;
    const bmi = weightPoint.value / (heightInMeters * heightInMeters);
    
    return {
      date: weightPoint.date,
      value: parseFloat(bmi.toFixed(1))
    };
  });
  
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast({
        title: "Health metrics shared",
        description: "Your health metrics have been shared with your healthcare provider."
      });
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Track your health metrics over time</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            Share Metrics
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="weight" className="flex items-center gap-1">
              <Scale className="h-4 w-4" /> Weight
            </TabsTrigger>
            <TabsTrigger value="height" className="flex items-center gap-1">
              <Ruler className="h-4 w-4" /> Height
            </TabsTrigger>
            <TabsTrigger value="bmi" className="flex items-center gap-1">
              <ChartBar className="h-4 w-4" /> BMI
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight">
            <HealthDataChart
              title="Weight History"
              description="Your weight measurements over time"
              data={weightData}
              unit="kg"
              color="#9b87f5"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </TabsContent>
          
          <TabsContent value="height">
            <HealthDataChart
              title="Height History"
              description="Your height measurements over time"
              data={heightData}
              unit="cm"
              color="#0EA5E9"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </TabsContent>
          
          <TabsContent value="bmi">
            <HealthDataChart
              title="BMI History"
              description="Your Body Mass Index over time"
              data={bmiData}
              color="#F97316"
              minValue={16}
              maxValue={32}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            <div className="mt-4 text-sm grid grid-cols-4 gap-2">
              <div className="p-2 rounded bg-blue-100 text-blue-800">
                <p className="font-medium">Underweight</p>
                <p className="text-xs">BMI &lt; 18.5</p>
              </div>
              <div className="p-2 rounded bg-green-100 text-green-800">
                <p className="font-medium">Normal</p>
                <p className="text-xs">BMI 18.5 - 24.9</p>
              </div>
              <div className="p-2 rounded bg-amber-100 text-amber-800">
                <p className="font-medium">Overweight</p>
                <p className="text-xs">BMI 25 - 29.9</p>
              </div>
              <div className="p-2 rounded bg-red-100 text-red-800">
                <p className="font-medium">Obese</p>
                <p className="text-xs">BMI &gt; 30</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsCharts;
