
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, AlertCircle, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import new health tracker components
import VitalSignsEntry from './health-tracker/VitalSignsEntry';
import HealthChart from './health-tracker/HealthChart';
import HealthGoals from './health-tracker/HealthGoals';
import HealthInsights from './health-tracker/HealthInsights';
import HealthDataExport from './health-tracker/HealthDataExport';
import HealthTrackerFilters from './health-tracker/HealthTrackerFilters';
import HealthTrackerQuickActions from './health-tracker/HealthTrackerQuickActions';

// Import existing components
import AtomicVitalsCard from '@/components/patient/AtomicVitalsCard';
import FitnessDataDisplay from '@/components/fitness/FitnessDataDisplay';
import RealTimeHealthMonitor from './health-tracker/RealTimeHealthMonitor';

interface HealthDataPoint {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  source: string;
  notes?: string;
}

interface FilterState {
  dateRange: { start: string; end: string };
  dataTypes: string[];
  source: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const HealthTrackerTabContent: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);
  const [providerRecords, setProviderRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    dataTypes: [],
    source: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (user?.id) {
      fetchAllHealthData();
      setupRealTimeUpdates();
    }
  }, [user]);

  const fetchAllHealthData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch atomic data points (patient-entered vitals)
      const { data: atomicData, error: atomicError } = await supabase
        .from('atomic_data_points')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (atomicError) {
        console.error('Error fetching atomic data:', atomicError);
      }

      // Fetch provider medical records
      const { data: providerData, error: providerError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .not('provider_id', 'is', null)
        .order('created_at', { ascending: false });

      if (providerError) {
        console.error('Error fetching provider records:', providerError);
      }

      // Transform atomic data to standardized format
      const transformedAtomicData: HealthDataPoint[] = (atomicData || []).map(point => ({
        id: point.id,
        type: point.data_type,
        value: parseFloat(atob(point.enc_value)), // Decrypt the base64 encoded value
        unit: point.unit || '',
        date: point.created_at,
        source: 'patient_entry',
        notes: (point.metadata && typeof point.metadata === 'object' && 'notes' in point.metadata) ? point.metadata.notes as string : undefined
      }));

      // Transform provider data to standardized format
      const transformedProviderData: HealthDataPoint[] = (providerData || []).map(record => ({
        id: record.id,
        type: record.record_type,
        value: 0, // Provider records don't have numeric values in this format
        unit: '',
        date: record.created_at,
        source: 'provider',
        notes: 'Provider record'
      }));

      const allHealthData = [...transformedAtomicData, ...transformedProviderData];
      setHealthData(allHealthData);
      setProviderRecords(providerData || []);

    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('health-data-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'atomic_data_points',
          filter: `owner_id=eq.${user?.id}`
        },
        () => {
          fetchAllHealthData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Apply filters to health data
  const getFilteredHealthData = () => {
    let filteredData = [...healthData];

    // Date range filter
    if (filters.dateRange.start) {
      filteredData = filteredData.filter(point => 
        new Date(point.date) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filteredData = filteredData.filter(point => 
        new Date(point.date) <= new Date(filters.dateRange.end)
      );
    }

    // Data type filter
    if (filters.dataTypes.length > 0) {
      filteredData = filteredData.filter(point => 
        filters.dataTypes.includes(point.type)
      );
    }

    // Source filter
    if (filters.source && filters.source !== 'all') {
      filteredData = filteredData.filter(point => 
        point.source === filters.source
      );
    }

    // Sort
    filteredData.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  };

  // Get chart data for specific vital sign types
  const getChartData = (dataType: string) => {
    return getFilteredHealthData()
      .filter(point => point.type === dataType && point.value > 0)
      .map(point => ({
        date: point.date,
        value: point.value,
        type: point.type
      }));
  };

  // Get available data types and sources for filters
  const getAvailableDataTypes = () => [...new Set(healthData.map(point => point.type))];
  const getAvailableSources = () => [...new Set(healthData.map(point => point.source))];

  // Quick action handlers
  const handleQuickEntry = (type: string) => {
    setActiveTab('entry');
    // Optionally scroll to entry form or pre-fill type
  };

  const handleViewGoals = () => {
    setActiveTab('goals');
  };

  const handleViewInsights = () => {
    setActiveTab('insights');
  };

  const handleExportData = () => {
    setActiveTab('export');
  };

  const handleViewRealTime = () => {
    setActiveTab('realtime');
  };

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access your health tracker.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const filteredData = getFilteredHealthData();

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Advanced Health Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <HealthTrackerQuickActions
            onQuickEntry={handleQuickEntry}
            onViewGoals={handleViewGoals}
            onViewInsights={handleViewInsights}
            onExportData={handleExportData}
            onViewRealTime={handleViewRealTime}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <HealthTrackerFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableDataTypes={getAvailableDataTypes()}
                availableSources={getAvailableSources()}
              />
              
              {/* Latest Atomic Vitals */}
              <AtomicVitalsCard />
            </div>
            
            {/* Summary Stats */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Health Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Records:</span>
                      <span className="font-medium">{filteredData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Types:</span>
                      <span className="font-medium">{getAvailableDataTypes().length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Week:</span>
                      <span className="font-medium">
                        {filteredData.filter(d => {
                          const date = new Date(d.date);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return date >= weekAgo;
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getAvailableDataTypes().filter(type => 
              ['blood_pressure', 'heart_rate', 'weight', 'temperature'].includes(type)
            ).map(dataType => (
              <HealthChart
                key={dataType}
                data={getChartData(dataType)}
                title={dataType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                color="hsl(var(--primary))"
                unit={healthData.find(d => d.type === dataType)?.unit || ''}
                icon={
                  dataType === 'heart_rate' ? <Heart className="h-5 w-5" /> :
                  dataType === 'blood_pressure' ? <Activity className="h-5 w-5" /> :
                  dataType === 'weight' ? <TrendingUp className="h-5 w-5" /> :
                  <BarChart3 className="h-5 w-5" />
                }
              />
            ))}
          </div>
        </TabsContent>

        {/* Real-Time Tab */}
        <TabsContent value="realtime">
          <RealTimeHealthMonitor />
        </TabsContent>

        {/* Entry Tab */}
        <TabsContent value="entry">
          <div id="vital-signs-entry">
            <VitalSignsEntry />
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <HealthGoals />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <HealthInsights healthData={filteredData} />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <HealthDataExport healthData={filteredData} />
        </TabsContent>

        {/* Fitness Tab */}
        <TabsContent value="fitness">
          <FitnessDataDisplay />
        </TabsContent>
      </Tabs>

      {/* Provider Records (if any) */}
      {providerRecords.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Provider Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading records...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {providerRecords.map((record) => (
                  <div key={record.id} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{record.record_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthTrackerTabContent;
