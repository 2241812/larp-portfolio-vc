"use client";
import React, { useRef, useEffect, memo, useMemo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Key row positions for wave animation (0 = top row, 3 = bottom row)
const KEY_ROW: Record<string, number> = {
  'Digit1': 0, 'Digit2': 0, 'Digit3': 0, 'Digit4': 0, 'Digit5': 0, 'Digit6': 0, 'Digit7': 0, 'Digit8': 0, 'Digit9': 0, 'Digit0': 0, 'Minus': 0, 'Backspace': 0,
  'KeyQ': 1, 'KeyW': 1, 'KeyE': 1, 'KeyR': 1, 'KeyT': 1, 'KeyY': 1, 'KeyU': 1, 'KeyI': 1, 'KeyO': 1, 'KeyP': 1,
  'KeyA': 2, 'KeyS': 2, 'KeyD': 2, 'KeyF': 2, 'KeyG': 2, 'KeyH': 2, 'KeyJ': 2, 'KeyK': 2, 'KeyL': 2, 'Enter': 2,
  'KeyZ': 3, 'KeyX': 3, 'KeyC': 3, 'KeyV': 3, 'KeyB': 3, 'KeyN': 3, 'KeyM': 3, 'Comma': 3, 'Period': 3, 'Slash': 3,
  'Space': 4
};

const KEY_CENTER_X: Record<string, number> = {
  'Digit1': -0.35, 'Digit2': -0.3, 'Digit3': -0.25, 'Digit4': -0.2, 'Digit5': -0.15, 'Digit6': -0.1, 'Digit7': -0.05, 'Digit8': 0, 'Digit9': 0.05, 'Digit0': 0.1,
  'KeyQ': -0.25, 'KeyW': -0.2, 'KeyE': -0.15, 'KeyR': -0.1, 'KeyT': -0.05, 'KeyY': 0, 'KeyU': 0.05, 'KeyI': 0.1, 'KeyO': 0.15, 'KeyP': 0.2,
  'KeyA': -0.2, 'KeyS': -0.15, 'KeyD': -0.1, 'KeyF': -0.05, 'KeyG': 0, 'KeyH': 0.05, 'KeyJ': 0.1, 'KeyK': 0.15, 'KeyL': 0.2,
  'KeyZ': -0.15, 'KeyX': -0.1, 'KeyC': -0.05, 'KeyV': 0, 'KeyB': 0.05, 'KeyN': 0.1, 'KeyM': 0.15,
  'Space': 0, 'Enter': 0.25
};

const KEY_MAP: Record<string, string> = {
  'Digit1': 'Object_104', 'Digit2': 'Object_106', 'Digit3': 'Object_108', 'Digit4': 'Object_110', 'Digit5': 'Object_112', 'Digit6': 'Object_114', 'Digit7': 'Object_116', 'Digit8': 'Object_118', 'Digit9': 'Object_120', 'Digit0': 'Object_122', 'Minus': 'Object_124', 'Backspace': 'Object_98', 'KeyQ': 'Object_74', 'KeyW': 'Object_166', 'KeyE': 'Object_168', 'KeyR': 'Object_170', 'KeyT': 'Object_172', 'KeyY': 'Object_174', 'KeyU': 'Object_176', 'KeyI': 'Object_178', 'KeyO': 'Object_180', 'KeyP': 'Object_182', 'KeyA': 'Object_68', 'KeyS': 'Object_128', 'KeyD': 'Object_130', 'KeyF': 'Object_132', 'KeyG': 'Object_134', 'KeyH': 'Object_136', 'KeyJ': 'Object_138', 'KeyK': 'Object_140', 'KeyL': 'Object_142', 'Enter': 'Object_100', 'KeyZ': 'Object_70', 'KeyX': 'Object_148', 'KeyC': 'Object_150', 'KeyV': 'Object_152', 'KeyB': 'Object_154', 'KeyN': 'Object_156', 'KeyM': 'Object_158', 'Comma': 'Object_160', 'Period': 'Object_162', 'Slash': 'Object_164', 'Space': 'Object_80'
};

// Glow ring component that pulses around the keyboard
function GlowRing({ isSettled }: { isSettled: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!ringRef.current || isSettled) return;
    elapsedRef.current += delta;
    const time = elapsedRef.current;
    // Pulsing scale effect
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    ringRef.current.scale.set(pulse, pulse, 1);
    // Rotate slowly
    ringRef.current.rotation.z = time * 0.2;
    // Pulsing opacity via material
    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.3 + Math.sin(time * 3) * 0.15;
  });

  if (isSettled) return null;

  return (
    <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2.0, 64]} />
      <meshBasicMaterial 
        color="#22d3ee" 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Floating particles that emanate from pressed keys
function KeyParticles({ isSettled }: { isSettled: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;
  
  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      lifetimes[i] = Math.random();
    }
    return { positions, velocities, lifetimes };
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current || isSettled) return;
    
    const positionAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionAttr.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      lifetimes[i] -= delta * 0.5;
      
      if (lifetimes[i] <= 0) {
        // Reset particle
        posArray[i * 3] = (Math.random() - 0.5) * 1.5;
        posArray[i * 3 + 1] = 0;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
        lifetimes[i] = 1;
      } else {
        // Update position
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];
      }
    }
    
    positionAttr.needsUpdate = true;
  });

  if (isSettled) return null;

  return (
    <points ref={particlesRef} position={[0, 0.2, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#22d3ee"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const KeyboardModel = memo(function KeyboardModel({ isSettled }: { isSettled: boolean }) {
  const { scene, nodes } = useGLTF('/models/keyboard.glb') as any;
  const groupRef = useRef<THREE.Group>(null);
  const targetRotY = useRef<number | null>(null);
  
  const pressedKeys = useRef<Set<string>>(new Set());
  const initialPositions = useRef<Record<string, number>>({});
  const bootSequenceComplete = useRef(false);
  const elapsedTimeRef = useRef(0);
  const bootStartTime = useRef<number | null>(null);
  
  const keyboardTilt = useRef({ rotX: 0, rotXVel: 0, rotZ: 0, rotZVel: 0 });
  const TILT_STIFFNESS = 600;
  const TILT_DAMPING = 18;
  const MAX_TILT = 0.04;

  useEffect(() => {
    Object.values(KEY_MAP).forEach((nodeName) => {
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
    let typingInterval: NodeJS.Timeout;

    const typeNextKey = () => {
      if (currentIndex >= typingSequence.length) {
        clearInterval(typingInterval);
        return;
      }

      const keyToPress = typingSequence[currentIndex];
      pressedKeys.current.add(keyToPress);

      setTimeout(() => {
        pressedKeys.current.delete(keyToPress);
      }, 150);

      currentIndex++;
    };

    typingInterval = setInterval(typeNextKey, 300);

    return () => {
      clearInterval(typingInterval);
      pressedKeys.current.clear();
    };
  }, [isSettled]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    elapsedTimeRef.current += delta;
    const time = elapsedTimeRef.current;
    
    // Initialize boot sequence timing
    if (!isSettled && bootStartTime.current === null) {
      bootStartTime.current = time;
    }
    
    // Boot wave animation: keys ripple in sequence during first 2 seconds
    const bootElapsed = bootStartTime.current !== null ? time - bootStartTime.current : 0;
    const bootWaveActive = !isSettled && bootElapsed < 2.5 && !bootSequenceComplete.current;
    
    if (bootWaveActive) {
      Object.entries(KEY_MAP).forEach(([keyCode, nodeName]) => {
        if (nodeName && nodes[nodeName] && initialPositions.current[nodeName] !== undefined) {
          const node = nodes[nodeName] as THREE.Object3D;
          const basePosY = initialPositions.current[nodeName];
          const row = KEY_ROW[keyCode] ?? 2;
          
          // Wave travels from top to bottom rows
          const waveDelay = row * 0.15;
          const waveProgress = Math.max(0, bootElapsed - waveDelay);
          const waveIntensity = Math.sin(waveProgress * 8) * Math.exp(-waveProgress * 2);
          
          // Key bounces up slightly during wave
          const waveOffset = waveIntensity * 0.02;
          node.position.y = basePosY + waveOffset;
          
          // Glow effect during wave
          if ((node as any).material && waveIntensity > 0.1) {
            const glowIntensity = Math.abs(waveIntensity);
            ((node as any).material as THREE.MeshStandardMaterial).emissive.setHex(0x22d3ee);
            ((node as any).material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity * 0.5;
          } else if ((node as any).material) {
            ((node as any).material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
            ((node as any).material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
        }
      });
    }
    
    if (bootElapsed >= 2.5) {
      bootSequenceComplete.current = true;
    }

    // During loading: larger, more centered, subtle floating animation
    // When settled: smaller, positioned for hero section
    let targetScale = isSettled ? 15.0 : 22.0;
    const targetPosX = 0;
    // Subtle floating effect during loading
    const floatOffset = isSettled ? 0 : Math.sin(time * 0.8) * 0.05;
    let targetPosY = isSettled ? 0.45 : 0.8 + floatOffset;
    // Angled view during loading for better visibility
    let targetRotX = isSettled ? 0.4 : 0.5;
    // Gentle rotation during loading
    const rotateOffset = isSettled ? 0 : Math.sin(time * 0.3) * 0.08;
    let finalRotY = isSettled ? (targetRotY.current || 0) : rotateOffset;

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.08);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.08);

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.08);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.08);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, finalRotY, 0.08);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.08);

    let tiltX = 0;
    let tiltZ = 0;
    let keysPressed = 0;
    
    // Only process individual key presses after boot wave completes
    if (!bootWaveActive) {
      Object.entries(KEY_MAP).forEach(([keyCode, nodeName]) => {
        if (nodeName && nodes[nodeName] && initialPositions.current[nodeName] !== undefined) {
          const node = nodes[nodeName] as THREE.Object3D;
          const basePosY = initialPositions.current[nodeName];
          const isPressed = pressedKeys.current.has(keyCode);
          
          if (isPressed) {
            keysPressed++;
            const keyX = KEY_CENTER_X[keyCode] || 0;
            tiltZ -= keyX * MAX_TILT;
            tiltX += MAX_TILT * 0.3;
            
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
          
          const targetKeyY = isPressed ? basePosY - 0.015 : basePosY;
          node.position.y = THREE.MathUtils.lerp(node.position.y, targetKeyY, 0.4);
        }
      });
    }
    
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
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Center>
        <primitive object={scene} />
        {/* Pulsing glow ring around keyboard */}
        <GlowRing isSettled={isSettled} />
        {/* Floating particles emanating from keyboard */}
        <KeyParticles isSettled={isSettled} />
      </Center>
    </group>
  );
});

export default KeyboardModel;

useGLTF.preload('/models/keyboard.glb');
