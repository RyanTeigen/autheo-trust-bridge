
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react';

interface ComplianceActionsCardProps {
  complianceScore: number;
}

const ComplianceActionsCard: React.FC<ComplianceActionsCardProps> = ({ complianceScore }) => {
  return (
    <Card className="lg:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-autheo-primary">Compliance Actions</CardTitle>
          <Badge 
            variant="outline" 
            className={`${complianceScore >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
          >
            {complianceScore}% Compliant
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-100">Update risk assessment</p>
                <p className="text-sm text-slate-400">Annual security risk assessment needs update</p>
              </div>
            </div>
            <Button 
              size="sm"
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              Start
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-100">Security awareness training</p>
                <p className="text-sm text-slate-400">12 staff members need to complete training</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
            >
              Send Reminder
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-autheo-secondary mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-100">Quarterly Technical Audit</p>
                <p className="text-sm text-slate-400">Scheduled for June 15, 2025</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
            >
              View Details
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-100">BAA agreements</p>
                <p className="text-sm text-slate-400">All business associate agreements are current</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
            >
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceActionsCard;
