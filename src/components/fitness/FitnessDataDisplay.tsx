
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFitnessData } from '@/hooks/useFitnessData';
import { 
  Activity, 
  Heart, 
  Moon, 
  Footprints, 
  Zap, 
  TrendingUp,
  Calendar,
  Share2,
  Loader2
} from 'lucide-react';

const FitnessDataDisplay: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const { fitnessData, loading, error, refetch } = useFitnessData();
  
  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity className="h-4 w-4" />;
      case 'heart_rate': return <Heart className="h-4 w-4" />;
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'steps': return <Footprints className="h-4 w-4" />;
      case 'recovery': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'strava': return '🏃';
      case 'garmin': return '⌚';
      case 'whoop': return '💚';
      case 'oura': return '💍';
      case 'fitbit': return '📱';
      default: return '📊';
    }
  };

  const formatMetricValue = (dataType: string, data: any) => {
    switch (dataType) {
      case 'activity':
        if (data.distance) {
          const km = (data.distance / 1000).toFixed(1);
          return `${data.name} - ${km}km`;
        }
        return data.name || 'Activity';
      
      case 'heart_rate':
        return `${data.average_heartrate || data.value || 'N/A'} bpm`;
      
      case 'sleep':
        if (data.duration) {
          const hours = Math.floor(data.duration / 3600);
          const minutes = Math.floor((data.duration % 3600) / 60);
          return `${hours}h ${minutes}m`;
        }
        return 'Sleep tracked';
      
      case 'steps':
        return `${data.steps || data.value || 0} steps`;
      
      case 'recovery':
        return `${data.recovery_score || data.value || 'N/A'}%`;
      
      default:
        return data.value || 'N/A';
    }
  };

  const getMetricsByType = (type: string) => {
    return fitnessData.filter(metric => metric.data_type === type);
  };

  const renderMetricCard = (metric: any) => (
    <Card key={metric.id} className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getMetricIcon(metric.data_type)}
            <span className="text-sm font-medium capitalize">{metric.data_type.replace('_', ' ')}</span>
            <span className="text-xs">{getDeviceIcon(metric.integration.device_type)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className="text-xs border-slate-600 text-slate-400"
            >
              {metric.integration.device_type}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-bold text-autheo-primary">
            {formatMetricValue(metric.data_type, metric.data)}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(metric.recorded_at).toLocaleDateString()} • {new Date(metric.recorded_at).toLocaleTimeString()}
          </p>
          {metric.data_type === 'activity' && metric.data.moving_time && (
            <p className="text-xs text-slate-500">
              Duration: {Math.floor(metric.data.moving_time / 60)} min
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-autheo-primary" />
        <span className="ml-2 text-slate-300">Loading fitness data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">Error loading fitness data: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

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

      {fitnessData.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Fitness Data Yet</h3>
            <p className="text-slate-400 mb-4">
              Connect your fitness devices to start tracking your health metrics.
            </p>
          </CardContent>
        </Card>
      ) : (
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
              {fitnessData.slice(0, 12).map(renderMetricCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getMetricsByType('activity').map(renderMetricCard)}
              {getMetricsByType('steps').map(renderMetricCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getMetricsByType('heart_rate').map(renderMetricCard)}
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
      )}

      {/* Provider Sharing Summary */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-autheo-primary" />
              <div>
                <h3 className="font-medium text-autheo-primary">Provider Access</h3>
                <p className="text-sm text-slate-300">
                  Your fitness data can be shared with healthcare providers when connected devices have sharing enabled.
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
