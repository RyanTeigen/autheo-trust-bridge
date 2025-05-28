
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Heart, 
  Moon, 
  Footprints, 
  Zap, 
  TrendingUp,
  Calendar,
  Share2
} from 'lucide-react';

interface FitnessMetric {
  id: string;
  type: 'steps' | 'heartRate' | 'sleep' | 'workout' | 'recovery';
  value: string | number;
  unit?: string;
  date: string;
  source: string;
  trend?: 'up' | 'down' | 'stable';
  isShared: boolean;
}

const FitnessDataDisplay: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  
  // Mock fitness data
  const [fitnessData] = useState<FitnessMetric[]>([
    {
      id: '1',
      type: 'steps',
      value: 8742,
      unit: 'steps',
      date: '2025-05-28',
      source: 'Garmin Connect',
      trend: 'up',
      isShared: true
    },
    {
      id: '2',
      type: 'heartRate',
      value: 68,
      unit: 'bpm',
      date: '2025-05-28',
      source: 'WHOOP',
      trend: 'stable',
      isShared: true
    },
    {
      id: '3',
      type: 'sleep',
      value: '7h 23m',
      date: '2025-05-27',
      source: 'Oura Ring',
      trend: 'up',
      isShared: false
    },
    {
      id: '4',
      type: 'workout',
      value: 'Morning Run - 5.2km',
      date: '2025-05-28',
      source: 'Strava',
      trend: 'up',
      isShared: true
    },
    {
      id: '5',
      type: 'recovery',
      value: 85,
      unit: '%',
      date: '2025-05-28',
      source: 'WHOOP',
      trend: 'up',
      isShared: false
    }
  ]);

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'steps': return <Footprints className="h-4 w-4" />;
      case 'heartRate': return <Heart className="h-4 w-4" />;
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'workout': return <Activity className="h-4 w-4" />;
      case 'recovery': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    return <TrendingUp className={`h-3 w-3 ${
      trend === 'up' ? 'text-green-400' : 
      trend === 'down' ? 'text-red-400 rotate-180' : 
      'text-slate-400'
    }`} />;
  };

  const getMetricsByType = (type: string) => {
    return fitnessData.filter(metric => metric.type === type);
  };

  const renderMetricCard = (metric: FitnessMetric) => (
    <Card key={metric.id} className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getMetricIcon(metric.type)}
            <span className="text-sm font-medium capitalize">{metric.type}</span>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(metric.trend)}
            <Badge 
              variant={metric.isShared ? "default" : "outline"}
              className={`text-xs ${metric.isShared ? 'bg-autheo-primary/20 text-autheo-primary' : 'border-slate-600 text-slate-400'}`}
            >
              {metric.isShared ? 'Shared' : 'Private'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-bold text-autheo-primary">
            {metric.value}{metric.unit && ` ${metric.unit}`}
          </p>
          <p className="text-xs text-slate-400">
            From {metric.source} • {new Date(metric.date).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-autheo-primary">Fitness Data</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select 
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fitnessData.map(renderMetricCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMetricsByType('steps').map(renderMetricCard)}
            {getMetricsByType('workout').map(renderMetricCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMetricsByType('heartRate').map(renderMetricCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="sleep" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMetricsByType('sleep').map(renderMetricCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="recovery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMetricsByType('recovery').map(renderMetricCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Provider Sharing Summary */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-autheo-primary" />
              <div>
                <h3 className="font-medium text-autheo-primary">Provider Access</h3>
                <p className="text-sm text-slate-300">
                  {fitnessData.filter(d => d.isShared).length} of {fitnessData.length} metrics shared with healthcare providers
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-autheo-primary/30 text-autheo-primary">
              Manage Sharing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDataDisplay;
