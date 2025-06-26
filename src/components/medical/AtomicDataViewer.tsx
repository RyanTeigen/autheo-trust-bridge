
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom, Database, Eye, EyeOff, RefreshCw, TrendingUp } from 'lucide-react';
import { atomicDataService, AtomicDataPoint } from '@/services/atomic/AtomicDataService';
import { useToast } from '@/hooks/use-toast';

interface AtomicDataViewerProps {
  recordId: string;
  className?: string;
}

const AtomicDataViewer: React.FC<AtomicDataViewerProps> = ({ recordId, className }) => {
  const [atomicData, setAtomicData] = useState<(AtomicDataPoint & { decrypted_value?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const { toast } = useToast();

  const loadAtomicData = async () => {
    setLoading(true);
    try {
      const result = await atomicDataService.getAtomicValuesForRecord(recordId);
      
      if (result.success && result.data) {
        setAtomicData(result.data);
      } else {
        toast({
          title: "Error Loading Atomic Data",
          description: result.error || "Failed to load atomic data points",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading atomic data:', error);
      toast({
        title: "Error",
        description: "Unexpected error loading atomic data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAtomicData();
  }, [recordId]);

  // Group atomic data by category
  const groupedData = atomicData.reduce((acc, point) => {
    const category = point.metadata?.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(point);
    return acc;
  }, {} as Record<string, (AtomicDataPoint & { decrypted_value?: string })[]>);

  const formatDataType = (dataType: string) => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getValueColor = (dataType: string) => {
    if (dataType.includes('blood_pressure')) return 'text-red-400';
    if (dataType.includes('heart_rate')) return 'text-pink-400';
    if (dataType.includes('temperature')) return 'text-orange-400';
    if (dataType.includes('lab_')) return 'text-blue-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800 border-slate-700 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-autheo-primary animate-spin" />
            <CardTitle className="text-slate-200">Loading Atomic Data...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-slate-700/50 h-12 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-autheo-primary" />
            <div>
              <CardTitle className="text-slate-200">Atomic Data Points</CardTitle>
              <CardDescription>
                Encrypted atomic values from this medical record ({atomicData.length} points)
              </CardDescription>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEncrypted(!showEncrypted)}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              {showEncrypted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showEncrypted ? 'Hide' : 'Show'} Encrypted
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadAtomicData}
              disabled={loading}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {atomicData.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No atomic data points found for this record</p>
            <p className="text-sm mt-2">Data will be automatically decomposed when records are processed</p>
          </div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedData)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-auto bg-slate-700 mb-4">
              {Object.keys(groupedData).map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({groupedData[category].length})
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedData).map(([category, points]) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-slate-200">
                          {formatDataType(point.data_type)}
                        </h4>
                        <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                          {point.unit || 'unitless'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Value:</span>
                          <span className={`text-sm font-mono ${getValueColor(point.data_type)}`}>
                            {point.decrypted_value}
                            {point.unit && ` ${point.unit}`}
                          </span>
                        </div>
                        
                        {showEncrypted && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Encrypted:</span>
                            <span className="text-xs font-mono text-slate-500 truncate max-w-xs">
                              {point.enc_value.substring(0, 32)}...
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-500">
                          {new Date(point.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AtomicDataViewer;
