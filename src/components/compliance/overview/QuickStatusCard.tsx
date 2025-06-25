
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickStatusCardProps {
  recentErrors: number;
  riskLevel: 'low' | 'medium' | 'high';
  loading: boolean;
}

const QuickStatusCard: React.FC<QuickStatusCardProps> = ({ 
  recentErrors, 
  riskLevel, 
  loading 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-autheo-primary">Quick Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Active Alerts</span>
          <Badge variant="destructive">
            {loading ? '...' : recentErrors}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Risk Level</span>
          <Badge 
            variant="outline" 
            className={`${riskLevel === 'low' ? 'bg-green-100 text-green-800' : riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}
          >
            {loading ? '...' : riskLevel}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Next Audit</span>
          <span className="text-sm text-slate-400">Q3 2025</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStatusCard;
