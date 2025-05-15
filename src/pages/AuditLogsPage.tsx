
import React, { useState } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AuditLogItem, { AuditLogItemProps, AuditLogType } from '@/components/ui/AuditLogItem';
import { useToast } from '@/hooks/use-toast';

const AuditLogsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Mock data for demo
  const auditLogs: AuditLogItemProps[] = [
    {
      id: '1',
      type: 'access',
      timestamp: new Date().toISOString(),
      user: 'Dr. Sarah Johnson',
      action: 'Viewed patient record',
      resource: 'Patient #12345',
      status: 'success',
    },
    {
      id: '2',
      type: 'disclosure',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Patient Jane Smith',
      action: 'Shared lab results',
      resource: 'Lab Report #789',
      status: 'success',
    },
    {
      id: '3',
      type: 'breach',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Unknown',
      action: 'Failed login attempt',
      resource: 'Admin Portal',
      status: 'error',
    },
    {
      id: '4',
      type: 'admin',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'Admin Michael Brown',
      action: 'Updated system policies',
      resource: 'Retention Policy',
      status: 'success',
    },
    {
      id: '5',
      type: 'amendment',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      user: 'Patient Robert Davis',
      action: 'Requested record amendment',
      resource: 'Allergy Information',
      status: 'warning',
    },
    {
      id: '6',
      type: 'access',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      user: 'Dr. Emily Wilson',
      action: 'Emergency access',
      resource: 'Patient #67890',
      status: 'warning',
    },
    {
      id: '7',
      type: 'disclosure',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      user: 'System',
      action: 'Automatic data sync',
      resource: 'Epic EMR',
      status: 'success',
    },
  ];

  // Filter logs based on search query and type
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = filterType === 'all' || log.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleDownload = () => {
    toast({
      title: "Export Started",
      description: "Audit logs are being prepared for download.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Logs</h1>
          <p className="text-muted-foreground">
            Complete, immutable record of all system activity
          </p>
        </div>
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Tamper-proof record of all data access, disclosures, and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Events" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="access">Access Events</SelectItem>
                  <SelectItem value="disclosure">Disclosures</SelectItem>
                  <SelectItem value="breach">Security Events</SelectItem>
                  <SelectItem value="admin">Admin Actions</SelectItem>
                  <SelectItem value="amendment">Amendments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <AuditLogItem key={log.id} {...log} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">No matching audit logs</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
