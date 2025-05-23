
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBar, 
  Heart, 
  Activity, 
  Pill, 
  FileText, 
  ArrowRight,
  Calendar,
  ShieldAlert 
} from 'lucide-react';
import { HealthMetrics } from '@/contexts/HealthRecordsContext';

interface ConsolidatedHealthOverviewProps {
  healthMetrics: HealthMetrics[];
  healthRecords: any;
  complianceScore: number;
}

const ConsolidatedHealthOverview: React.FC<ConsolidatedHealthOverviewProps> = ({
  healthMetrics,
  healthRecords,
  complianceScore
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  
  const handleViewMore = (section: string) => {
    if (section === 'records') {
      navigate('/my-health-records');
    } else if (section === 'metrics') {
      navigate('/wallet');
    } else if (section === 'tracker') {
      navigate('/health-tracker');
    }
  };
  
  // Format the metrics for more readable display with defined ranges
  const formattedMetrics = healthMetrics?.slice(0, 3).map(metric => {
    // Define normal ranges based on common health metrics
    let highRange: number, lowRange: number;
    
    switch(metric.name.toLowerCase()) {
      case 'blood pressure':
        highRange = 140; // systolic
        lowRange = 90;
        break;
      case 'heart rate':
        highRange = 100; // bpm
        lowRange = 60;
        break;
      case 'glucose level':
        highRange = 140; // mg/dL
        lowRange = 70;
        break;
      case 'cholesterol':
        highRange = 200; // mg/dL
        lowRange = 100;
        break;
      case 'bmi':
        highRange = 25;
        lowRange = 18.5;
        break;
      default:
        highRange = parseFloat(metric.value) * 1.2;
        lowRange = parseFloat(metric.value) * 0.8;
    }
    
    const metricValue = parseFloat(metric.value);
    const status = 
      metricValue > highRange ? 'high' :
      metricValue < lowRange ? 'low' : 'normal';
      
    return {
      ...metric,
      id: metric.id || `metric-${metric.name}-${metric.date}`.toLowerCase().replace(/\s+/g, '-'),
      highRange,
      lowRange,
      status,
      statusColor: 
        status === 'high' ? 'text-red-400' :
        status === 'low' ? 'text-amber-400' : 'text-green-400'
    };
  });
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-autheo-primary">Health Overview</CardTitle>
            <CardDescription className="text-slate-300">
              Your comprehensive health information in one place
            </CardDescription>
          </div>
          <Button 
            variant="outline"
            onClick={() => handleViewMore('tracker')}
            className="gap-1.5 border-autheo-primary/30 bg-slate-800 text-autheo-primary hover:bg-slate-700"
          >
            <Activity className="h-4 w-4" />
            Health Tracker
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-slate-700 dark:bg-slate-700">
            <TabsTrigger value="summary" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              <ChartBar className="h-4 w-4 mr-1" /> Summary
            </TabsTrigger>
            <TabsTrigger value="vitals" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              <Activity className="h-4 w-4 mr-1" /> Vitals
            </TabsTrigger>
            <TabsTrigger value="medications" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              <Pill className="h-4 w-4 mr-1" /> Medications
            </TabsTrigger>
            <TabsTrigger value="conditions" className="data-[state=active]:bg-slate-900 data-[state=active]:text-autheo-primary">
              <Heart className="h-4 w-4 mr-1" /> Conditions
            </TabsTrigger>
          </TabsList>
          
          {/* Summary Tab */}
          <TabsContent value="summary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-slate-400 mb-1">Health Score</span>
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-2xl font-bold text-autheo-primary">{complianceScore}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full h-6 w-6 flex items-center justify-center border-2 border-slate-800">
                        <ArrowRight className="h-3 w-3 text-slate-900" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 mt-2">Excellent</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-slate-400 mb-1">Records</span>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-autheo-primary mr-1" />
                      <span className="text-2xl font-bold text-autheo-primary">{healthRecords.total || 0}</span>
                    </div>
                    <span className="text-xs text-slate-300 mt-2">Last updated 2d ago</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-slate-400 mb-1">Shared</span>
                    <div className="flex items-center">
                      <ShieldAlert className="h-5 w-5 text-autheo-primary mr-1" />
                      <span className="text-2xl font-bold text-autheo-primary">{healthRecords.shared || 0}</span>
                    </div>
                    <span className="text-xs text-slate-300 mt-2">With providers</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-slate-400 mb-1">Next Checkup</span>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-autheo-primary mr-1" />
                      <span className="text-2xl font-bold text-autheo-primary">7d</span>
                    </div>
                    <span className="text-xs text-slate-300 mt-2">May 25, 2025</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              variant="link" 
              className="text-autheo-primary hover:text-autheo-primary/80 p-0 mt-3 float-right"
              onClick={() => handleViewMore('records')}
            >
              View detailed health records <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </TabsContent>
          
          {/* Vitals Tab */}
          <TabsContent value="vitals">
            <div className="space-y-3">
              {formattedMetrics?.map((metric) => (
                <Card key={metric.name} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700/50 p-2 rounded-full">
                          <Activity className="h-4 w-4 text-autheo-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{metric.name}</p>
                          <p className="text-sm text-slate-400">{metric.date}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-autheo-primary">
                          {metric.value} {metric.unit}
                        </p>
                        <p className={`text-xs ${metric.statusColor}`}>
                          {metric.status === 'normal' ? 'Normal' : 
                           metric.status === 'high' ? 'Above normal' : 'Below normal'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0 float-right"
                onClick={() => handleViewMore('metrics')}
              >
                View all metrics <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <div className="space-y-3">
              {[
                {
                  id: '1',
                  name: 'Lisinopril',
                  dosage: '10mg',
                  frequency: 'Once daily',
                  nextRefill: '7 days'
                },
                {
                  id: '2',
                  name: 'Metformin',
                  dosage: '500mg',
                  frequency: 'Twice daily',
                  nextRefill: '14 days'
                }
              ].map(medication => (
                <Card key={medication.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700/50 p-2 rounded-full">
                          <Pill className="h-4 w-4 text-autheo-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{medication.name} {medication.dosage}</p>
                          <p className="text-sm text-slate-400">{medication.frequency}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className="bg-autheo-primary/10 text-autheo-primary border-autheo-primary/20">
                          Refill in {medication.nextRefill}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0 float-right"
                onClick={() => handleViewMore('records')}
              >
                View all medications <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
          
          {/* Conditions Tab */}
          <TabsContent value="conditions">
            <div className="space-y-3">
              {[
                {
                  id: '1',
                  name: 'Hypertension',
                  status: 'Controlled',
                  diagnosedDate: 'Jan 15, 2024',
                  statusColor: 'text-green-400'
                },
                {
                  id: '2',
                  name: 'Type 2 Diabetes',
                  status: 'Monitoring',
                  diagnosedDate: 'Mar 22, 2023',
                  statusColor: 'text-amber-400'
                }
              ].map(condition => (
                <Card key={condition.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700/50 p-2 rounded-full">
                          <Heart className="h-4 w-4 text-autheo-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{condition.name}</p>
                          <p className="text-sm text-slate-400">Diagnosed: {condition.diagnosedDate}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${condition.statusColor}`}>
                          {condition.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0 float-right"
                onClick={() => handleViewMore('records')}
              >
                View all conditions <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedHealthOverview;
