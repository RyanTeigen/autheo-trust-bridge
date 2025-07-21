import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Scale, Thermometer, Activity, Zap, Target, TrendingUp } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface HealthTrackerQuickActionsProps {
  onQuickEntry: (type: string) => void;
  onViewGoals: () => void;
  onViewInsights: () => void;
  onExportData: () => void;
  onManualEntry?: () => void;
}

const HealthTrackerQuickActions: React.FC<HealthTrackerQuickActionsProps> = ({
  onQuickEntry,
  onViewGoals,
  onViewInsights,
  onExportData,
  onManualEntry
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'blood_pressure',
      title: 'Blood Pressure',
      description: 'Record BP reading',
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-500',
      action: () => onQuickEntry('blood_pressure')
    },
    {
      id: 'weight',
      title: 'Weight',
      description: 'Log your weight',
      icon: <Scale className="h-5 w-5" />,
      color: 'text-blue-500',
      action: () => onQuickEntry('weight')
    },
    {
      id: 'temperature',
      title: 'Temperature',
      description: 'Record body temp',
      icon: <Thermometer className="h-5 w-5" />,
      color: 'text-orange-500',
      action: () => onQuickEntry('temperature')
    },
    {
      id: 'heart_rate',
      title: 'Heart Rate',
      description: 'Log pulse rate',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-green-500',
      action: () => onQuickEntry('heart_rate')
    },
    {
      id: 'goals',
      title: 'Health Goals',
      description: 'View progress',
      icon: <Target className="h-5 w-5" />,
      color: 'text-purple-500',
      action: onViewGoals
    },
    {
      id: 'insights',
      title: 'AI Insights',
      description: 'Health analysis',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-indigo-500',
      action: onViewInsights
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={action.action}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors"
            >
              <div className={action.color}>
                {action.icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-xs">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Additional Quick Actions Row */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onExportData}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Export Data
            </Button>
            <Button
              onClick={onManualEntry || (() => {
                // Fallback: Scroll to entry form
                const entryForm = document.getElementById('vital-signs-entry');
                if (entryForm) {
                  entryForm.scrollIntoView({ behavior: 'smooth' });
                }
              })}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Manual Entry
            </Button>
            <Button
              onClick={() => {
                // Future: Connect fitness device
                alert('Fitness device integration coming soon!');
              }}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Connect Device
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTrackerQuickActions;