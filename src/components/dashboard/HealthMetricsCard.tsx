
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import KeyMetrics from './KeyMetrics';
import MetricsCardGrid from './MetricsCardGrid';
import { HealthMetrics } from '@/contexts/HealthRecordsContext';
import { Heart, Activity, Thermometer, Droplets } from 'lucide-react';

interface HealthMetricsCardProps {
  metrics: HealthMetrics[];
  healthRecords: any;
  complianceScore: number;
}

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

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ metrics, healthRecords, complianceScore }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [atomicVitals, setAtomicVitals] = useState<DecryptedVital[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        return <Heart className="h-4 w-4" />;
      case 'systolic_bp':
      case 'diastolic_bp':
        return <Activity className="h-4 w-4" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'oxygen_saturation':
        return <Droplets className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getVitalColor = (dataType: string): string => {
    switch (dataType.toLowerCase()) {
      case 'heart_rate':
        return 'text-red-400';
      case 'systolic_bp':
      case 'diastolic_bp':
        return 'text-blue-400';
      case 'temperature':
        return 'text-orange-400';
      case 'oxygen_saturation':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatDataType = (dataType: string): string => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchAtomicVitals = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('atomic_data_points')
          .select('id, data_type, enc_value, unit, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6); // Limit to 6 most recent vitals for the card

        if (error) {
          console.error('Failed to fetch atomic vitals:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                               localStorage.getItem(`encryption_key_${user.id}`);

          if (encryptionKey) {
            const decrypted = data.map(vital => ({
              type: formatDataType(vital.data_type),
              value: decryptWithKey(vital.enc_value, encryptionKey),
              unit: vital.unit,
              icon: getVitalIcon(vital.data_type),
              color: getVitalColor(vital.data_type)
            }));

            setAtomicVitals(decrypted);
          }
        }
      } catch (err) {
        console.error('Error fetching atomic vitals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAtomicVitals();
  }, [user]);
  
  const handleViewMore = () => {
    toast({
      title: "View More: Health Metrics",
      description: "Navigating to full health metrics view."
    });
    navigate('/wallet');
  };
  
  return (
    <Card className="md:col-span-2 bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Health Metrics</CardTitle>
        <CardDescription className="text-slate-300">Your recent health measurements and vital signs</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <KeyMetrics 
          healthRecords={healthRecords} 
          complianceScore={complianceScore} 
        />
        
        <MetricsCardGrid metrics={metrics} />
        
        {/* Atomic Vitals Section */}
        {atomicVitals.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-autheo-primary" />
              Latest Vital Signs
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {atomicVitals.slice(0, 6).map((vital, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={vital.color}>
                      {vital.icon}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {vital.type}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-semibold text-autheo-primary">
                      {vital.value}
                    </span>
                    {vital.unit && (
                      <span className="text-xs text-slate-500">
                        {vital.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Loading vital signs...</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 animate-pulse">
                  <div className="h-4 bg-slate-600 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="link" 
            className="text-autheo-primary hover:text-autheo-primary/80 p-0"
            onClick={handleViewMore}
          >
            View all metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsCard;
