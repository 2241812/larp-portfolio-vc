"use client";
import { memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import KeyboardModel from './KeyboardModel';

interface SceneProps {
  isSettled: boolean;
}

const Scene = memo(function Scene({ isSettled }: SceneProps) {
  return (
    <div className="w-full h-full fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ 
          powerPreference: 'high-performance',
          antialias: false,
          alpha: true,
        }}
        onCreated={(state) => {
          state.gl.setClearColor(0x000000, 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="city" />
        
        {!isSettled && (
          <>
            <KeyboardModel isSettled={isSettled} />
            <ContactShadows position={[0, -0.3, 0]} opacity={0.6} scale={15} blur={2.5} far={4} />
          </>
        )}
      </Canvas>
    </div>
  );
});

export default Scene;