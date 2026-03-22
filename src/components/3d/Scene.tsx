"use client";
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import KeyboardModel from './KeyboardModel';

interface SceneProps {
  isSettled: boolean;
  activeSection?: string;
  isTransitioning?: boolean;
}

export default function Scene({ isSettled, activeSection = "", isTransitioning = false }: SceneProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="city" />
        <KeyboardModel isSettled={isSettled} activeSection={activeSection} isTransitioning={isTransitioning} />
        <ContactShadows position={[0, -0.3, 0]} opacity={0.6} scale={5} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
}