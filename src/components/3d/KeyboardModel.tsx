"use client";
import React, { useRef, useEffect } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function KeyboardModel({ isSettled }: any) {
  const { scene, nodes } = useGLTF('/models/keyboard.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  const targetRotY = useRef<number | null>(null);
  const scrollProgress = useRef(0);
  
  const pressedKeys = useRef<Set<string>>(new Set());
  const initialPositions = useRef<Record<string, number>>({});
  
  const keyboardBounce = useRef({ velocity: 0, displacement: 0, lastKeyPressTime: 0 });
  const BOUNCE_STIFFNESS = 800;
  const BOUNCE_DAMPING = 20;
  const BOUNCE_DEPTH = 0.015;
  const BOUNCE_THRESHOLD = 100;

  const keyMap: Record<string, string> = {
    'Digit1': 'Object_104', 'Digit2': 'Object_106', 'Digit3': 'Object_108', 'Digit4': 'Object_110', 'Digit5': 'Object_112', 'Digit6': 'Object_114', 'Digit7': 'Object_116', 'Digit8': 'Object_118', 'Digit9': 'Object_120', 'Digit0': 'Object_122', 'Minus': 'Object_124', 'Backspace': 'Object_98', 'KeyQ': 'Object_74', 'KeyW': 'Object_166', 'KeyE': 'Object_168', 'KeyR': 'Object_170', 'KeyT': 'Object_172', 'KeyY': 'Object_174', 'KeyU': 'Object_176', 'KeyI': 'Object_178', 'KeyO': 'Object_180', 'KeyP': 'Object_182', 'KeyA': 'Object_68', 'KeyS': 'Object_128', 'KeyD': 'Object_130', 'KeyF': 'Object_132', 'KeyG': 'Object_134', 'KeyH': 'Object_136', 'KeyJ': 'Object_138', 'KeyK': 'Object_140', 'KeyL': 'Object_142', 'Enter': 'Object_100', 'KeyZ': 'Object_70', 'KeyX': 'Object_148', 'KeyC': 'Object_150', 'KeyV': 'Object_152', 'KeyB': 'Object_154', 'KeyN': 'Object_156', 'KeyM': 'Object_158', 'Comma': 'Object_160', 'Period': 'Object_162', 'Slash': 'Object_164', 'Space': 'Object_80'
  };

  useEffect(() => {
    Object.values(keyMap).forEach((nodeName) => {
      if (nodeName && nodes[nodeName]) {
        initialPositions.current[nodeName] = nodes[nodeName].position.y;
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => pressedKeys.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => pressedKeys.current.delete(e.code);
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = totalScroll > 0 ? window.scrollY / totalScroll : 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [nodes]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const p = scrollProgress.current;
    
    let targetScale = isSettled ? 15.0 : 9.75;
    let targetPosX = 0;
    let targetPosY = isSettled ? 0.45 : 1.0;
    let targetRotX = 0.4;
    
    if (isSettled && targetRotY.current === null) {
      const currentY = groupRef.current.rotation.y;
      targetRotY.current = Math.ceil(currentY / (Math.PI * 2)) * (Math.PI * 2);
    }

    let finalRotY = targetRotY.current || 0;

    if (isSettled) {
      const breath = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      const fadeOutFactor = Math.min(p * 5, 1); 
      
      targetScale = THREE.MathUtils.lerp(15.0, 0.1, fadeOutFactor);
      targetPosY = THREE.MathUtils.lerp(0.45 + breath, -5.0, fadeOutFactor);
      targetRotX = THREE.MathUtils.lerp(0.4, -2.0, fadeOutFactor);
      finalRotY += p * Math.PI * 8; 
    }

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.08);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.08);

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.08);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.08);

    if (isSettled) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, finalRotY, 0.08);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.08);

      if (p < 0.1) {
        const now = Date.now();
        if (pressedKeys.current.size > 0 && now - keyboardBounce.current.lastKeyPressTime > BOUNCE_THRESHOLD) {
          keyboardBounce.current.velocity -= 0.003;
          keyboardBounce.current.lastKeyPressTime = now;
        }
        
        const targetBounce = 0;
        const springForce = -BOUNCE_STIFFNESS * (keyboardBounce.current.displacement - targetBounce);
        const dampingForce = -BOUNCE_DAMPING * keyboardBounce.current.velocity;
        const acceleration = springForce + dampingForce;
        
        keyboardBounce.current.velocity += acceleration * delta;
        keyboardBounce.current.displacement += keyboardBounce.current.velocity * delta;
        
        if (Math.abs(keyboardBounce.current.velocity) < 0.00005 && Math.abs(keyboardBounce.current.displacement) < 0.00005) {
          keyboardBounce.current.displacement = 0;
          keyboardBounce.current.velocity = 0;
        }
        
        groupRef.current.position.y += keyboardBounce.current.displacement;
      }
    } else {
      const spinSpeed = 0.01 + (state.pointer.x * 0.08);
      groupRef.current.rotation.y += spinSpeed;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.5, 0.05);
      groupRef.current.rotation.z += 0.003; 
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/models/keyboard.glb');