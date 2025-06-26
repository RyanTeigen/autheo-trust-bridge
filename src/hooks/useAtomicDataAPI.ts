
import { useState } from 'react';
import { AtomicStorageService } from '../services/atomic/AtomicStorageService';
import { AtomicValue } from '../services/atomic/types';

const atomicStorage = new AtomicStorageService();

export const useAtomicDataAPI = () => {
  const [loading, setLoading] = useState(false);

  const insertVitalSigns = async (recordId: string, vitals: Record<string, number>) => {
    setLoading(true);
    
    try {
      const results = [];
      
      // Convert each vital sign to an atomic value and store it
      for (const [key, value] of Object.entries(vitals)) {
        const atomicValue: AtomicValue = {
          data_type: key,
          value: value,
          unit: getUnitForVitalType(key),
          metadata: {
            source: 'manual_entry',
            recorded_at: new Date().toISOString()
          }
        };
        
        const result = await atomicStorage.storeAtomicValue(recordId, atomicValue);
        results.push(result);
      }
      
      // Check if all insertions were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        return { success: true };
      } else {
        const failedResults = results.filter(result => !result.success);
        return { 
          success: false, 
          error: `Some vitals failed to save: ${failedResults.map(r => r.error).join(', ')}` 
        };
      }
    } catch (error) {
      console.error('Error inserting vital signs:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const insertAtomicData = async (recordId: string, data: Record<string, string | number>) => {
    setLoading(true);
    
    try {
      const results = [];
      
      // Convert each data point to an atomic value and store it
      for (const [key, value] of Object.entries(data)) {
        const atomicValue: AtomicValue = {
          data_type: key,
          value: value,
          unit: getUnitForDataType(key),
          metadata: {
            source: 'api_entry',
            recorded_at: new Date().toISOString()
          }
        };
        
        const result = await atomicStorage.storeAtomicValue(recordId, atomicValue);
        results.push(result);
      }
      
      // Check if all insertions were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        return { success: true };
      } else {
        const failedResults = results.filter(result => !result.success);
        return { 
          success: false, 
          error: `Some data failed to save: ${failedResults.map(r => r.error).join(', ')}` 
        };
      }
    } catch (error) {
      console.error('Error inserting atomic data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const insertGlucoseData = async (recordId: string, glucoseData: Record<string, string | number>) => {
    setLoading(true);
    
    try {
      const results = [];
      
      // Convert glucose data to atomic values
      for (const [key, value] of Object.entries(glucoseData)) {
        const atomicValue: AtomicValue = {
          data_type: key,
          value: value,
          unit: getUnitForGlucoseType(key),
          metadata: {
            source: 'glucose_monitor',
            recorded_at: new Date().toISOString()
          }
        };
        
        const result = await atomicStorage.storeAtomicValue(recordId, atomicValue);
        results.push(result);
      }
      
      // Check if all insertions were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        return { success: true };
      } else {
        const failedResults = results.filter(result => !result.success);
        return { 
          success: false, 
          error: `Some glucose data failed to save: ${failedResults.map(r => r.error).join(', ')}` 
        };
      }
    } catch (error) {
      console.error('Error inserting glucose data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    insertVitalSigns,
    insertAtomicData,
    insertGlucoseData,
    loading
  };
};

// Helper function to get appropriate units for different vital types
function getUnitForVitalType(vitalType: string): string {
  const unitMap: Record<string, string> = {
    'systolic_bp': 'mmHg',
    'diastolic_bp': 'mmHg',
    'heart_rate': 'bpm',
    'temperature': '°F',
    'respiratory_rate': 'breaths/min',
    'oxygen_saturation': '%'
  };
  
  return unitMap[vitalType] || '';
}

// Helper function to get appropriate units for different data types
function getUnitForDataType(dataType: string): string {
  const unitMap: Record<string, string> = {
    'glucose': 'mg/dL',
    'weight': 'lbs',
    'height': 'in',
    'bmi': 'kg/m²',
    'systolic_bp': 'mmHg',
    'diastolic_bp': 'mmHg',
    'heart_rate': 'bpm',
    'temperature': '°F',
    'respiratory_rate': 'breaths/min',
    'oxygen_saturation': '%'
  };
  
  return unitMap[dataType] || '';
}

// Helper function to get appropriate units for glucose-related data
function getUnitForGlucoseType(glucoseType: string): string {
  const unitMap: Record<string, string> = {
    'glucose': 'mg/dL',
    'hba1c': '%',
    'insulin': 'units'
  };
  
  return unitMap[glucoseType] || '';
}
