
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HealthMetricsCharts from '@/components/records/HealthMetricsCharts';
import FitnessDeviceIntegration from '@/components/fitness/FitnessDeviceIntegration';
import FitnessDataDisplay from '@/components/fitness/FitnessDataDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Scale, Heart, Clock, Utensils, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const HealthTrackerPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddData = (dataType: string) => {
    toast({
      title: "Coming soon",
      description: `The ability to add ${dataType} data will be available soon.`,
    });
  };
  
  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Health Tracker</h1>
          <p className="text-muted-foreground">
            Monitor your health metrics and track your progress over time
          </p>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="bg-transparent border-slate-700"
          >
            Back to Dashboard
          </Button>
          <Button onClick={() => handleAddData("health")} className="bg-autheo-primary hover:bg-autheo-primary/90">
            Add New Data
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-sm text-autheo-primary">Connected to Health Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-sm text-slate-300">
            Your tracker data is integrated with your health overview dashboard. 
            All metrics you track here will be reflected in your health overview.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Fitness Devices
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Vitals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-4 mt-4">
          <HealthMetricsCharts />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-autheo-primary" />
                  Weight Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Log your weight measurements to track changes over time.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddData("weight")}
                >
                  Add Weight Entry
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-autheo-primary" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Record your physical activities and exercises.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddData("activity")}
                >
                  Log Activity
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-autheo-primary" />
                  Heart Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Monitor your heart rate and cardiovascular health.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddData("heart rate")}
                >
                  Add Heart Rate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <div className="space-y-6">
            <FitnessDeviceIntegration />
            <FitnessDataDisplay />
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">Connect your fitness devices to automatically sync your activity data, or manually log your exercises and workouts.</p>
              <Button onClick={() => handleAddData("activity data")}>Add Manual Entry</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nutrition" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">This feature is coming soon. You'll be able to log your meals, track calories, and analyze your nutrition.</p>
              <Button onClick={() => handleAddData("nutrition data")}>Notify When Available</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vitals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vitals Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">This feature is coming soon. You'll be able to track blood pressure, temperature, oxygen levels, and other vital signs.</p>
              <Button onClick={() => handleAddData("vitals")}>Notify When Available</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthTrackerPage;
