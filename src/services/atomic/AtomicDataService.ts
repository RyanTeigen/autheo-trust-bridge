
import { AtomicStorageService } from './AtomicStorageService';
import { AtomicDecomposerService } from './AtomicDecomposerService';
import { AtomicAnalyticsService } from './AtomicAnalyticsService';
import { AtomicValue, AtomicStoreResult, AtomicServiceResult, AtomicDecompositionResult, AtomicDataPoint, HomomorphicAnalyticsData } from './types';

export class AtomicDataService {
  private storageService = new AtomicStorageService();
  private decomposerService = new AtomicDecomposerService();
  private analyticsService = new AtomicAnalyticsService();

  // Storage operations
  async storeAtomicValue(recordId: string, atomicValue: AtomicValue): Promise<AtomicStoreResult> {
    return this.storageService.storeAtomicValue(recordId, atomicValue);
  }

  async getAtomicValuesForRecord(recordId: string): Promise<AtomicServiceResult<(AtomicDataPoint & { decrypted_value?: string })[]>> {
    return this.storageService.getAtomicValuesForRecord(recordId);
  }

  async getAtomicValuesByType(dataType: string, limit = 100): Promise<AtomicServiceResult<AtomicDataPoint[]>> {
    return this.storageService.getAtomicValuesByType(dataType, limit);
  }

  // Decomposition operations
  async decomposeToAtomicValues(recordId: string, medicalData: any): Promise<AtomicDecompositionResult> {
    return this.decomposerService.decomposeToAtomicValues(recordId, medicalData);
  }

  // Analytics operations
  async getHomomorphicAnalyticsData(dataType: string): Promise<AtomicServiceResult<HomomorphicAnalyticsData>> {
    return this.analyticsService.getHomomorphicAnalyticsData(dataType);
  }
}

export const atomicDataService = new AtomicDataService();

// Re-export types for backward compatibility
export type { AtomicDataPoint, AtomicValue } from './types';
