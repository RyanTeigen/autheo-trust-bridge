
import { SystemMonitor } from './SystemMonitor';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private isMonitoring: boolean = false;
  private systemMonitor: SystemMonitor;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
  }

  public startMonitoring(): void {
    this.isMonitoring = true;
    console.log('Performance monitoring started');
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  public async measureComponentRender(
    componentName: string,
    renderFunction: () => void | Promise<void>
  ): Promise<void> {
    if (!this.isMonitoring) return;

    const startTime = performance.now();
    
    try {
      await renderFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metric: PerformanceMetric = {
        name: `component_render_${componentName}`,
        startTime,
        endTime,
        duration,
        metadata: { componentName, type: 'render' }
      };

      this.metrics.push(metric);
      
      // Record to system monitor
      await this.systemMonitor.recordMetric(
        'performance',
        duration,
        'ms',
        { component: componentName, operation: 'render' },
        duration > 100 ? 'medium' : 'low'
      );

      console.log(`Component ${componentName} rendered in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error(`Error measuring component render for ${componentName}:`, error);
    }
  }

  public async measureAPICall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T | null> {
    if (!this.isMonitoring) {
      return await apiCall();
    }

    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metric: PerformanceMetric = {
        name: `api_call_${endpoint}`,
        startTime,
        endTime,
        duration,
        metadata: { endpoint, method, type: 'api_call' }
      };

      this.metrics.push(metric);
      
      // Record to system monitor
      await this.systemMonitor.recordAPIResponse(endpoint, method, duration, 200);

      console.log(`API call ${method} ${endpoint} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`API call failed for ${method} ${endpoint}:`, error);
      
      // Record error to system monitor
      await this.systemMonitor.recordError(
        'api_error',
        `API call failed: ${method} ${endpoint}`,
        { endpoint, method, duration, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      return null;
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageRenderTime(componentName?: string): number {
    const renderMetrics = this.metrics.filter(m => 
      m.name.startsWith('component_render') && 
      (!componentName || m.metadata?.componentName === componentName)
    );
    
    if (renderMetrics.length === 0) return 0;
    
    const totalDuration = renderMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / renderMetrics.length;
  }

  public getAverageAPIResponseTime(endpoint?: string): number {
    const apiMetrics = this.metrics.filter(m => 
      m.name.startsWith('api_call') && 
      (!endpoint || m.metadata?.endpoint === endpoint)
    );
    
    if (apiMetrics.length === 0) return 0;
    
    const totalDuration = apiMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / apiMetrics.length;
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}

export default PerformanceMonitor;
