"use client";
import React, { useRef, useEffect, memo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const KEY_MAP: Record<string, string> = {
  'Digit1': 'Object_104', 'Digit2': 'Object_106', 'Digit3': 'Object_108', 'Digit4': 'Object_110', 'Digit5': 'Object_112', 'Digit6': 'Object_114', 'Digit7': 'Object_116', 'Digit8': 'Object_118', 'Digit9': 'Object_120', 'Digit0': 'Object_122', 'Minus': 'Object_124', 'Backspace': 'Object_98', 'KeyQ': 'Object_74', 'KeyW': 'Object_166', 'KeyE': 'Object_168', 'KeyR': 'Object_170', 'KeyT': 'Object_172', 'KeyY': 'Object_174', 'KeyU': 'Object_176', 'KeyI': 'Object_178', 'KeyO': 'Object_180', 'KeyP': 'Object_182', 'KeyA': 'Object_68', 'KeyS': 'Object_128', 'KeyD': 'Object_130', 'KeyF': 'Object_132', 'KeyG': 'Object_134', 'KeyH': 'Object_136', 'KeyJ': 'Object_138', 'KeyK': 'Object_140', 'KeyL': 'Object_142', 'Enter': 'Object_100', 'KeyZ': 'Object_70', 'KeyX': 'Object_148', 'KeyC': 'Object_150', 'KeyV': 'Object_152', 'KeyB': 'Object_154', 'KeyN': 'Object_156', 'KeyM': 'Object_158', 'Comma': 'Object_160', 'Period': 'Object_162', 'Slash': 'Object_164', 'Space': 'Object_80'
};

const KeyboardModel = memo(function KeyboardModel({ isSettled, modelScale = 1 }: { isSettled: boolean; modelScale?: number }) {
  const { scene, nodes } = useGLTF('/models/keyboard.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  const targetRotY = useRef<number | null>(null);
  
  const pressedKeys = useRef<Set<string>>(new Set());
  const initialPositions = useRef<Record<string, number>>({});
  const keyHeights = useRef<Record<string, number>>({});
  const avgKeyHeight = useRef<number>(1);
  const PRESS_DEPTH = 0.015;

  useEffect(() => {
    Object.values(KEY_MAP).forEach((nodeName) => {
      if (nodeName && nodes[nodeName]) {
        initialPositions.current[nodeName] = nodes[nodeName].position.y;
      }
    });

    // Compute approximate key heights (used to normalize press depth)
    try {
      const heights: Record<string, number> = {};
      let sum = 0;
      let cnt = 0;

      Object.values(KEY_MAP).forEach((nodeName) => {
        const node = nodes[nodeName];
        if (!node) return;

        let maxHeight = 0;
        node.traverse((child: any) => {
          if (child.isMesh && child.geometry) {
            const geom = child.geometry as THREE.BufferGeometry;
            if (!geom.boundingBox) geom.computeBoundingBox();
            const box = geom.boundingBox!;
            const size = new THREE.Vector3();
            box.getSize(size);
            maxHeight = Math.max(maxHeight, Math.abs(size.y));
          }
        });

        if (maxHeight === 0) maxHeight = 1;
        heights[nodeName] = maxHeight;
        sum += maxHeight;
        cnt++;
      });

      if (cnt > 0) {
        keyHeights.current = heights;
        avgKeyHeight.current = sum / cnt;
      }
    } catch {
      // If anything fails here, fall back to defaults
    }

    const handleKeyDown = (e: KeyboardEvent) => pressedKeys.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => pressedKeys.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes]);

  useEffect(() => {
    if (isSettled) {
      pressedKeys.current.clear();
      return;
    }

    const typingSequence = [
      'KeyL', 'KeyO', 'KeyA', 'KeyD', 'KeyI', 'KeyN', 'KeyG',
      'Period', 'Period', 'Period', 'Enter'
    ];

    let currentIndex = 0;
    let typingInterval: NodeJS.Timeout | null = null;

    const typeNextKey = () => {
      if (currentIndex >= typingSequence.length) {
        if (typingInterval) clearInterval(typingInterval);
        return;
      }

      const keyToPress = typingSequence[currentIndex];
      pressedKeys.current.add(keyToPress);

      setTimeout(() => {
        pressedKeys.current.delete(keyToPress);
      }, 120);

      currentIndex++;
    };

    typingInterval = setInterval(typeNextKey, 250);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      pressedKeys.current.clear();
    };
  }, [isSettled]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Scale responsive to viewport
    // Mobile (< 0.5): Apply 20% additional reduction (1 - 0.2 = 0.8)
    // Tablet (0.5-1.0): Apply 10% reduction (1 - 0.1 = 0.9)
    // Desktop (> 1.0): Normal scaling
    let mobileReductionFactor = 1;
    if (modelScale < 0.5) {
      mobileReductionFactor = 0.8; // 20% reduction for mobile
    } else if (modelScale < 1.0) {
      mobileReductionFactor = 0.9; // 10% reduction for tablet
    }

    const targetScale = isSettled 
      ? (15.0 * modelScale * mobileReductionFactor) 
      : (18.0 * modelScale * mobileReductionFactor);
    
    const targetPosX = 0;
    const targetPosY = isSettled ? (0.45 * modelScale) : (2 * modelScale);
    const targetRotX = isSettled ? 0.4 : 0.6;
    const finalRotY = isSettled ? (targetRotY.current || 0) : 0;

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.05);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.05);

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.06);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.06);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, finalRotY, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.05);

    Object.entries(KEY_MAP).forEach(([keyCode, nodeName]) => {
      if (nodeName && nodes[nodeName] && initialPositions.current[nodeName] !== undefined) {
        const node = nodes[nodeName] as THREE.Object3D;
        const basePosY = initialPositions.current[nodeName];
        const isPressed = pressedKeys.current.has(keyCode);
        
        if (isPressed) {
          if ((node as any).material) {
            ((node as any).material as THREE.MeshStandardMaterial).color.setHex(0x22d3ee);
            ((node as any).material as THREE.MeshStandardMaterial).emissive.setHex(0x22d3ee);
            ((node as any).material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
          }
        } else {
          if ((node as any).material) {
            ((node as any).material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
            ((node as any).material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
            ((node as any).material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
        }
        
        // Normalize press depth by node height so all keys appear to press equally
        const nodeHeight = keyHeights.current[nodeName] || avgKeyHeight.current || 1;
        const depthScale = (nodeHeight > 0 ? (avgKeyHeight.current / nodeHeight) : 1);
        const pressOffset = PRESS_DEPTH * depthScale;
        const targetKeyY = isPressed ? basePosY - pressOffset : basePosY;
        node.position.y = THREE.MathUtils.lerp(node.position.y, targetKeyY, 0.25);
      }
    });

  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
});

export default KeyboardModel;

useGLTF.preload('/models/keyboard.glb');