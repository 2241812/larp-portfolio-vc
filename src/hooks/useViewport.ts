"use client";
import { useState, useEffect } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  scale: number; // Scale factor for 3D models
}

/**
 * Hook to track viewport size and provide responsive scale factor
 * Mobile: scale < 0.7
 * Tablet: scale 0.7-1.0
 * Desktop: scale >= 1.0
 */
export function useViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    scale: 1,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine breakpoints and scale
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;
      let scale = 1;

      if (width < 640) {
        // Mobile: < 640px
        isMobile = true;
        isTablet = false;
        isDesktop = false;
        scale = 0.45;
      } else if (width < 1024) {
        // Tablet: 640px - 1024px
        isMobile = false;
        isTablet = true;
        isDesktop = false;
        scale = 0.7;
      } else {
        // Desktop: >= 1024px
        scale = 1.0;
      }

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        scale,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
