"use client";
import { ReactNode, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

// Component that exposes Lenis instance to window for navigation
function LenisExposer() {
  const lenis = useLenis();
  
  useEffect(() => {
    if (lenis) {
      (window as unknown as { lenis: typeof lenis }).lenis = lenis;
      
      // Auto-resize on DOM changes so scroll doesn't glitch at the bottom
      const ro = new ResizeObserver(() => lenis.resize());
      ro.observe(document.body);
      
      return () => {
        ro.disconnect();
        delete (window as unknown as { lenis?: typeof lenis }).lenis;
      };
    }
  }, [lenis]);
  
  return null;
}

interface LenisProviderProps {
  children: ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.1, 
        smoothWheel: true, 
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        syncTouch: true,
        duration: 1.2
      }} 
      autoRaf={true}
    >
      <LenisExposer />
      {children}
    </ReactLenis>
  );
}
