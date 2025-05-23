
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, Activity, FileText, PieChart } from 'lucide-react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

// Health metrics mock data
const mockHealthMetrics = [
  { name: 'Blood Pressure', value: '120/80 mmHg', change: '+2%', trend: 'up' },
  { name: 'Heart Rate', value: '72 bpm', change: '-3%', trend: 'down' },
  { name: 'Blood Glucose', value: '98 mg/dL', change: 'stable', trend: 'stable' },
  { name: 'Weight', value: '160 lbs', change: '-1%', trend: 'down' },
];

const ConsolidatedHealthOverview: React.FC = () => {
  const navigate = useNavigate();
  const { healthRecords, summary } = useHealthRecords();
  
  const handleViewMore = (section: string) => {
    if (section === 'records') {
      navigate('/my-health-records');
    } else if (section === 'metrics') {
      navigate('/wallet');
    } else if (section === 'tracker') {
      navigate('/health-tracker');
    }
  };
  
  // Get recent records from the healthRecords array
  const recentRecords = healthRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  return (
    <Card className="bg-slate-800 border-slate-700 shadow-xl text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
        <div className="space-y-6">
          {/* Records Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="col-span-2 bg-slate-700/30 border-slate-600/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-autheo-primary" /> 
                      Recent Health Records
                    </div>
                  </CardTitle>
                  <Button 
                    variant="link" 
                    onClick={() => handleViewMore('records')} 
                    className="h-8 p-0 text-xs text-autheo-primary"
                  >
                    View Detailed Records
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-xs pt-0">
                <div className="divide-y divide-slate-700/50">
                  {recentRecords.map((record, idx) => (
                    <div key={record.id} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{record.title}</p>
                        <p className="text-slate-400">{record.provider} • {record.date}</p>
                      </div>
                      <div>
                        <span className="px-1.5 py-0.5 rounded-sm text-xs bg-slate-700 text-slate-300">
                          {record.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <PieChart className="h-4 w-4 text-autheo-primary" /> 
                    Record Categories
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <div className="space-y-2">
                  {summary && summary.categories ? 
                    Object.entries(summary.categories).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-xs capitalize">{category}</span>
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-autheo-primary/10 text-autheo-primary">{count}</span>
                      </div>
                    )) : 
                    <div className="text-xs text-slate-400">No categories available</div>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Metrics */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <ChartBarIcon className="h-4 w-4 text-autheo-primary" /> Health Metrics
              </h3>
              <Button 
                variant="link" 
                onClick={() => handleViewMore('metrics')} 
                className="h-7 p-0 text-xs text-autheo-primary"
              >
                View All Metrics
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockHealthMetrics.map((metric, idx) => (
                <Card key={idx} className="bg-slate-700/30 border-slate-600/50">
                  <CardContent className="p-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">{metric.name}</span>
                      <span className="text-lg font-semibold text-white">{metric.value}</span>
                      <div className="mt-1 flex items-center">
                        <span 
                          className={`text-xs ${
                            metric.trend === 'up' ? 'text-green-400' : 
                            metric.trend === 'down' ? 'text-amber-400' : 
                            'text-slate-400'
                          }`}
                        >
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedHealthOverview;
