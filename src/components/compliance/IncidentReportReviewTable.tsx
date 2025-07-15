import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, User, FileText, UserCheck } from 'lucide-react';

interface IncidentReport {
  id: string;
  user_id: string;
  type: string;
  description: string;
  date: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
}

const statusVariants = {
  open: 'destructive',
  in_review: 'secondary', 
  resolved: 'default'
} as const;

const statusLabels = {
  open: 'Open',
  in_review: 'In Review',
  resolved: 'Resolved'
} as const;

export default function IncidentReportReviewTable() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incident_reports')
      .select('id, user_id, type, description, date, status, assigned_to, created_at')
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch incident reports",
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('incident_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchReports();
    }
  };

  const assignToMe = async (id: string) => {
    const { error } = await supabase
      .from('incident_reports')
      .update({ assigned_to: session?.user.id })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign incident",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Incident assigned to you",
      });
      fetchReports();
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Security Incident Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-muted-foreground text-sm">No incident reports available.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="w-48">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User ID
                    </div>
                  </TableHead>
                  <TableHead className="w-32">Type</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </div>
                  </TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-32">Assigned</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {report.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="break-words text-sm">{report.description}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={report.status}
                        onValueChange={(status) => updateStatus(report.id, status)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <Badge variant={statusVariants[report.status as keyof typeof statusVariants]}>
                              {statusLabels[report.status as keyof typeof statusLabels]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">
                            <Badge variant="destructive">Open</Badge>
                          </SelectItem>
                          <SelectItem value="in_review">
                            <Badge variant="secondary">In Review</Badge>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <Badge variant="default">Resolved</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {report.assigned_to ? (
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span className="text-xs">Assigned</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!report.assigned_to && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => assignToMe(report.id)}
                          className="text-xs"
                        >
                          Assign to Me
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}