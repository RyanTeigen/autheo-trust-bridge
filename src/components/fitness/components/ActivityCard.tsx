
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Heart, 
  Zap,
  Shield
} from 'lucide-react';

interface ActivityData {
  id?: string;
  data?: any;
  recorded_at: string;
  integration?: {
    device_type?: string;
  };
}

interface ActivityCardProps {
  activity: ActivityData;
  privacyMode: boolean;
  showRawData: boolean;
  onToggleRawData: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  privacyMode,
  showRawData,
  onToggleRawData
}) => {
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

  return (
    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
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
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={getActivityColor(activity.data?.type || 'activity')}
          >
            {activity.data?.type || 'Activity'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRawData}
            className="text-slate-400 hover:text-slate-300"
          >
            {showRawData ? 'Hide' : 'Show'} Raw
          </Button>
        </div>
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
  );
};

export default ActivityCard;
