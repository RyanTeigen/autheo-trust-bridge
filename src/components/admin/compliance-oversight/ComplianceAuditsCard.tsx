
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock } from 'lucide-react';

interface RecentAudit {
  id: string;
  type: string;
  date: string;
  status: string;
  score: number | null;
  findings: number | null;
}

interface ComplianceAuditsCardProps {
  recentAudits: RecentAudit[];
}

const ComplianceAuditsCard: React.FC<ComplianceAuditsCardProps> = ({ recentAudits }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Audits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAudits.map((audit) => (
            <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{audit.type}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {audit.date}
                </p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(audit.status)}>
                  {audit.status}
                </Badge>
                {audit.score && (
                  <p className="text-sm font-medium mt-1">{audit.score}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceAuditsCard;
