"use client";

/**
 * Fountain 3D Decoration
 * An elegant low-poly water fountain with animated water drops.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FountainProps {
  isPreview?: boolean;
}

const DROP_COUNT = 8;

export function Fountain({ isPreview = false }: FountainProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const dropsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < DROP_COUNT; i++) {
      const mesh = dropsRef.current[i];
      if (!mesh) continue;

      const angle = (i / DROP_COUNT) * Math.PI * 2;
      const phase = (t * 1.2 + (i / DROP_COUNT) * Math.PI * 2) % (Math.PI * 2);
      const progress = phase / (Math.PI * 2);

      // Parabolic arc: rise then fall
      const radius = progress * 0.6;
      const height = 1.8 + progress * 0.6 - progress * progress * 2.0;

      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = height;
    }
  });

  return (
    <group>
      {/* Base pool */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 0.12, 10]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Pool water surface */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.04, 10]} />
        <meshStandardMaterial
          color="#4a90d9"
          flatShading
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Central column */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1.0, 6]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Lower bowl */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.5, 0.3, 0.12, 8]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Upper column between bowls */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 6]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Upper bowl */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.35, 0.2, 0.1, 8]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Water drops */}
      {Array.from({ length: DROP_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dropsRef.current[i] = el;
          }}
          position={[0, 1.8, 0]}
        >
          <sphereGeometry args={[0.04, 5, 4]} />
          <meshStandardMaterial
            color="#4a90d9"
            emissive="#4a90d9"
            emissiveIntensity={0.3}
            flatShading
            {...materialProps}
          />
        </mesh>
      ))}
    </group>
  );
}

export default Fountain;
