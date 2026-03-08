"use client";

/**
 * Campfire 3D Decoration
 * A warm campfire with animated flames and pulsing light.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CampfireProps {
  isPreview?: boolean;
}

const STONE_COUNT = 8;

export function Campfire({ isPreview = false }: CampfireProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);
  const flame3Ref = useRef<THREE.Mesh>(null);
  const flame4Ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Flame 1 — tall orange center
    if (flame1Ref.current) {
      flame1Ref.current.scale.y = 1.0 + Math.sin(t * 5.0) * 0.2;
      flame1Ref.current.scale.x = 1.0 + Math.sin(t * 3.7) * 0.1;
      flame1Ref.current.position.y = 0.3 + Math.sin(t * 4.2) * 0.03;
    }

    // Flame 2 — yellow side
    if (flame2Ref.current) {
      flame2Ref.current.scale.y = 1.0 + Math.sin(t * 6.1 + 1.0) * 0.25;
      flame2Ref.current.scale.x = 1.0 + Math.cos(t * 4.3) * 0.12;
      flame2Ref.current.position.y = 0.25 + Math.sin(t * 5.0 + 0.5) * 0.03;
    }

    // Flame 3 — red side
    if (flame3Ref.current) {
      flame3Ref.current.scale.y = 1.0 + Math.sin(t * 4.5 + 2.0) * 0.2;
      flame3Ref.current.scale.x = 1.0 + Math.sin(t * 5.5 + 1.5) * 0.15;
      flame3Ref.current.position.y = 0.22 + Math.sin(t * 3.8 + 1.0) * 0.02;
    }

    // Flame 4 — small inner yellow
    if (flame4Ref.current) {
      flame4Ref.current.scale.y = 1.0 + Math.cos(t * 7.0) * 0.3;
      flame4Ref.current.position.y = 0.35 + Math.sin(t * 6.0) * 0.02;
    }

    // Pulsing light
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(t * 5.0) * 0.8;
    }
  });

  const stones = useMemo(() => {
    return Array.from({ length: STONE_COUNT }, (_, i) => {
      const angle = (i / STONE_COUNT) * Math.PI * 2;
      const x = Math.cos(angle) * 0.45;
      const z = Math.sin(angle) * 0.45;
      return { x, z, key: i };
    });
  }, []);

  return (
    <group>
      {/* Ring of stones */}
      {stones.map(({ x, z, key }) => (
        <mesh key={key} position={[x, 0.08, z]} scale={[1, 0.7, 1]}>
          <icosahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color="#777777"
            flatShading
            roughness={0.9}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Wood log 1 */}
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 10]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 5]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Wood log 2 */}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[0, Math.PI / 2.5, -Math.PI / 10]}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.55, 5]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Wood log 3 */}
      <mesh
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 8, Math.PI / 1.3, 0]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.5, 5]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Flame 1 — tall orange center */}
      <mesh ref={flame1Ref} position={[0, 0.3, 0]}>
        <coneGeometry args={[0.12, 0.4, 5]} />
        <meshStandardMaterial
          color="#FF6600"
          emissive="#FF6600"
          emissiveIntensity={0.6}
          flatShading
          {...materialProps}
        />
      </mesh>

      {/* Flame 2 — yellow side */}
      <mesh ref={flame2Ref} position={[0.06, 0.25, 0.04]}>
        <coneGeometry args={[0.08, 0.3, 5]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          flatShading
          {...materialProps}
        />
      </mesh>

      {/* Flame 3 — red side */}
      <mesh ref={flame3Ref} position={[-0.05, 0.22, -0.03]}>
        <coneGeometry args={[0.09, 0.28, 5]} />
        <meshStandardMaterial
          color="#FF3300"
          emissive="#FF3300"
          emissiveIntensity={0.5}
          flatShading
          {...materialProps}
        />
      </mesh>

      {/* Flame 4 — small inner yellow */}
      <mesh ref={flame4Ref} position={[0, 0.35, 0]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.7}
          flatShading
          {...materialProps}
        />
      </mesh>

      {/* Point light at fire center */}
      <pointLight
        ref={lightRef}
        position={[0, 0.35, 0]}
        color="#FF6600"
        intensity={2.0}
        distance={10}
      />
    </group>
  );
}

export default Campfire;
