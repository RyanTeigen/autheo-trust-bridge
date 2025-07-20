import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface HealthDataPoint {
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  recommendation?: string;
  priority: 'low' | 'medium' | 'high';
}

interface HealthInsightsProps {
  healthData: HealthDataPoint[];
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ healthData }) => {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    generateInsights();
  }, [healthData]);

  const generateInsights = () => {
    const newInsights: Insight[] = [];

    // Analyze trends in health data
    const groupedData = healthData.reduce((acc, point) => {
      if (!acc[point.type]) acc[point.type] = [];
      acc[point.type].push(point);
      return acc;
    }, {} as Record<string, HealthDataPoint[]>);

    // Blood Pressure Analysis
    if (groupedData.blood_pressure && groupedData.blood_pressure.length > 1) {
      const bpData = groupedData.blood_pressure.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const latest = bpData[bpData.length - 1];
      const previous = bpData[bpData.length - 2];
      
      const [latestSystolic] = latest.value.toString().split('/').map(Number);
      const [previousSystolic] = previous.value.toString().split('/').map(Number);
      
      if (latestSystolic > 140) {
        newInsights.push({
          id: 'bp_high',
          type: 'alert',
          title: 'High Blood Pressure Detected',
          description: `Your latest systolic reading of ${latestSystolic} mmHg is above normal range (120-140 mmHg).`,
          recommendation: 'Consider consulting with your healthcare provider and monitoring your sodium intake.',
          priority: 'high'
        });
      } else if (latestSystolic < previousSystolic) {
        newInsights.push({
          id: 'bp_improving',
          type: 'success',
          title: 'Blood Pressure Improvement',
          description: `Your blood pressure has decreased from ${previousSystolic} to ${latestSystolic} mmHg.`,
          recommendation: 'Keep up the good work! Continue your current lifestyle habits.',
          priority: 'low'
        });
      }
    }

    // Weight Analysis
    if (groupedData.weight && groupedData.weight.length > 2) {
      const weightData = groupedData.weight.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const recent = weightData.slice(-3);
      
      const trend = recent.every((point, index) => 
        index === 0 || point.value < recent[index - 1].value
      );
      
      if (trend) {
        newInsights.push({
          id: 'weight_trend',
          type: 'success',
          title: 'Consistent Weight Loss',
          description: 'You\'ve shown a consistent downward trend in weight over your last 3 measurements.',
          recommendation: 'Excellent progress! Maintain your current diet and exercise routine.',
          priority: 'low'
        });
      }
    }

    // Heart Rate Analysis
    if (groupedData.heart_rate) {
      const hrData = groupedData.heart_rate;
      const avgHeartRate = hrData.reduce((sum, point) => sum + point.value, 0) / hrData.length;
      
      if (avgHeartRate > 100) {
        newInsights.push({
          id: 'hr_high',
          type: 'warning',
          title: 'Elevated Heart Rate',
          description: `Your average resting heart rate of ${avgHeartRate.toFixed(1)} bpm is above normal range (60-100 bpm).`,
          recommendation: 'Consider stress management techniques and regular cardiovascular exercise.',
          priority: 'medium'
        });
      } else if (avgHeartRate >= 60 && avgHeartRate <= 100) {
        newInsights.push({
          id: 'hr_normal',
          type: 'success',
          title: 'Healthy Heart Rate',
          description: `Your average resting heart rate of ${avgHeartRate.toFixed(1)} bpm is within normal range.`,
          priority: 'low'
        });
      }
    }

    // Data Consistency Insights
    const dataFrequency = Object.keys(groupedData).length;
    if (dataFrequency >= 3) {
      newInsights.push({
        id: 'data_consistency',
        type: 'success',
        title: 'Great Data Tracking',
        description: `You're tracking ${dataFrequency} different health metrics consistently.`,
        recommendation: 'Consistent tracking helps identify patterns and improve health outcomes.',
        priority: 'low'
      });
    } else {
      newInsights.push({
        id: 'data_encourage',
        type: 'info',
        title: 'Track More Metrics',
        description: 'Consider tracking additional vital signs for better health insights.',
        recommendation: 'Add blood pressure, weight, or temperature tracking to get more comprehensive insights.',
        priority: 'medium'
      });
    }

    // Recent Activity Insight
    const recentData = healthData.filter(point => {
      const pointDate = new Date(point.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return pointDate >= weekAgo;
    });

    if (recentData.length === 0) {
      newInsights.push({
        id: 'no_recent_data',
        type: 'warning',
        title: 'No Recent Health Data',
        description: 'You haven\'t recorded any health data in the past week.',
        recommendation: 'Regular monitoring helps track your health progress and identify potential issues early.',
        priority: 'medium'
      });
    }

    setInsights(newInsights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'alert':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-950';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Record some health data to get personalized insights!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Alert key={insight.id} className={getPriorityColor(insight.priority)}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getInsightVariant(insight.type)} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <AlertDescription className="mb-2">
                      {insight.description}
                    </AlertDescription>
                    {insight.recommendation && (
                      <div className="text-sm font-medium text-primary">
                        💡 {insight.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your health data, we've identified {insights.length} insights to help you understand your health trends and make informed decisions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthInsights;