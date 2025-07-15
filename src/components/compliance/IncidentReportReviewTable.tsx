import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Calendar, User, FileText } from 'lucide-react';

interface IncidentReport {
  id: string;
  user_id: string;
  type: string;
  description: string;
  date: string;
  created_at: string;
}

export default function IncidentReportReviewTable() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incident_reports')
      .select('id, user_id, type, description, date, created_at')
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
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        {report.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="break-words text-sm">{report.description}</p>
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