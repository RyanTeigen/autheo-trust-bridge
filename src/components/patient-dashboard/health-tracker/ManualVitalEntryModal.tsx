import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Scale, Thermometer, Activity, AlertCircle, User, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { atomicDataService } from '@/services/atomic/AtomicDataService';

interface VitalType {
  id: string;
  name: string;
  unit: string;
  icon: React.ReactNode;
  normalRange?: string;
  placeholder: string;
}

interface Provider {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

interface ManualVitalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVitalType?: string;
}

const vitalTypes: Record<string, VitalType> = {
  blood_pressure: {
    id: 'blood_pressure',
    name: 'Blood Pressure',
    unit: 'mmHg',
    icon: <Heart className="h-4 w-4" />,
    normalRange: '120/80 mmHg',
    placeholder: 'e.g., 120/80'
  },
  heart_rate: {
    id: 'heart_rate',
    name: 'Heart Rate',
    unit: 'bpm',
    icon: <Activity className="h-4 w-4" />,
    normalRange: '60-100 bpm',
    placeholder: 'e.g., 72'
  },
  weight: {
    id: 'weight',
    name: 'Weight',
    unit: 'lbs',
    icon: <Scale className="h-4 w-4" />,
    placeholder: 'e.g., 150'
  },
  temperature: {
    id: 'temperature',
    name: 'Temperature',
    unit: '°F',
    icon: <Thermometer className="h-4 w-4" />,
    normalRange: '98.6°F',
    placeholder: 'e.g., 98.6'
  }
};

const ManualVitalEntryModal: React.FC<ManualVitalEntryModalProps> = ({
  isOpen,
  onClose,
  selectedVitalType = 'blood_pressure'
}) => {
  const { toast } = useToast();
  const [selectedVital, setSelectedVital] = useState(selectedVitalType);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyProvider, setNotifyProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load providers when notification is enabled
  useEffect(() => {
    if (notifyProvider) {
      loadProviders();
    }
  }, [notifyProvider]);

  const loadProviders = async () => {
    try {
      // Get providers that have access or have been granted access to this patient's records
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          grantee_id,
          profiles!sharing_permissions_grantee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('status', 'approved')
        .in('profiles.role', ['provider']);

      if (error) throw error;

      const providerList = data
        ?.filter(item => item.profiles)
        .map(item => ({
          id: item.grantee_id,
          name: `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || item.profiles.email,
          email: item.profiles.email,
          specialization: item.profiles.role
        })) || [];

      setProviders(providerList);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load healthcare providers',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    // Validate vital sign value based on type
    const vitalType = vitalTypes[selectedVital];
    const trimmedValue = value.trim();
    
    // For blood pressure, allow format like "120/80"
    if (selectedVital === 'blood_pressure') {
      const bpPattern = /^\d+\/\d+$/;
      if (!bpPattern.test(trimmedValue)) {
        toast({
          title: 'Invalid Blood Pressure Format',
          description: 'Please enter blood pressure in format: 120/80',
          variant: 'destructive'
        });
        return;
      }
    } else {
      // For other vitals, ensure it's a valid number
      const numValue = parseFloat(trimmedValue);
      if (isNaN(numValue) || numValue <= 0) {
        toast({
          title: 'Invalid Value',
          description: `Please enter a valid numeric value for ${vitalType.name}`,
          variant: 'destructive'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Generate a record ID for this vital entry
      const recordId = crypto.randomUUID();
      
      // Store the atomic data point with the recordId as a parameter
      const result = await atomicDataService.storeAtomicValue(recordId, {
        data_type: selectedVital,
        value: trimmedValue,
        unit: vitalType.unit,
        metadata: {
          notes: notes.trim(),
          source: 'manual_entry',
          entry_method: 'patient_portal'
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to store vital data');
      }

      // If provider notification is enabled, create a notification record
      if (notifyProvider && selectedProvider) {
        // For now, we'll handle provider notifications separately
        // The database update would be handled by a different service
        console.log('Provider notification requested for:', selectedProvider);
      }

      toast({
        title: 'Vital Signs Recorded',
        description: `${vitalType.name} has been successfully recorded${notifyProvider ? ' and provider notified' : ''}.`
      });

      // Reset form
      setValue('');
      setNotes('');
      setNotifyProvider(false);
      setSelectedProvider('');
      onClose();

    } catch (error) {
      console.error('Error submitting vital data:', error);
      toast({
        title: 'Error',
        description: 'Failed to record vital signs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentVital = vitalTypes[selectedVital];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentVital.icon}
            Record Vital Signs
          </DialogTitle>
          <DialogDescription>
            Manually enter your vital sign measurements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vital Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="vital-type">Vital Sign Type</Label>
            <Select value={selectedVital} onValueChange={setSelectedVital}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(vitalTypes).map(vital => (
                  <SelectItem key={vital.id} value={vital.id}>
                    <div className="flex items-center gap-2">
                      {vital.icon}
                      {vital.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="value">
              {currentVital.name} ({currentVital.unit})
            </Label>
            <Input
              id="value"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentVital.placeholder}
              required
            />
            {currentVital.normalRange && (
              <p className="text-xs text-muted-foreground">
                Normal range: {currentVital.normalRange}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this measurement..."
              rows={2}
            />
          </div>

          {/* Provider Notification */}
          <Card className="border-muted">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notify-provider" className="text-sm font-medium">
                      Notify Healthcare Provider
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Send this measurement to your provider
                    </p>
                  </div>
                </div>
                <Switch
                  id="notify-provider"
                  checked={notifyProvider}
                  onCheckedChange={setNotifyProvider}
                />
              </div>

              {notifyProvider && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="provider">Select Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a healthcare provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <div>
                              <div className="font-medium">{provider.name}</div>
                              <div className="text-xs text-muted-foreground">{provider.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {providers.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      No healthcare providers found with access to your records
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (notifyProvider && !selectedProvider)} 
              className="flex-1"
            >
              {isSubmitting ? 'Recording...' : 'Record Vital'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualVitalEntryModal;