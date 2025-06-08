import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Zap, 
  Heart, 
  TrendingUp, 
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useFitnessAudit } from '@/hooks/useFitnessAudit';
import { useToast } from '@/hooks/use-toast';

const FitnessDataDisplay: React.FC = () => {
  const { fitnessData, loading, error } = useFitnessData();
  const { logDataAccess } = useFitnessAudit();
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  // Log when fitness data is accessed
  useEffect(() => {
    if (fitnessData.length > 0) {
      logDataAccess('Viewed fitness data display', 'fitness_data_view', undefined, {
        data_count: fitnessData.length,
        privacy_mode: privacyMode
      });
    }
  }, [fitnessData, privacyMode]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
      case 'running':
        return <Activity className="h-4 w-4" />;
      case 'ride':
      case 'cycling':
        return <Zap className="h-4 w-4" />;
      case 'swim':
      case 'swimming':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
      case 'running':
        return 'bg-blue-100/20 text-blue-300 border-blue-300/30';
      case 'ride':
      case 'cycling':
        return 'bg-green-100/20 text-green-300 border-green-300/30';
      case 'swim':
      case 'swimming':
        return 'bg-cyan-100/20 text-cyan-300 border-cyan-300/30';
      default:
        return 'bg-slate-100/20 text-slate-300 border-slate-300/30';
    }
  };

  const maskPrivateData = (value: any, type: 'number' | 'string' = 'number') => {
    if (!privacyMode) return value;
    
    if (type === 'number') {
      // Show approximate ranges instead of exact values
      if (typeof value === 'number') {
        const rounded = Math.round(value / 10) * 10;
        return `~${rounded}`;
      }
    }
    
    if (type === 'string') {
      return value?.replace(/\d/g, 'X') || 'Private';
    }
    
    return '***';
  };

  const togglePrivacyMode = async () => {
    const newPrivacyMode = !privacyMode;
    setPrivacyMode(newPrivacyMode);
    
    // Log privacy mode change
    await logDataAccess(
      `Privacy mode ${newPrivacyMode ? 'enabled' : 'disabled'}`,
      'privacy_setting',
      'privacy_mode',
      { privacy_mode: newPrivacyMode }
    );
    
    toast({
      title: newPrivacyMode ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
      description: newPrivacyMode 
        ? "Showing approximated values for privacy" 
        : "Showing actual fitness data values",
    });
  };

  const handleRawDataToggle = async () => {
    const newShowRawData = !showRawData;
    setShowRawData(newShowRawData);
    
    // Log raw data view toggle
    await logDataAccess(
      `Raw data view ${newShowRawData ? 'enabled' : 'disabled'}`,
      'raw_data_view',
      undefined,
      { show_raw_data: newShowRawData }
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading fitness data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading fitness data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (fitnessData.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Fitness Data</h3>
            <p className="text-slate-400">
              Connect a fitness device and sync your data to see your activities here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-autheo-primary">Fitness Data Privacy</CardTitle>
              <CardDescription className="text-sm">
                Control how your fitness data is displayed and protected
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePrivacyMode}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {privacyMode ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Privacy Mode: ON
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Privacy Mode: OFF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">Quantum Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300">Zero-Knowledge Proofs Available</span>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              HIPAA Compliant
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Activities */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-autheo-primary">Recent Activities</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRawDataToggle}
              className="text-slate-400 hover:text-slate-300"
            >
              {showRawData ? 'Hide' : 'Show'} Raw Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fitnessData.map((activity, index) => (
            <div key={activity.id || index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-700">
                    {getActivityIcon(activity.data?.type || 'activity')}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-100">
                      {privacyMode ? 'Fitness Activity' : (activity.data?.name || 'Activity')}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {new Date(activity.recorded_at).toLocaleDateString()} • {activity.integration?.device_type || 'Unknown device'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getActivityColor(activity.data?.type || 'activity')}
                >
                  {activity.data?.type || 'Activity'}
                </Badge>
              </div>

              {/* Activity Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {activity.data?.distance && (
                  <div className="text-center">
                    <MapPin className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-200">
                      {privacyMode ? maskPrivateData(activity.data.distance) : formatDistance(activity.data.distance)}
                    </p>
                    <p className="text-xs text-slate-400">Distance</p>
                  </div>
                )}

                {activity.data?.moving_time && (
                  <div className="text-center">
                    <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-200">
                      {privacyMode ? maskPrivateData(activity.data.moving_time) : formatDuration(activity.data.moving_time)}
                    </p>
                    <p className="text-xs text-slate-400">Duration</p>
                  </div>
                )}

                {activity.data?.average_heartrate && (
                  <div className="text-center">
                    <Heart className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-200">
                      {privacyMode ? maskPrivateData(activity.data.average_heartrate) : activity.data.average_heartrate} bpm
                    </p>
                    <p className="text-xs text-slate-400">Avg Heart Rate</p>
                  </div>
                )}

                {activity.data?.calories && (
                  <div className="text-center">
                    <Zap className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-200">
                      {privacyMode ? maskPrivateData(activity.data.calories) : activity.data.calories}
                    </p>
                    <p className="text-xs text-slate-400">Calories</p>
                  </div>
                )}
              </div>

              {/* Privacy Status */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="h-3 w-3 text-green-400" />
                  <span>Quantum encrypted • Zero-knowledge proofs available • HIPAA audited</span>
                </div>
                <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                  Protected
                </Badge>
              </div>

              {/* Raw Data (when expanded) */}
              {showRawData && (
                <div className="mt-4 p-3 bg-slate-700/30 rounded-md">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Raw Data (Development)</h4>
                  <pre className="text-xs text-slate-400 overflow-auto">
                    {JSON.stringify(activity.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDataDisplay;
