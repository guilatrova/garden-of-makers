"use client";

/**
 * Lantern Decoration
 * Low-poly lamp post with a glowing pulsing light.
 */

import { useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";

interface LanternProps {
  isPreview?: boolean;
}

export function Lantern({ isPreview = false }: LanternProps) {
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const time = clock.getElapsedTime();
      const material = glowRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(time) * 0.3;
    }
  });

  const transparent = isPreview;
  const opacity = isPreview ? 0.5 : 1;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.2, 6]} />
        <meshStandardMaterial
          color="#3a3a3a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2.5, 6]} />
        <meshStandardMaterial
          color="#3a3a3a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Lamp housing */}
      <mesh position={[0, 2.75, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial
          color="#4a4a4a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Glowing light sphere */}
      <mesh ref={glowRef} position={[0, 2.75, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Point light */}
      {!isPreview && (
        <pointLight
          position={[0, 2.75, 0]}
          intensity={3}
          distance={8}
          color="#FFD700"
        />
      )}
    </group>
  );
}

export default Lantern;
