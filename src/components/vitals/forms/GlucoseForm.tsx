
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Utensils } from 'lucide-react';
import GlucoseInputForm from './glucose/GlucoseInputForm';
import HbA1cInputForm from './glucose/HbA1cInputForm';

interface GlucoseFormProps {
  onSuccess?: () => void;
}

const GlucoseForm: React.FC<GlucoseFormProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('glucose');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          Glucose & Diabetes Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="glucose" className="flex items-center gap-2">
              <Utensils className="h-3 w-3" />
              Blood Glucose
            </TabsTrigger>
            <TabsTrigger value="hba1c" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              HbA1c
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="glucose">
            <GlucoseInputForm onSuccess={onSuccess} />
          </TabsContent>
          
          <TabsContent value="hba1c">
            <HbA1cInputForm onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlucoseForm;
