"use client";
import React, { useRef } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function KeyboardModel({ isSettled }: any) {
  const { scene, nodes } = useGLTF('/models/keyboard.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  
  const targetRotY = useRef<number | null>(null);

  // 🔍 Check your browser console for this log!
  console.log("🔍 NEW KEYBOARD NODES:", nodes);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. MASSIVE 15x SCALE
    // Settles at 15.0, and shrinks to 9.75 while loading/spinning
    const targetScale = isSettled ? 15.0 : 9.75;
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.03);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.03);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.03);

    // 2. YOUR EXACT POSITIONING 
    const targetPosY = isSettled ? 0.45 : 1.0;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.025);

    if (isSettled) {
      if (targetRotY.current === null) {
        const currentY = groupRef.current.rotation.y;
        const spinSpeed = 0.01 + (state.pointer.x * 0.08);
        
        if (spinSpeed >= 0) {
          targetRotY.current = Math.ceil(currentY / (Math.PI * 2)) * (Math.PI * 2);
        } else {
          targetRotY.current = Math.floor(currentY / (Math.PI * 2)) * (Math.PI * 2);
        }
      }

      // Elegant laydown 
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.4, 0.025);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY.current, 0.025);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.025);
    } else {
      targetRotY.current = null;
      
      const spinSpeed = 0.01 + (state.pointer.x * 0.08);
      groupRef.current.rotation.y += spinSpeed;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.5, 0.05);
      groupRef.current.rotation.z += 0.003; 
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        {/* Safely rendering the new 3D file */}
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/models/keyboard.glb');