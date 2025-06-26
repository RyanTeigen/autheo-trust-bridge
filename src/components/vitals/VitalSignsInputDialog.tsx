
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Activity, Thermometer, Wind, Droplets } from 'lucide-react';
import BloodPressureForm from './forms/BloodPressureForm';
import HeartRateForm from './forms/HeartRateForm';
import TemperatureForm from './forms/TemperatureForm';
import RespiratoryRateForm from './forms/RespiratoryRateForm';
import OxygenSaturationForm from './forms/OxygenSaturationForm';

interface VitalSignsInputDialogProps {
  children: React.ReactNode;
  defaultTab?: string;
  onSuccess?: () => void;
}

const VitalSignsInputDialog: React.FC<VitalSignsInputDialogProps> = ({ 
  children, 
  defaultTab = "blood-pressure",
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-autheo-primary">
            <Heart className="h-5 w-5" />
            Record Vital Signs
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="blood-pressure" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              BP
            </TabsTrigger>
            <TabsTrigger value="heart-rate" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              HR
            </TabsTrigger>
            <TabsTrigger value="temperature" className="text-xs">
              <Thermometer className="h-3 w-3 mr-1" />
              Temp
            </TabsTrigger>
            <TabsTrigger value="respiratory" className="text-xs">
              <Wind className="h-3 w-3 mr-1" />
              RR
            </TabsTrigger>
            <TabsTrigger value="oxygen" className="text-xs">
              <Droplets className="h-3 w-3 mr-1" />
              O2
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="blood-pressure">
            <BloodPressureForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="heart-rate">
            <HeartRateForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="temperature">
            <TemperatureForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="respiratory">
            <RespiratoryRateForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="oxygen">
            <OxygenSaturationForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VitalSignsInputDialog;
