
import { debugLog, isDevelopment } from './production';

export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  otherSize: number;
  resourceCount: number;
  loadTime: number;
}

export class BundleAnalyzer {
  public static analyzeBundleSize(): BundleMetrics {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let fontSize = 0;
    let otherSize = 0;
    let totalLoadTime = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      const loadTime = resource.responseEnd - resource.requestStart;
      
      totalSize += size;
      totalLoadTime += loadTime;

      if (resource.name.includes('.js')) {
        jsSize += size;
      } else if (resource.name.includes('.css')) {
        cssSize += size;
      } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        imageSize += size;
      } else if (resource.name.match(/\.(woff|woff2|ttf|eot)$/)) {
        fontSize += size;
      } else {
        otherSize += size;
      }
    });

    const metrics: BundleMetrics = {
      totalSize,
      jsSize,
      cssSize,
      imageSize,
      fontSize,
      otherSize,
      resourceCount: resources.length,
      loadTime: totalLoadTime
    };

    if (isDevelopment()) {
      debugLog('Bundle Analysis', {
        ...metrics,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        jsSizeMB: (jsSize / 1024 / 1024).toFixed(2),
        cssSizeMB: (cssSize / 1024 / 1024).toFixed(2)
      });
    }

    return metrics;
  }

  public static getPerformanceRecommendations(metrics: BundleMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.jsSize > 1000000) { // > 1MB
      recommendations.push('Consider code splitting to reduce JavaScript bundle size');
    }

    if (metrics.cssSize > 200000) { // > 200KB
      recommendations.push('Consider CSS optimization and unused style removal');
    }

    if (metrics.imageSize > 2000000) { // > 2MB
      recommendations.push('Optimize images with compression and modern formats');
    }

    if (metrics.resourceCount > 100) {
      recommendations.push('Consider bundling resources to reduce HTTP requests');
    }

    if (metrics.loadTime > 5000) { // > 5 seconds
      recommendations.push('Overall load time is high, consider performance optimization');
    }

    return recommendations;
  }

  public static reportBundleMetrics(): void {
    if (!isDevelopment()) return;

    const metrics = this.analyzeBundleSize();
    const recommendations = this.getPerformanceRecommendations(metrics);

    console.group('📊 Bundle Analysis Report');
    console.log('📦 Total Bundle Size:', (metrics.totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('🔧 JavaScript:', (metrics.jsSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('🎨 CSS:', (metrics.cssSize / 1024).toFixed(2), 'KB');
    console.log('🖼️ Images:', (metrics.imageSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('📝 Resources:', metrics.resourceCount);
    console.log('⏱️ Load Time:', (metrics.loadTime / 1000).toFixed(2), 'seconds');
    
    if (recommendations.length > 0) {
      console.group('💡 Recommendations');
      recommendations.forEach(rec => console.log('•', rec));
      console.groupEnd();
    }
    console.groupEnd();
  }
}
