
import React from 'react';
import { Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';

interface AuditLogHeaderProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
  filteredLogsCount: number;
  auditLogsCount: number;
}

export const AuditLogHeader: React.FC<AuditLogHeaderProps> = ({
  timeframe,
  setTimeframe,
  filteredLogsCount,
  auditLogsCount
}) => {
  const { toast } = useToast();
  
  const handleDownload = () => {
    // In a real app, this would generate a properly formatted audit log export
    // that complies with HIPAA requirements
    
    // Log this administrative action
    AuditLogService.logAdminAction(
      'Exported audit logs',
      'Audit System',
      'success',
      `${filteredLogsCount} logs exported`
    );
    
    toast({
      title: "Export Started",
      description: `${filteredLogsCount} audit logs are being prepared for download.`,
    });
  };

  const getComplianceStatus = () => {
    // A simple way to show compliance status - in a real app this would be more sophisticated
    if (auditLogsCount > 0) {
      return (
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-medium">HIPAA Compliant Audit System Active</span>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <Shield className="h-5 w-5 text-amber-500 mr-2" />
        <span className="text-sm font-medium">No audit records - Compliance at risk</span>
      </div>
    );
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Complete, immutable record of all system activity
        </p>
        {getComplianceStatus()}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Last 24 hours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AuditLogHeader;
