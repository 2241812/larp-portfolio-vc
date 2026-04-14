"use client";
import { memo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import KeyboardModel from './KeyboardModel';
import TypingKeyboardModel from './TypingKeyboardModel';
import { useViewport } from '@/hooks/useViewport';

interface SceneProps {
  isSettled: boolean;
  isTypingMode?: boolean;
}

// Suppress THREE.Clock deprecation warning from @react-three/fiber
function SuppressClockWarning() {
  const { invalidate } = useThree();
  const lastTime = useRef<number>(0);
  
  useEffect(() => {
    lastTime.current = performance.now();
    let animationId: number;
    
    const animate = () => {
      lastTime.current = performance.now();
      invalidate();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [invalidate]);
  
  return null;
}

const Scene = memo(function Scene({ isSettled, isTypingMode = false }: SceneProps) {
  const viewport = useViewport();
  
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ 
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
        }}
        onCreated={(state) => {
          state.gl.setClearColor(0x000000, 0);
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Custom frame loop to avoid THREE.Clock deprecation warning */}
        <SuppressClockWarning />
        
        {/* Camera positioned responsively based on viewport */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2 * viewport.scale, 5 * viewport.scale]} 
          fov={45 + (1 - viewport.scale) * 20} 
        />
        
        {/* Enhanced lighting for dramatic effect */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#22d3ee" />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#22d3ee" distance={10} />
        
        <Environment preset="city" />
        
        <>
          {isTypingMode ? (
            <TypingKeyboardModel isSettled={isSettled} modelScale={viewport.scale} />
          ) : (
            <KeyboardModel isSettled={isSettled} modelScale={viewport.scale} />
          )}
          <ContactShadows 
            position={[0, -0.5, 0]} 
            opacity={0.8} 
            scale={20 * viewport.scale} 
            blur={2} 
            far={5}
            color="#22d3ee"
          />
        </>
      </Canvas>
    </div>
  );
});

export default Scene;
