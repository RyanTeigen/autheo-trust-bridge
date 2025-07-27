import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { decryptWithKey } from '@/utils/atomicDecryption';
import { getVitalColor } from '@/components/patient/vital-signs/VitalIcon';

interface AtomicDataPoint {
  id: string;
  data_type: string;
  enc_value: string;
  unit?: string;
  created_at: string;
}

interface DecryptedVital {
  type: string;
  value: string;
  unit?: string;
  dataType: string;
  color: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface VitalTrend {
  dataType: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  comparison: string;
}

interface RealTimeVitalData {
  current: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  unit: string;
  lastUpdated: string;
}

export const useAtomicVitals = () => {
  const [vitals, setVitals] = useState<AtomicDataPoint[]>([]);
  const [decryptedVitals, setDecryptedVitals] = useState<DecryptedVital[]>([]);
  const [realTimeData, setRealTimeData] = useState<Record<string, RealTimeVitalData>>({});
  const [trends, setTrends] = useState<VitalTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const { user } = useAuth();

  const formatDataType = (dataType: string): string => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status based on vital type and value
  const getVitalStatus = useCallback((dataType: string, value: number): 'normal' | 'warning' | 'critical' => {
    const ranges = {
      'heart_rate': { normal: [60, 100], warning: [50, 120], critical: [0, 50, 120, 200] },
      'blood_pressure_systolic': { normal: [90, 120], warning: [120, 140], critical: [0, 90, 140, 300] },
      'blood_pressure_diastolic': { normal: [60, 80], warning: [80, 90], critical: [0, 60, 90, 200] },
      'temperature': { normal: [97.0, 99.5], warning: [99.5, 101.0], critical: [0, 97.0, 101.0, 110] },
      'oxygen_saturation': { normal: [95, 100], warning: [90, 95], critical: [0, 90] },
      'respiratory_rate': { normal: [12, 20], warning: [20, 24], critical: [0, 12, 24, 50] }
    };

    const range = ranges[dataType as keyof typeof ranges];
    if (!range) return 'normal';

    if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
    if ((value >= range.warning[0] && value <= range.warning[1]) || 
        (range.warning.length > 2 && value >= range.warning[2] && value <= range.warning[3])) {
      return 'warning';
    }
    return 'critical';
  }, []);

  // Calculate trends from historical data
  const calculateTrends = useCallback((vitals: DecryptedVital[]) => {
    const trendData: VitalTrend[] = [];
    const dataTypes = [...new Set(vitals.map(v => v.dataType))];
    
    dataTypes.forEach(dataType => {
      const typeVitals = vitals
        .filter(v => v.dataType === dataType)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      if (typeVitals.length >= 2) {
        const recent = typeVitals.slice(-2);
        const [prev, curr] = recent;
        const prevValue = parseFloat(prev.value);
        const currValue = parseFloat(curr.value);
        const change = ((currValue - prevValue) / prevValue) * 100;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(change) > 5) {
          trend = change > 0 ? 'up' : 'down';
        }
        
        trendData.push({
          dataType,
          trend,
          changePercentage: Math.abs(change),
          comparison: `${change > 0 ? '+' : ''}${change.toFixed(1)}% from last reading`
        });
      }
    });
    
    setTrends(trendData);
  }, []);

  const fetchVitals = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atomic_data_points')
        .select('id, data_type, enc_value, unit, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to fetch vitals:', error);
        setError('Failed to fetch vital signs data');
        return;
      }

      setVitals(data || []);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  useEffect(() => {
    if (!vitals.length) return;

    const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                         localStorage.getItem(`encryption_key_${user?.id}`);

    if (!encryptionKey) {
      setError('Encryption key not found. Please log in again.');
      return;
    }

    try {
      const decrypted = vitals.map(vital => {
        const value = decryptWithKey(vital.enc_value, encryptionKey);
        const numericValue = parseFloat(value);
        return {
          type: formatDataType(vital.data_type),
          value: value,
          unit: vital.unit,
          dataType: vital.data_type,
          color: getVitalColor(vital.data_type),
          timestamp: vital.created_at,
          status: getVitalStatus(vital.data_type, numericValue),
          trend: 'stable' as const
        };
      });

      setDecryptedVitals(decrypted);
      calculateTrends(decrypted);
    } catch (err) {
      console.error('Error decrypting vitals:', err);
      setError('Failed to decrypt vital signs data');
    }
  }, [vitals, user, getVitalStatus, calculateTrends]);

  // Real-time simulation effect
  useEffect(() => {
    if (!isRealTimeEnabled || decryptedVitals.length === 0) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const updated = { ...prev };
        
        decryptedVitals.forEach(vital => {
          const currentValue = parseFloat(vital.value);
          const current = updated[vital.dataType] || {
            current: currentValue,
            status: vital.status,
            trend: vital.trend,
            unit: vital.unit || '',
            lastUpdated: new Date().toISOString()
          };
          
          // Simulate small fluctuations
          const variation = (Math.random() - 0.5) * 0.1;
          const newValue = Math.max(0, current.current + (current.current * variation));
          
          updated[vital.dataType] = {
            ...current,
            current: newValue,
            status: getVitalStatus(vital.dataType, newValue),
            lastUpdated: new Date().toISOString()
          };
        });
        
        return updated;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, decryptedVitals, getVitalStatus]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('atomic_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'atomic_data_points',
          filter: `owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New atomic data point:', payload);
          // Refetch data when new points are added
          fetchVitals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchVitals]);

  return {
    vitals,
    decryptedVitals,
    realTimeData,
    trends,
    loading,
    error,
    isRealTimeEnabled,
    setIsRealTimeEnabled,
    calculateTrends,
    getVitalStatus
  };
};