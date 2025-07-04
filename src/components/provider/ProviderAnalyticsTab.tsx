import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Users, 
  Activity, 
  TrendingUp, 
  Share2, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalRecords: number;
  uniquePatients: number;
  avgRecordsPerPatient: number;
  mostCommonRecordType: string;
  sharedRecordsPercentage: number;
  recordsByType: Array<{ type: string; count: number }>;
  recordsByMonth: Array<{ month: string; count: number }>;
  totalSharedRecords: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const ProviderAnalyticsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRecords: 0,
    uniquePatients: 0,
    avgRecordsPerPatient: 0,
    mostCommonRecordType: 'N/A',
    sharedRecordsPercentage: 0,
    recordsByType: [],
    recordsByMonth: [],
    totalSharedRecords: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch medical records created by this provider
      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select('id, record_type, patient_id, created_at')
        .eq('provider_id', user.id);

      if (recordsError) throw recordsError;

      // Fetch sharing permissions for these records
      const recordIds = (records || []).map(r => r.id);
      let sharingData = [];
      
      if (recordIds.length > 0) {
        const { data: sharing, error: sharingError } = await supabase
          .from('sharing_permissions')
          .select('medical_record_id, status')
          .in('medical_record_id', recordIds);

        if (sharingError) throw sharingError;
        sharingData = sharing || [];
      }

      // Calculate analytics
      const totalRecords = records?.length || 0;
      const uniquePatientIds = new Set((records || []).map(r => r.patient_id));
      const uniquePatients = uniquePatientIds.size;
      const avgRecordsPerPatient = uniquePatients > 0 ? Math.round((totalRecords / uniquePatients) * 10) / 10 : 0;

      // Record types analysis
      const recordTypeCounts: { [key: string]: number } = {};
      (records || []).forEach(record => {
        const type = record.record_type || 'Unknown';
        recordTypeCounts[type] = (recordTypeCounts[type] || 0) + 1;
      });

      const recordsByType = Object.entries(recordTypeCounts).map(([type, count]) => ({
        type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      })).sort((a, b) => b.count - a.count);

      const mostCommonRecordType = recordsByType.length > 0 ? recordsByType[0].type : 'N/A';

      // Sharing analysis
      const approvedShares = sharingData.filter(s => s.status === 'approved').length;
      const sharedRecordsPercentage = totalRecords > 0 ? Math.round((approvedShares / totalRecords) * 100) : 0;

      // Monthly records (last 6 months)
      const monthlyData: { [key: string]: number } = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyData[monthKey] = 0;
      }

      (records || []).forEach(record => {
        const recordDate = new Date(record.created_at);
        const monthKey = recordDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      });

      const recordsByMonth = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }));

      setAnalytics({
        totalRecords,
        uniquePatients,
        avgRecordsPerPatient,
        mostCommonRecordType,
        sharedRecordsPercentage,
        recordsByType: recordsByType.slice(0, 6), // Top 6 types
        recordsByMonth,
        totalSharedRecords: approvedShares,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-full bg-slate-700 mb-2" />
                <Skeleton className="h-4 w-2/3 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full bg-slate-700" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full bg-slate-700" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Provider Analytics</h2>
        <p className="text-slate-400">
          Overview of your medical records, patient interactions, and sharing activity
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Records</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.totalRecords.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Unique Patients</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.uniquePatients}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg. Records/Patient</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.avgRecordsPerPatient}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Shared Records</p>
                <p className="text-2xl font-bold text-slate-200">{analytics.sharedRecordsPercentage}%</p>
                <p className="text-xs text-slate-500">{analytics.totalSharedRecords} of {analytics.totalRecords}</p>
              </div>
              <Share2 className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records by Month */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-autheo-primary" />
              Records by Month
            </CardTitle>
            <CardDescription>
              Monthly record creation trend (last 6 months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.recordsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Records by Type */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-autheo-primary" />
              Records by Type
            </CardTitle>
            <CardDescription>
              Distribution of record types you've created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recordsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.recordsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => 
                      percent > 5 ? `${type} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.recordsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No record types data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-autheo-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h4 className="font-medium text-slate-200 mb-2">Most Common Record Type</h4>
              <p className="text-2xl font-bold text-autheo-primary">{analytics.mostCommonRecordType}</p>
              <p className="text-sm text-slate-400 mt-1">
                {analytics.recordsByType.length > 0 ? 
                  `${analytics.recordsByType[0]?.count || 0} records created` : 
                  'No records created yet'
                }
              </p>
            </div>
            
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h4 className="font-medium text-slate-200 mb-2">Sharing Activity</h4>
              <p className="text-2xl font-bold text-green-400">{analytics.totalSharedRecords}</p>
              <p className="text-sm text-slate-400 mt-1">
                Records shared with other providers ({analytics.sharedRecordsPercentage}% of total)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderAnalyticsTab;