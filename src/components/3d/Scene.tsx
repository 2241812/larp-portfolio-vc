"use client";
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import KeyboardModel from './KeyboardModel';

interface SceneProps {
  isSettled: boolean;
}

export default function Scene({ isSettled }: SceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} />
        <pointLight position={[-5, 3, -3]} intensity={0.5} color="#22d3ee" />
        <Environment preset="city" />
        <KeyboardModel isSettled={isSettled} />
        <ContactShadows position={[0, -0.3, 0]} opacity={0.6} scale={5} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
}
