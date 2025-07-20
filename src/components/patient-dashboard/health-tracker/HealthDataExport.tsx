import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Calendar, Share2 } from 'lucide-react';

interface HealthDataExportProps {
  healthData: any[];
}

const HealthDataExport: React.FC<HealthDataExportProps> = ({ healthData }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);

  const exportToCSV = () => {
    if (healthData.length === 0) {
      toast({
        title: "No Data",
        description: "No health data available to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare CSV headers
      const headers = ['Date', 'Type', 'Value', 'Unit', 'Source', 'Notes'];
      
      // Prepare CSV rows
      const rows = healthData.map(point => [
        new Date(point.date || point.created_at).toLocaleDateString(),
        point.type || point.data_type,
        point.value || point.enc_value,
        point.unit || '',
        point.source || 'manual_entry',
        point.notes || point.metadata?.notes || ''
      ]);

      // Create CSV content
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `health-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Export Successful",
        description: "Your health data has been exported as a CSV file.",
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export health data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-data-export', {
        body: {
          user_id: user?.id,
          format: 'pdf',
          data: healthData
        }
      });

      if (error) throw error;

      // Create PDF download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Export Successful",
        description: "Your health report has been generated and downloaded.",
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to generate PDF report. CSV export is available as alternative.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const shareWithProvider = async () => {
    try {
      // This would integrate with the existing sharing system
      toast({
        title: "Share Feature",
        description: "Navigate to the Sharing tab to grant provider access to your health data.",
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Failed to initiate sharing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateHealthSummary = () => {
    if (healthData.length === 0) return null;

    const summary = {
      totalRecords: healthData.length,
      dateRange: {
        start: new Date(Math.min(...healthData.map(d => new Date(d.date || d.created_at).getTime()))),
        end: new Date(Math.max(...healthData.map(d => new Date(d.date || d.created_at).getTime())))
      },
      dataTypes: [...new Set(healthData.map(d => d.type || d.data_type))],
      recentActivity: healthData.filter(d => {
        const date = new Date(d.date || d.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length
    };

    return summary;
  };

  const summary = generateHealthSummary();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Health Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Data Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-medium ml-2">{summary.totalRecords}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Data Types:</span>
                <span className="font-medium ml-2">{summary.dataTypes.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date Range:</span>
                <span className="font-medium ml-2">
                  {summary.dateRange.start.toLocaleDateString()} - {summary.dateRange.end.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Recent Activity:</span>
                <span className="font-medium ml-2">{summary.recentActivity} records this week</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CSV Export */}
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            disabled={healthData.length === 0}
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Export as CSV</div>
              <div className="text-xs text-muted-foreground">
                Spreadsheet-compatible format
              </div>
            </div>
          </Button>

          {/* PDF Export */}
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            disabled={healthData.length === 0 || exportLoading}
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">
                {exportLoading ? 'Generating...' : 'Export as PDF'}
              </div>
              <div className="text-xs text-muted-foreground">
                Professional health report
              </div>
            </div>
          </Button>

          {/* Share with Provider */}
          <Button
            onClick={shareWithProvider}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Share2 className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Share with Provider</div>
              <div className="text-xs text-muted-foreground">
                Grant access to healthcare team
              </div>
            </div>
          </Button>

          {/* Calendar Integration */}
          <Button
            onClick={() => {
              toast({
                title: "Calendar Integration",
                description: "Calendar reminders feature coming soon!",
              });
            }}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Calendar className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Add to Calendar</div>
              <div className="text-xs text-muted-foreground">
                Set tracking reminders
              </div>
            </div>
          </Button>
        </div>

        {healthData.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No health data available to export. Start tracking your vitals to generate reports!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthDataExport;