"use client";

/**
 * Pond Decoration
 * Tranquil low-poly pond with animated water surface and lily pads.
 */

import { useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";

interface PondProps {
  isPreview?: boolean;
}

export function Pond({ isPreview = false }: PondProps) {
  const waterRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      const time = clock.getElapsedTime();
      waterRef.current.position.y = 0.05 + Math.sin(time * 0.5) * 0.02;
      const material = waterRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = 0.1 + Math.sin(time * 0.8) * 0.05;
    }
  });

  const transparent = isPreview;
  const opacity = isPreview ? 0.5 : 1;

  return (
    <group>
      {/* Basin */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.6, 1.7, 0.15, 8]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.95}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Water surface */}
      <mesh ref={waterRef} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.45, 1.45, 0.08, 8]} />
        <meshStandardMaterial
          color="#4a90d9"
          emissive="#4a90d9"
          emissiveIntensity={0.1}
          flatShading
          roughness={0.3}
          metalness={0.2}
          transparent={transparent}
          opacity={isPreview ? 0.5 : 0.85}
        />
      </mesh>

      {/* Lily pad 1 */}
      <mesh position={[0.5, 0.12, 0.3]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 6]} />
        <meshStandardMaterial
          color="#3a8a2a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Lily pad 2 */}
      <mesh position={[-0.4, 0.12, -0.5]} rotation={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 6]} />
        <meshStandardMaterial
          color="#3a8a2a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Lily pad 3 */}
      <mesh position={[-0.6, 0.12, 0.4]} rotation={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
        <meshStandardMaterial
          color="#3a8a2a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default Pond;
