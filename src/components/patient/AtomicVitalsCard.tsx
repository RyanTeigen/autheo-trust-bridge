
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Activity, Thermometer, Droplets } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  icon: React.ReactNode;
  color: string;
}

const AtomicVitalsCard: React.FC = () => {
  const [vitals, setVitals] = useState<AtomicDataPoint[]>([]);
  const [decryptedVitals, setDecryptedVitals] = useState<DecryptedVital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Simple XOR decryption function (matches the encryption used in the edge function)
  const decryptWithKey = (encryptedData: string, key: string): string => {
    try {
      const decoded = atob(encryptedData);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      return 'Unable to decrypt';
    }
  };

  const getVitalIcon = (dataType: string): React.ReactNode => {
    switch (dataType.toLowerCase()) {
      case 'heart_rate':
        return <Heart className="h-5 w-5" />;
      case 'systolic_bp':
      case 'diastolic_bp':
        return <Activity className="h-5 w-5" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'oxygen_saturation':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getVitalColor = (dataType: string): string => {
    switch (dataType.toLowerCase()) {
      case 'heart_rate':
        return 'text-red-600';
      case 'systolic_bp':
      case 'diastolic_bp':
        return 'text-blue-600';
      case 'temperature':
        return 'text-orange-600';
      case 'oxygen_saturation':
        return 'text-cyan-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDataType = (dataType: string): string => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchVitals = async () => {
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
          .limit(10);

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
    };

    fetchVitals();
  }, [user]);

  useEffect(() => {
    if (!vitals.length) return;

    const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                         localStorage.getItem(`encryption_key_${user?.id}`);

    if (!encryptionKey) {
      setError('Encryption key not found. Please log in again.');
      return;
    }

    try {
      const decrypted = vitals.map(vital => ({
        type: formatDataType(vital.data_type),
        value: decryptWithKey(vital.enc_value, encryptionKey),
        unit: vital.unit,
        icon: getVitalIcon(vital.data_type),
        color: getVitalColor(vital.data_type)
      }));

      setDecryptedVitals(decrypted);
    } catch (err) {
      console.error('Error decrypting vitals:', err);
      setError('Failed to decrypt vital signs data');
    }
  }, [vitals, user]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Latest Vitals
          </CardTitle>
          <CardDescription>Loading your encrypted vital signs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Activity className="h-5 w-5" />
            Your Latest Vitals
          </CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-autheo-primary" />
          Your Latest Vitals
        </CardTitle>
        <CardDescription>
          Securely encrypted vital signs from your atomic data points
        </CardDescription>
      </CardHeader>
      <CardContent>
        {decryptedVitals.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No recent vital signs found.</p>
            <p className="text-sm text-slate-400 mt-1">
              Vital signs will appear here once they are recorded as atomic data points.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {decryptedVitals.map((vital, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={vital.color}>
                    {vital.icon}
                  </span>
                  <span className="font-medium text-slate-700">
                    {vital.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-semibold text-slate-900">
                    {vital.value}
                  </span>
                  {vital.unit && (
                    <span className="text-sm text-slate-500 ml-1">
                      {vital.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AtomicVitalsCard;
