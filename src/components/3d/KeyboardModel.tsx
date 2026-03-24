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
  
  const keyboardTilt = useRef({ rotX: 0, rotXVel: 0, rotZ: 0, rotZVel: 0 });
  const TILT_STIFFNESS = 600;
  const TILT_DAMPING = 18;
  const MAX_TILT = 0.04;
  
  const keyCenterX: Record<string, number> = {
    'Digit1': -0.35, 'Digit2': -0.3, 'Digit3': -0.25, 'Digit4': -0.2, 'Digit5': -0.15, 'Digit6': -0.1, 'Digit7': -0.05, 'Digit8': 0, 'Digit9': 0.05, 'Digit0': 0.1,
    'KeyQ': -0.25, 'KeyW': -0.2, 'KeyE': -0.15, 'KeyR': -0.1, 'KeyT': -0.05, 'KeyY': 0, 'KeyU': 0.05, 'KeyI': 0.1, 'KeyO': 0.15, 'KeyP': 0.2,
    'KeyA': -0.2, 'KeyS': -0.15, 'KeyD': -0.1, 'KeyF': -0.05, 'KeyG': 0, 'KeyH': 0.05, 'KeyJ': 0.1, 'KeyK': 0.15, 'KeyL': 0.2,
    'KeyZ': -0.15, 'KeyX': -0.1, 'KeyC': -0.05, 'KeyV': 0, 'KeyB': 0.05, 'KeyN': 0.1, 'KeyM': 0.15,
    'Space': 0,
  };

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
    
    let targetScale = isSettled ? 14.0 : 9.75;
    let targetPosX = 0;
    let targetPosY = isSettled ? 0.2 : 1.0;
    // Base rotation aligned with isometric view - subtle tilt to show keycaps
    let targetRotX = 0.35;
    
    if (isSettled && targetRotY.current === null) {
      const currentY = groupRef.current.rotation.y;
      targetRotY.current = Math.ceil(currentY / (Math.PI * 2)) * (Math.PI * 2);
    }

    let finalRotY = targetRotY.current || 0;

    if (isSettled) {
      const fadeOutFactor = Math.min(p * 5, 1); 
      
      targetScale = THREE.MathUtils.lerp(14.0, 0.1, fadeOutFactor);
      targetPosY = THREE.MathUtils.lerp(0.2, -5.0, fadeOutFactor);
      targetRotX = THREE.MathUtils.lerp(0.35, -2.0, fadeOutFactor);
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

      // Individual key movement when pressed
      let tiltX = 0;
      let tiltZ = 0;
      let keysPressed = 0;
      
      Object.entries(keyMap).forEach(([keyCode, nodeName]) => {
        if (nodeName && nodes[nodeName] && initialPositions.current[nodeName] !== undefined) {
          const node = nodes[nodeName];
          const basePosY = initialPositions.current[nodeName];
          const isPressed = pressedKeys.current.has(keyCode);
          
          if (isPressed) {
            keysPressed++;
            const keyX = keyCenterX[keyCode] || 0;
            tiltZ -= keyX * MAX_TILT;
            tiltX += MAX_TILT * 0.3;
          }
          
          const targetKeyY = isPressed ? basePosY - 0.008 : basePosY;
          node.position.y = THREE.MathUtils.lerp(node.position.y, targetKeyY, 0.3);
        }
      });
      
      if (keysPressed > 0) {
        const targetTiltX = Math.min(tiltX, MAX_TILT);
        const targetTiltZ = THREE.MathUtils.clamp(tiltZ, -MAX_TILT, MAX_TILT);
        
        const springX = -TILT_STIFFNESS * (keyboardTilt.current.rotX - targetTiltX);
        const dampX = -TILT_DAMPING * keyboardTilt.current.rotXVel;
        keyboardTilt.current.rotXVel += (springX + dampX) * delta;
        keyboardTilt.current.rotX += keyboardTilt.current.rotXVel * delta;
        
        const springZ = -TILT_STIFFNESS * (keyboardTilt.current.rotZ - targetTiltZ);
        const dampZ = -TILT_DAMPING * keyboardTilt.current.rotZVel;
        keyboardTilt.current.rotZVel += (springZ + dampZ) * delta;
        keyboardTilt.current.rotZ += keyboardTilt.current.rotZVel * delta;
      } else {
        const springX = -TILT_STIFFNESS * keyboardTilt.current.rotX;
        const dampX = -TILT_DAMPING * keyboardTilt.current.rotXVel;
        keyboardTilt.current.rotXVel += (springX + dampX) * delta;
        keyboardTilt.current.rotX += keyboardTilt.current.rotXVel * delta;
        
        const springZ = -TILT_STIFFNESS * keyboardTilt.current.rotZ;
        const dampZ = -TILT_DAMPING * keyboardTilt.current.rotZVel;
        keyboardTilt.current.rotZVel += (springZ + dampZ) * delta;
        keyboardTilt.current.rotZ += keyboardTilt.current.rotZVel * delta;
      }
      
      groupRef.current.rotation.x += keyboardTilt.current.rotX;
      groupRef.current.rotation.z += keyboardTilt.current.rotZ;
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
