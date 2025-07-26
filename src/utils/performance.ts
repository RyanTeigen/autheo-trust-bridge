// Bundle size analysis and optimization utilities
import { logger } from '@/utils/logging';

export interface BundleMetrics {
  totalSize: number;
  compressedSize: number;
  chunkCount: number;
  largestChunks: Array<{
    name: string;
    size: number;
    compressed: number;
  }>;
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  
  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Analyze current bundle size using Resource Timing API
  public analyzeBundleSize(): BundleMetrics {
    if (typeof window === 'undefined' || !window.performance) {
      return this.getDefaultMetrics();
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => 
      r.name.includes('.js') && 
      !r.name.includes('node_modules') &&
      !r.name.includes('cdn')
    );

    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const compressedSize = jsResources.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0);

    const largestChunks = jsResources
      .map(r => ({
        name: this.extractChunkName(r.name),
        size: r.transferSize || 0,
        compressed: r.encodedBodySize || 0
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    const metrics: BundleMetrics = {
      totalSize,
      compressedSize,
      chunkCount: jsResources.length,
      largestChunks
    };

    // Log bundle size warnings
    this.checkBundleSizeThresholds(metrics);

    return metrics;
  }

  private extractChunkName(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0]; // Remove query params
  }

  private checkBundleSizeThresholds(metrics: BundleMetrics): void {
    const maxTotalSize = 500 * 1024; // 500KB
    const maxChunkSize = 100 * 1024; // 100KB per chunk

    if (metrics.totalSize > maxTotalSize) {
      logger.warn('Bundle size exceeds recommended threshold', {
        current: `${Math.round(metrics.totalSize / 1024)}KB`,
        recommended: `${Math.round(maxTotalSize / 1024)}KB`,
        overage: `${Math.round((metrics.totalSize - maxTotalSize) / 1024)}KB`
      });
    }

    metrics.largestChunks.forEach(chunk => {
      if (chunk.size > maxChunkSize) {
        logger.warn('Large chunk detected', {
          chunk: chunk.name,
          size: `${Math.round(chunk.size / 1024)}KB`,
          recommended: `${Math.round(maxChunkSize / 1024)}KB`
        });
      }
    });
  }

  private getDefaultMetrics(): BundleMetrics {
    return {
      totalSize: 0,
      compressedSize: 0,
      chunkCount: 0,
      largestChunks: []
    };
  }

  // Generate optimization recommendations
  public getOptimizationRecommendations(metrics: BundleMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.totalSize > 500 * 1024) {
      recommendations.push('Consider implementing code splitting for large components');
      recommendations.push('Enable gzip/brotli compression on your server');
    }

    if (metrics.chunkCount < 3) {
      recommendations.push('Consider splitting your bundle into smaller chunks');
    }

    const hasLargeChunks = metrics.largestChunks.some(c => c.size > 100 * 1024);
    if (hasLargeChunks) {
      recommendations.push('Large chunks detected - consider lazy loading for non-critical components');
    }

    const compressionRatio = metrics.compressedSize / metrics.totalSize;
    if (compressionRatio > 0.7) {
      recommendations.push('Poor compression ratio - check for duplicate dependencies');
    }

    return recommendations;
  }

  // Monitor bundle size in production
  public startBundleMonitoring(): void {
    // Run analysis after page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const metrics = this.analyzeBundleSize();
          const recommendations = this.getOptimizationRecommendations(metrics);
          
          logger.info('Bundle analysis complete', {
            metrics,
            recommendations: recommendations.length > 0 ? recommendations : ['No optimization needed']
          });
        }, 2000); // Wait 2s for all resources to load
      });
    }
  }
}

// Create and export singleton
export const bundleAnalyzer = BundleAnalyzer.getInstance();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  bundleAnalyzer.startBundleMonitoring();
}