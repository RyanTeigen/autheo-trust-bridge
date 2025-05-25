
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye,
  Users,
  Shield
} from 'lucide-react';

interface ComplianceActionsCardProps {
  onGenerateReport: () => void;
  onStartAudit: () => void;
}

const ComplianceActionsCard: React.FC<ComplianceActionsCardProps> = ({ 
  onGenerateReport, 
  onStartAudit 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compliance Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onGenerateReport}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
        
        <Button 
          onClick={onStartAudit}
          className="w-full justify-start"
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-2" />
          Start New Audit
        </Button>
        
        <Button 
          className="w-full justify-start"
          variant="outline"
        >
          <Users className="h-4 w-4 mr-2" />
          Schedule Training Session
        </Button>
        
        <Button 
          className="w-full justify-start"
          variant="outline"
        >
          <Shield className="h-4 w-4 mr-2" />
          Review Security Policies
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComplianceActionsCard;
