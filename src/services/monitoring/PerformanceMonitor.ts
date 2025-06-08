
import SystemMonitor from './SystemMonitor';
import WebVitalsMonitor from './WebVitalsMonitor';
import NetworkMonitor from './NetworkMonitor';
import MemoryMonitor from './MemoryMonitor';
import ComponentPerformanceMonitor from './ComponentPerformanceMonitor';
import APIPerformanceMonitor from './APIPerformanceMonitor';
import PerformanceObserverManager from './PerformanceObserverManager';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private systemMonitor: SystemMonitor;
  private webVitalsMonitor: WebVitalsMonitor;
  private networkMonitor: NetworkMonitor;
  private memoryMonitor: MemoryMonitor;
  private componentPerformanceMonitor: ComponentPerformanceMonitor;
  private apiPerformanceMonitor: APIPerformanceMonitor;
  private performanceObserverManager: PerformanceObserverManager;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.webVitalsMonitor = new WebVitalsMonitor(this.systemMonitor);
    this.networkMonitor = new NetworkMonitor(this.systemMonitor);
    this.memoryMonitor = new MemoryMonitor(this.systemMonitor);
    this.componentPerformanceMonitor = new ComponentPerformanceMonitor(this.systemMonitor);
    this.apiPerformanceMonitor = new APIPerformanceMonitor(this.systemMonitor);
    this.performanceObserverManager = new PerformanceObserverManager(this.systemMonitor);
  }

  // Monitor React component render times
  measureComponentRender = async (
    componentName: string,
    renderFunction: () => void | Promise<void>
  ): Promise<void> => {
    return this.componentPerformanceMonitor.measureComponentRender(componentName, renderFunction);
  };

  // Monitor API call performance
  measureAPICall = async <T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return this.apiPerformanceMonitor.measureAPICall(endpoint, method, apiCall);
  };

  // Monitor memory usage
  measureMemoryUsage = async (): Promise<void> => {
    return this.memoryMonitor.measureMemoryUsage();
  };

  // Monitor Core Web Vitals
  measureWebVitals = (): void => {
    this.webVitalsMonitor.measureWebVitals();
  };

  // Monitor network performance
  measureNetworkPerformance = (): void => {
    this.networkMonitor.measureNetworkPerformance();
  };

  // Start periodic monitoring
  startMonitoring(): void {
    // Start periodic monitoring for memory and network
    this.memoryMonitor.startPeriodicMonitoring();
    this.networkMonitor.startPeriodicMonitoring();

    // Initialize web vitals monitoring
    this.measureWebVitals();
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.performanceObserverManager.stopMonitoring();
  }
}

export default PerformanceMonitor;
