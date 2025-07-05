
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
      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary">Compliance Score</CardTitle>
            <Badge 
              variant="outline" 
              className={`${complianceScore >= 90 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-destructive/20 text-destructive border-destructive/30'}`}
            >
              {complianceScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-primary rounded-full mr-1"></div>
                <span className="text-muted-foreground">Privacy: 100%</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 bg-secondary rounded-full mr-1"></div>
                <span className="text-muted-foreground">Admin: 83%</span>
              </div>
            </div>
            
            <Alert className="py-2 text-sm bg-destructive/10 border-destructive/30">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <AlertDescription className="text-destructive-foreground">2 items need attention</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
      
      <ComplianceAlerts />
      
      <div className="space-y-2">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
          size="sm"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Compliance Review
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full bg-card border-border text-card-foreground hover:bg-muted" 
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
