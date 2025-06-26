
import { AtomicStorageService } from './AtomicStorageService';
import { AtomicServiceResult, HomomorphicAnalyticsData } from './types';

export class AtomicAnalyticsService {
  private storageService = new AtomicStorageService();

  /**
   * Get analytics data for homomorphic encryption operations
   */
  async getHomomorphicAnalyticsData(dataType: string): Promise<AtomicServiceResult<HomomorphicAnalyticsData>> {
    try {
      const result = await this.storageService.getAtomicValuesByType(dataType, 1000);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            dataType,
            encryptedValues: result.data.map(point => point.enc_value),
            metadata: result.data.map(point => point.metadata),
            count: result.data.length
          }
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error getting homomorphic analytics data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
