
import { useState } from 'react';
import { atomicDataAPIService, AtomicDataFields, AtomicDataInsertResponse } from '@/services/atomic/AtomicDataAPIService';
import { useToast } from '@/hooks/use-toast';

export const useAtomicDataAPI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const insertAtomicData = async (
    recordId: string, 
    fields: AtomicDataFields
  ): Promise<AtomicDataInsertResponse> => {
    setLoading(true);
    try {
      console.log('Inserting atomic data via API:', { recordId, fields });
      
      const result = await atomicDataAPIService.insertAtomicData(recordId, fields);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Successfully inserted ${result.inserted_count} atomic data points`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to insert atomic data",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in useAtomicDataAPI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: `Failed to insert atomic data: ${errorMessage}`,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const insertVitalSigns = async (
    recordId: string,
    vitals: {
      systolic_bp?: number;
      diastolic_bp?: number;
      heart_rate?: number;
      temperature?: number;
      respiratory_rate?: number;
      oxygen_saturation?: number;
    }
  ): Promise<AtomicDataInsertResponse> => {
    setLoading(true);
    try {
      const result = await atomicDataAPIService.insertVitalSigns(recordId, vitals);
      
      if (result.success) {
        toast({
          title: "Vital Signs Recorded",
          description: "Successfully recorded vital signs as atomic data points",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record vital signs",
          variant: "destructive",
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const insertLabResults = async (
    recordId: string,
    labResults: {
      glucose?: number;
      cholesterol?: number;
      hemoglobin?: number;
      white_blood_cell_count?: number;
      creatinine?: number;
      [key: string]: string | number | undefined;
    }
  ): Promise<AtomicDataInsertResponse> => {
    setLoading(true);
    try {
      const result = await atomicDataAPIService.insertLabResults(recordId, labResults);
      
      if (result.success) {
        toast({
          title: "Lab Results Recorded",
          description: "Successfully recorded lab results as atomic data points",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record lab results",
          variant: "destructive",
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    insertAtomicData,
    insertVitalSigns,
    insertLabResults
  };
};
