
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
  
  // Mock data for the charts - now with more consistent intervals
  const weightData: HealthDataPoint[] = [
    { date: '2025-04-25', value: 73.5 },
    { date: '2025-04-15', value: 74.0 },
    { date: '2025-04-05', value: 74.2 },
    { date: '2025-03-25', value: 74.8 },
    { date: '2025-03-15', value: 75.0 },
    { date: '2025-03-05', value: 75.4 },
    { date: '2025-02-25', value: 75.8 },
    { date: '2025-02-15', value: 76.1 },
    { date: '2025-02-05', value: 76.3 },
    { date: '2025-01-25', value: 76.8 },
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
  
  // Define consistent chart colors
  const chartColors = {
    weight: "#5EEBC4", // Autheo primary
    height: "#4A6BF5", // Autheo secondary  
    bmi: "#7880FF",    // Autheo accent
  };
  
  return (
    <div className="w-full">
      <Card className="mb-6 bg-slate-800 border-slate-700 text-slate-100 w-full">
        <CardHeader className="bg-slate-800/50 border-b border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-autheo-primary">Health Metrics</CardTitle>
              <CardDescription className="text-slate-300">Track your health metrics over time</CardDescription>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 bg-slate-700/30 hover:bg-slate-700/50 text-autheo-primary border-slate-600"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
                Share Metrics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 w-full">
          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-slate-700/30 w-full">
              <TabsTrigger value="weight" className="flex items-center gap-1 text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-autheo-primary">
                <Scale className="h-4 w-4" /> Weight
              </TabsTrigger>
              <TabsTrigger value="height" className="flex items-center gap-1 text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-autheo-primary">
                <Ruler className="h-4 w-4" /> Height
              </TabsTrigger>
              <TabsTrigger value="bmi" className="flex items-center gap-1 text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-autheo-primary">
                <ChartBar className="h-4 w-4" /> BMI
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weight" className="animate-fade-in w-full">
              <div className="w-full">
                <HealthDataChart
                  title="Weight History"
                  description="Your weight measurements over time"
                  data={weightData}
                  unit="kg"
                  color={chartColors.weight}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  minValue={72}
                  maxValue={78}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="height" className="animate-fade-in w-full">
              <div className="w-full">
                <HealthDataChart
                  title="Height History"
                  description="Your height measurements over time"
                  data={heightData}
                  unit="cm"
                  color={chartColors.height}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  minValue={170}
                  maxValue={172}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="bmi" className="animate-fade-in w-full">
              <div className="w-full space-y-4">
                <HealthDataChart
                  title="BMI History"
                  description="Your Body Mass Index over time"
                  data={bmiData}
                  color={chartColors.bmi}
                  minValue={24}
                  maxValue={27}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                  <div className="p-2.5 rounded bg-slate-700/30 border border-slate-600 flex flex-col justify-center items-center">
                    <div className="w-3 h-3 rounded-full mb-1 bg-blue-400"></div>
                    <p className="font-medium text-blue-300 text-sm">Underweight</p>
                    <p className="text-xs text-slate-300">BMI &lt; 18.5</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-700/30 border border-slate-600 flex flex-col justify-center items-center">
                    <div className="w-3 h-3 rounded-full mb-1 bg-autheo-primary"></div>
                    <p className="font-medium text-autheo-primary text-sm">Normal</p>
                    <p className="text-xs text-slate-300">BMI 18.5 - 24.9</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-700/30 border border-slate-600 flex flex-col justify-center items-center">
                    <div className="w-3 h-3 rounded-full mb-1 bg-amber-400"></div>
                    <p className="font-medium text-amber-300 text-sm">Overweight</p>
                    <p className="text-xs text-slate-300">BMI 25 - 29.9</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-700/30 border border-slate-600 flex flex-col justify-center items-center">
                    <div className="w-3 h-3 rounded-full mb-1 bg-red-500"></div>
                    <p className="font-medium text-red-400 text-sm">Obese</p>
                    <p className="text-xs text-slate-300">BMI &gt; 30</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMetricsCharts;
