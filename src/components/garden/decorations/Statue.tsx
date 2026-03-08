"use client";

/**
 * Statue 3D Decoration
 * A golden trophy statue on a stone pedestal with a gentle emissive glow pulse.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StatueProps {
  isPreview?: boolean;
}

export function Statue({ isPreview = false }: StatueProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  const trophyRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (trophyRef.current) {
      const mat = trophyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 1.5) * 0.25;
    }
  });

  return (
    <group>
      {/* Pedestal base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
        <meshStandardMaterial
          color="#c8c8c0"
          flatShading
          roughness={0.7}
          {...materialProps}
        />
      </mesh>

      {/* Pedestal column */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial
          color="#b8b8b0"
          flatShading
          roughness={0.7}
          {...materialProps}
        />
      </mesh>

      {/* Trophy base (foot) */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.15, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Trophy stem */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Trophy cup body */}
      <mesh ref={trophyRef} position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.3, 0.15, 0.5, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.4}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Trophy rim (wider top) */}
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.08, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Left handle (sphere) */}
      <mesh position={[-0.35, 1.5, 0]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Right handle (sphere) */}
      <mesh position={[0.35, 1.5, 0]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          flatShading
          metalness={0.6}
          roughness={0.3}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Statue;
