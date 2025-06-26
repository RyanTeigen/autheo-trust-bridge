
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';
import { Loader2 } from 'lucide-react';

const AtomicDataAPITest: React.FC = () => {
  const [recordId, setRecordId] = useState('');
  const [glucose, setGlucose] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  
  const { loading, insertAtomicData, insertVitalSigns } = useAtomicDataAPI();

  const handleInsertCustomData = async () => {
    if (!recordId) {
      alert('Please enter a record ID');
      return;
    }

    const fields: { [key: string]: string | number } = {};
    
    if (glucose) fields.glucose = parseFloat(glucose);
    if (heartRate) fields.heart_rate = parseFloat(heartRate);
    if (systolicBP) fields.systolic_bp = parseFloat(systolicBP);
    if (diastolicBP) fields.diastolic_bp = parseFloat(diastolicBP);

    if (Object.keys(fields).length === 0) {
      alert('Please enter at least one data point');
      return;
    }

    await insertAtomicData(recordId, fields);
  };

  const handleInsertVitalSigns = async () => {
    if (!recordId) {
      alert('Please enter a record ID');
      return;
    }

    const vitals: { [key: string]: number } = {};
    
    if (heartRate) vitals.heart_rate = parseFloat(heartRate);
    if (systolicBP) vitals.systolic_bp = parseFloat(systolicBP);
    if (diastolicBP) vitals.diastolic_bp = parseFloat(diastolicBP);

    if (Object.keys(vitals).length === 0) {
      alert('Please enter at least one vital sign');
      return;
    }

    await insertVitalSigns(recordId, vitals);
  };

  const handleInsertSampleData = async () => {
    if (!recordId) {
      alert('Please enter a record ID');
      return;
    }

    const sampleFields = {
      glucose: 109,
      heart_rate: 76,
      systolic_bp: 118,
      diastolic_bp: 79,
      temperature: 98.6,
      oxygen_saturation: 98
    };

    await insertAtomicData(recordId, sampleFields);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Atomic Data API Test</CardTitle>
        <CardDescription>
          Test the atomic data insertion API endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="record-id">Medical Record ID</Label>
          <Input
            id="record-id"
            placeholder="Enter record UUID..."
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="glucose">Glucose (mg/dL)</Label>
            <Input
              id="glucose"
              type="number"
              placeholder="109"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
            <Input
              id="heart-rate"
              type="number"
              placeholder="76"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
            <Input
              id="systolic"
              type="number"
              placeholder="118"
              value={systolicBP}
              onChange={(e) => setSystolicBP(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="79"
              value={diastolicBP}
              onChange={(e) => setDiastolicBP(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={handleInsertCustomData} 
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Insert Custom Data
          </Button>

          <Button 
            onClick={handleInsertVitalSigns} 
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Insert as Vital Signs
          </Button>

          <Button 
            onClick={handleInsertSampleData} 
            disabled={loading}
            variant="secondary"
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Insert Sample Data
          </Button>
        </div>

        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
          <p><strong>Note:</strong> This will create encrypted atomic data points in your database.</p>
          <p>Make sure you have a valid medical record ID and that encryption keys are properly set up.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AtomicDataAPITest;
