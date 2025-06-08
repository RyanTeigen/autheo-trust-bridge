
import { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false
  });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPreferences(prev => ({ ...prev, reduceMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reduceMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for high contrast
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPreferences(prev => ({ ...prev, highContrast: highContrastQuery.matches }));

    // Check for screen reader
    const screenReaderDetected = window.navigator.userAgent.includes('NVDA') || 
                                 window.navigator.userAgent.includes('JAWS') ||
                                 !!document.querySelector('[aria-hidden]');
    
    setPreferences(prev => ({ ...prev, screenReader: screenReaderDetected }));

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const updatePreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Apply CSS classes or other changes based on preferences
    if (key === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value);
    }
    if (key === 'largeText') {
      document.documentElement.classList.toggle('large-text', value);
    }
    if (key === 'reduceMotion') {
      document.documentElement.classList.toggle('reduce-motion', value);
    }
  };

  return {
    preferences,
    updatePreference
  };
};
