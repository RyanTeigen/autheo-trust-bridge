
import { useEffect, useCallback } from 'react';
import { useSystemMonitoring } from './useSystemMonitoring';

export const useUXMonitoring = () => {
  const { systemMonitor } = useSystemMonitoring();

  // Track page interactions
  const trackInteraction = useCallback((elementType: string, elementId?: string, additionalData?: Record<string, any>) => {
    systemMonitor?.recordUXEvent('interaction', {
      element_type: elementType,
      element_id: elementId,
      ...additionalData
    });
  }, [systemMonitor]);

  // Track navigation events
  const trackNavigation = useCallback((from: string, to: string, method: 'click' | 'keyboard' | 'programmatic' = 'click') => {
    systemMonitor?.recordUXEvent('navigation', {
      from_route: from,
      to_route: to,
      navigation_method: method
    });
  }, [systemMonitor]);

  // Track accessibility events
  const trackAccessibility = useCallback((action: string, feature: string, success: boolean) => {
    systemMonitor?.recordUXEvent('accessibility', {
      action,
      feature,
      success,
      user_agent: navigator.userAgent
    }, success ? 'low' : 'medium');
  }, [systemMonitor]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    systemMonitor?.recordUXEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      url: window.location.href
    }, 'high');
  }, [systemMonitor]);

  // Auto-track page load performance
  useEffect(() => {
    const trackPageLoad = () => {
      if ('navigation' in performance) {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Fix: Use proper PerformanceNavigationTiming properties
        systemMonitor?.recordUXEvent('navigation', {
          page_load_time: navTiming.loadEventEnd - navTiming.fetchStart,
          dom_content_loaded: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
          first_paint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
          largest_contentful_paint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0
        });
      }
    };

    // Track after page loads
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [systemMonitor]);

  return {
    trackInteraction,
    trackNavigation,
    trackAccessibility,
    trackError
  };
};
