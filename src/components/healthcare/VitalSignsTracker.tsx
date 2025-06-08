
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, Thermometer, Activity, Scale, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VitalSign {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'oxygen_saturation';
  value: string;
  timestamp: string;
  notes?: string;
}

const VitalSignsTracker: React.FC = () => {
  const { toast } = useToast();
  const [vitals, setVitals] = useState<VitalSign[]>([
    {
      id: '1',
      type: 'blood_pressure',
      value: '120/80',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'heart_rate',
      value: '72',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'temperature',
      value: '98.6',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    }
  ]);

  const [newVital, setNewVital] = useState({
    type: 'blood_pressure' as VitalSign['type'],
    value: '',
    notes: ''
  });

  const vitalTypes = [
    { key: 'blood_pressure', label: 'Blood Pressure', icon: <Heart className="h-4 w-4" />, unit: 'mmHg' },
    { key: 'heart_rate', label: 'Heart Rate', icon: <Activity className="h-4 w-4" />, unit: 'bpm' },
    { key: 'temperature', label: 'Temperature', icon: <Thermometer className="h-4 w-4" />, unit: '°F' },
    { key: 'weight', label: 'Weight', icon: <Scale className="h-4 w-4" />, unit: 'lbs' },
    { key: 'oxygen_saturation', label: 'Oxygen Saturation', icon: <Heart className="h-4 w-4" />, unit: '%' }
  ];

  const addVital = () => {
    if (!newVital.value.trim()) {
      toast({
        title: "Missing Value",
        description: "Please enter a value for the vital sign.",
        variant: "destructive"
      });
      return;
    }

    const vital: VitalSign = {
      id: Date.now().toString(),
      type: newVital.type,
      value: newVital.value.trim(),
      timestamp: new Date().toISOString(),
      notes: newVital.notes.trim() || undefined
    };

    setVitals(prev => [vital, ...prev]);
    setNewVital({ type: 'blood_pressure', value: '', notes: '' });
    
    toast({
      title: "Vital Sign Added",
      description: "Your vital sign has been recorded successfully.",
    });
  };

  const getVitalConfig = (type: string) => {
    return vitalTypes.find(v => v.key === type) || vitalTypes[0];
  };

  const getVitalStatus = (type: string, value: string) => {
    // Simple ranges for demonstration - real implementation would use medical guidelines
    switch (type) {
      case 'blood_pressure':
        const [systolic] = value.split('/').map(Number);
        if (systolic > 140) return { status: 'high', color: 'text-red-400' };
        if (systolic < 90) return { status: 'low', color: 'text-blue-400' };
        return { status: 'normal', color: 'text-green-400' };
      case 'heart_rate':
        const hr = Number(value);
        if (hr > 100) return { status: 'high', color: 'text-red-400' };
        if (hr < 60) return { status: 'low', color: 'text-blue-400' };
        return { status: 'normal', color: 'text-green-400' };
      default:
        return { status: 'normal', color: 'text-green-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Vital */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Record Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vital-type">Type</Label>
              <select
                id="vital-type"
                value={newVital.type}
                onChange={(e) => setNewVital(prev => ({ ...prev, type: e.target.value as VitalSign['type'] }))}
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-slate-100"
              >
                {vitalTypes.map(type => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="vital-value">Value</Label>
              <Input
                id="vital-value"
                value={newVital.value}
                onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                placeholder={`Enter ${getVitalConfig(newVital.type).unit}`}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addVital}
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
              >
                Record
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-autheo-primary">Recent Vital Signs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {vitals.map((vital) => {
              const config = getVitalConfig(vital.type);
              const status = getVitalStatus(vital.type, vital.value);
              
              return (
                <div key={vital.id} className="p-4 border-b border-slate-700 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-200">{config.label}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-semibold text-slate-100">
                            {vital.value} {config.unit}
                          </span>
                          <Badge variant="outline" className={status.color}>
                            {status.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(vital.timestamp).toLocaleString()}
                        </p>
                        {vital.notes && (
                          <p className="text-sm text-slate-300 mt-1">{vital.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VitalSignsTracker;
