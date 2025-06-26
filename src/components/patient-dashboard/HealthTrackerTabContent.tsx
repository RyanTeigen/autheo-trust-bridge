import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HealthMetricsCharts from '@/components/records/HealthMetricsCharts';
import FitnessDeviceIntegration from '@/components/fitness/FitnessDeviceIntegration';
import FitnessDataDisplay from '@/components/fitness/FitnessDataDisplay';
import VitalsMetrics from '@/components/patient/vital-signs/VitalsMetrics';
import VitalSignsInputDialog from '@/components/vitals/VitalSignsInputDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Scale, Heart, Clock, Utensils, Smartphone, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const HealthTrackerTabContent: React.FC = () => {
  const { toast } = useToast();

  const handleAddData = (dataType: string) => {
    toast({
      title: "Coming soon",
      description: `The ability to add ${dataType} data will be available soon.`,
    });
  };

  const handleVitalsSuccess = () => {
    // This will trigger a refresh of the vitals data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-sm text-autheo-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Connected to Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-sm text-slate-300">
            Your tracker data is integrated with your health overview dashboard. 
            All metrics you track here are the same data shown in your overview tab.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="vitals" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Vital Signs
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Metrics
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
        </TabsList>
        
        <TabsContent value="vitals" className="space-y-4 mt-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-slate-200 mb-2">Your Vital Signs Trends</h3>
            <p className="text-sm text-slate-400">
              These are the same vital signs displayed in your health overview, with detailed trend analysis and clinical context.
            </p>
          </div>
          
          <VitalsMetrics />
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-autheo-primary">Record New Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <VitalSignsInputDialog 
                  defaultTab="blood-pressure"
                  onSuccess={handleVitalsSuccess}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Activity className="h-6 w-6 text-blue-400" />
                    <div className="text-center">
                      <div className="font-medium">Blood Pressure</div>
                      <div className="text-xs text-slate-400">Record BP reading</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>

                <VitalSignsInputDialog 
                  defaultTab="heart-rate"
                  onSuccess={handleVitalsSuccess}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Heart className="h-6 w-6 text-red-400" />
                    <div className="text-center">
                      <div className="font-medium">Heart Rate</div>
                      <div className="text-xs text-slate-400">Record pulse rate</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>

                <VitalSignsInputDialog 
                  defaultTab="temperature"
                  onSuccess={handleVitalsSuccess}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Activity className="h-6 w-6 text-orange-400" />
                    <div className="text-center">
                      <div className="font-medium">Temperature</div>
                      <div className="text-xs text-slate-400">Record body temp</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>

                <VitalSignsInputDialog 
                  defaultTab="respiratory"
                  onSuccess={handleVitalsSuccess}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Activity className="h-6 w-6 text-teal-400" />
                    <div className="text-center">
                      <div className="font-medium">Respiratory Rate</div>
                      <div className="text-xs text-slate-400">Record breathing rate</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>

                <VitalSignsInputDialog 
                  defaultTab="oxygen"
                  onSuccess={handleVitalsSuccess}
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Activity className="h-6 w-6 text-blue-400" />
                    <div className="text-center">
                      <div className="font-medium">Oxygen Saturation</div>
                      <div className="text-xs text-slate-400">Record O2 levels</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>

                <VitalSignsInputDialog onSuccess={handleVitalsSuccess}>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-700 hover:bg-slate-700/50 h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Plus className="h-6 w-6 text-autheo-primary" />
                    <div className="text-center">
                      <div className="font-medium">All Vitals</div>
                      <div className="text-xs text-slate-400">Record multiple</div>
                    </div>
                  </Button>
                </VitalSignsInputDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
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
      </Tabs>
    </div>
  );
};

export default HealthTrackerTabContent;
