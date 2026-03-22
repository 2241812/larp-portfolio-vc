"use client";
import React, { useRef, useEffect } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function KeyboardModel({ isSettled, activeSection = "", isTransitioning = false }: any) {
  const { scene, nodes } = useGLTF('/models/keyboard.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  const targetRotY = useRef<number | null>(null);
  
  const pressedKeys = useRef<Set<string>>(new Set());
  const initialPositions = useRef<Record<string, number>>({});

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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isFloating = !isSettled || isTransitioning;

    const targetScale = isFloating ? 9.5 : (activeSection ? 9.5 : 15.0);
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.04);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.04);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.04);

    const targetPosX = activeSection ? -1.5 : 0;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.03);

    const targetPosY = isFloating ? 1.2 : (activeSection ? -0.2 : 0.45);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.03);

    if (!isFloating) {
      if (targetRotY.current === null) {
        const currentY = groupRef.current.rotation.y;
        const spinSpeed = 0.01 + (state.pointer.x * 0.08);
        if (spinSpeed >= 0) targetRotY.current = Math.ceil(currentY / (Math.PI * 2)) * (Math.PI * 2);
        else targetRotY.current = Math.floor(currentY / (Math.PI * 2)) * (Math.PI * 2);
      }

      const finalRotX = activeSection ? 0.7 : 0.4;
      const finalRotY = activeSection ? (targetRotY.current + Math.PI / 8) : targetRotY.current;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, finalRotX, 0.025);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, finalRotY, 0.025);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.025);

      Object.entries(keyMap).forEach(([keyCode, nodeName]) => {
        if (nodeName && nodes[nodeName] && initialPositions.current[nodeName] !== undefined) {
          const node = nodes[nodeName];
          const basePosY = initialPositions.current[nodeName];
          const isPressed = pressedKeys.current.has(keyCode);
          const targetKeyY = isPressed ? basePosY - 0.02 : basePosY;
          node.position.y = THREE.MathUtils.lerp(node.position.y, targetKeyY, 0.3);
        }
      });

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
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/models/keyboard.glb');