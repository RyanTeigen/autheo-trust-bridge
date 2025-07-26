import { useState, useEffect, useCallback } from 'react';
import { useUXMonitoring } from './useUXMonitoring';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { trackInteraction, trackAccessibility } = useUXMonitoring();

  // Check if fullscreen is supported
  const isFullscreenSupported = () => {
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );
  };

  // Get current fullscreen element
  const getFullscreenElement = () => {
    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  };

  // Enter fullscreen
  const enterFullscreen = useCallback(async (element: HTMLElement = document.documentElement) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      trackInteraction('fullscreen', 'fullscreen-enter', { success: true });
      trackAccessibility('fullscreen_enter', 'navigation', true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      trackInteraction('fullscreen', 'fullscreen-enter', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      trackAccessibility('fullscreen_enter', 'navigation', false);
    }
  }, [trackInteraction, trackAccessibility]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      trackInteraction('fullscreen', 'fullscreen-exit', { success: true });
      trackAccessibility('fullscreen_exit', 'navigation', true);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      trackInteraction('fullscreen', 'fullscreen-exit', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      trackAccessibility('fullscreen_exit', 'navigation', false);
    }
  }, [trackInteraction, trackAccessibility]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen(element);
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = getFullscreenElement();
      setIsFullscreen(!!fullscreenElement);
    };

    // Add event listeners for different browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 key for fullscreen toggle
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
      
      // ESC key to exit fullscreen
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, exitFullscreen, isFullscreen]);

  return {
    isFullscreen,
    isFullscreenSupported: isFullscreenSupported(),
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    fullscreenElement: getFullscreenElement()
  };
};