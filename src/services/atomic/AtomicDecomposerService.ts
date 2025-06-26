
import { AtomicStorageService } from './AtomicStorageService';
import { AtomicValue, AtomicDecompositionResult } from './types';

export class AtomicDecomposerService {
  private storageService = new AtomicStorageService();

  /**
   * Break down complex medical data into atomic values
   */
  async decomposeToAtomicValues(recordId: string, medicalData: any): Promise<AtomicDecompositionResult> {
    try {
      const atomicValues: AtomicValue[] = [];

      // Parse different types of medical data into atomic values
      if (medicalData.vitals) {
        this.extractVitalsData(medicalData.vitals, medicalData.timestamp, atomicValues);
      }

      if (medicalData.lab_results) {
        this.extractLabResults(medicalData.lab_results, medicalData.timestamp, atomicValues);
      }

      // Store all atomic values
      const results = await Promise.all(
        atomicValues.map(value => this.storageService.storeAtomicValue(recordId, value))
      );

      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.error('Some atomic values failed to store:', failures);
        return { 
          success: false, 
          error: `${failures.length} atomic values failed to store` 
        };
      }

      return { success: true, atomicCount: atomicValues.length };
    } catch (error) {
      console.error('Failed to decompose to atomic values:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private extractVitalsData(vitals: any, timestamp: string, atomicValues: AtomicValue[]): void {
    if (vitals.blood_pressure) {
      const bp = vitals.blood_pressure;
      if (bp.systolic) {
        atomicValues.push({
          data_type: 'blood_pressure_systolic',
          value: bp.systolic,
          unit: 'mmHg',
          metadata: { category: 'vitals', timestamp }
        });
      }
      if (bp.diastolic) {
        atomicValues.push({
          data_type: 'blood_pressure_diastolic',
          value: bp.diastolic,
          unit: 'mmHg',
          metadata: { category: 'vitals', timestamp }
        });
      }
    }

    if (vitals.heart_rate) {
      atomicValues.push({
        data_type: 'heart_rate',
        value: vitals.heart_rate,
        unit: 'bpm',
        metadata: { category: 'vitals', timestamp }
      });
    }

    if (vitals.temperature) {
      atomicValues.push({
        data_type: 'temperature',
        value: vitals.temperature,
        unit: '°F',
        metadata: { category: 'vitals', timestamp }
      });
    }
  }

  private extractLabResults(labResults: any, timestamp: string, atomicValues: AtomicValue[]): void {
    Object.entries(labResults).forEach(([key, result]: [string, any]) => {
      if (result.value !== undefined) {
        atomicValues.push({
          data_type: `lab_${key}`,
          value: result.value,
          unit: result.unit,
          metadata: { 
            category: 'lab_results', 
            timestamp,
            normal_range: result.normal_range
          }
        });
      }
    });
  }
}
