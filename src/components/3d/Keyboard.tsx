"use client";
import { useGLTF, Center } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// We pass in setHovered and hovered as props now so the UI can use them too!
export default function Keyboard({ hovered, setHovered }: { hovered: boolean, setHovered: (v: boolean) => void }) {
  const { scene } = useGLTF('/models/keyboard.glb');
  const keyboardRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  // useFrame runs 60 times per second for smooth animations
  useFrame((state, delta) => {
    if (!keyboardRef.current) return;

    // 1. Safe scaling (Modifying XYZ directly instead of creating new Vectors every frame)
    const targetScale = hovered ? 0.015 : 0.01;
    keyboardRef.current.scale.x = THREE.MathUtils.lerp(keyboardRef.current.scale.x, targetScale, 0.1);
    keyboardRef.current.scale.y = THREE.MathUtils.lerp(keyboardRef.current.scale.y, targetScale, 0.1);
    keyboardRef.current.scale.z = THREE.MathUtils.lerp(keyboardRef.current.scale.z, targetScale, 0.1);

    if (hovered) {
      // CALM DOWN MODE: Smoothly lock into a readable, tilted position
      keyboardRef.current.rotation.x = THREE.MathUtils.lerp(keyboardRef.current.rotation.x, 0.4, 0.1);
      keyboardRef.current.rotation.y = THREE.MathUtils.lerp(keyboardRef.current.rotation.y, 0, 0.1);
      keyboardRef.current.rotation.z = THREE.MathUtils.lerp(keyboardRef.current.rotation.z, 0, 0.1);
    } else {
      // WILD GLOBE MODE: Fast, chaotic spinning! 
      // (Using fixed numbers instead of 'delta' prevents first-frame explosions)
      keyboardRef.current.rotation.x += 0.02; 
      keyboardRef.current.rotation.y += 0.025; 
      keyboardRef.current.rotation.z += 0.015; 
    }
  });
  
  return (
    <Center>
      <primitive 
        ref={keyboardRef}
        object={scene} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => alert("Ready to open the resume panels!")}
      />
    </Center>
  );
}