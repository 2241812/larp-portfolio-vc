"use client";
import { ReactNode, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

// Component that exposes Lenis instance to window for navigation
function LenisExposer() {
  const lenis = useLenis();
  
  useEffect(() => {
    if (lenis) {
      (window as unknown as { lenis: typeof lenis }).lenis = lenis;
    }
    return () => {
      delete (window as unknown as { lenis?: typeof lenis }).lenis;
    };
  }, [lenis]);
  
  return null;
}

interface LenisProviderProps {
  children: ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1 }} autoRaf={true}>
      <LenisExposer />
      {children}
    </ReactLenis>
  );
}
