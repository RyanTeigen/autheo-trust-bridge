
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar, Sparkles } from 'lucide-react';
import ComplianceAlerts from './ComplianceAlerts';

interface MobileComplianceViewProps {
  complianceScore: number;
}

const MobileComplianceView: React.FC<MobileComplianceViewProps> = ({ complianceScore }) => {
  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-autheo-primary">Compliance Score</CardTitle>
            <Badge 
              variant="outline" 
              className={`${complianceScore >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
            >
              {complianceScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-slate-300">Privacy: 100%</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 bg-amber-500 rounded-full mr-1"></div>
                <span className="text-slate-300">Admin: 83%</span>
              </div>
            </div>
            
            <Alert className="py-2 text-sm bg-amber-900/20 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <AlertDescription className="text-amber-200">2 items need attention</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      
      <ComplianceAlerts />
      
      <div className="space-y-2">
        <Button 
          className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900" 
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Compliance Review
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700" 
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
      </div>
    </div>
  );
};

export default MobileComplianceView;
