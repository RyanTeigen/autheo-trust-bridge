
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';

interface ComplianceScoreCardProps {
  score: number;
  loading: boolean;
  onRunAudit: () => void;
}

const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({ 
  score, 
  loading, 
  onRunAudit 
}) => {
  return (
    <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-autheo-primary flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${score >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
          >
            {score}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ComplianceProgressIndicator score={score} />
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">
              Last assessment: {new Date().toLocaleDateString()}
              {loading && <span className="ml-2 text-autheo-primary">Updating...</span>}
            </span>
            <Button 
              onClick={onRunAudit} 
              size="sm" 
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              Run New Audit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceScoreCard;
