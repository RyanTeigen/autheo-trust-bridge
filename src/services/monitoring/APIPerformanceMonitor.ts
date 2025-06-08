
import SystemMonitor from './SystemMonitor';

export class APIPerformanceMonitor {
  private systemMonitor: SystemMonitor;

  constructor(systemMonitor: SystemMonitor) {
    this.systemMonitor = systemMonitor;
  }

  // Monitor API call performance
  measureAPICall = async <T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let statusCode = 200;
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      statusCode = 500;
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      await this.systemMonitor.recordAPIResponse(
        endpoint,
        method,
        responseTime,
        statusCode
      );
    }
  };
}

export default APIPerformanceMonitor;
