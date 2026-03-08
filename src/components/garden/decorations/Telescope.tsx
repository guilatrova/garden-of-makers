"use client";

/**
 * Telescope 3D Decoration
 * A low-poly telescope on a tripod with a gentle panning animation.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TelescopeProps {
  isPreview?: boolean;
}

export function Telescope({ isPreview = false }: TelescopeProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  const pivotRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (pivotRef.current) {
      const t = clock.getElapsedTime();
      pivotRef.current.rotation.y = Math.sin(t * 0.3) * 0.3;
    }
  });

  // Tripod legs: 3 thin cylinders converging at the pivot point
  const legCount = 3;
  const legs = Array.from({ length: legCount }, (_, i) => {
    const angle = (i / legCount) * Math.PI * 2;
    return { angle };
  });

  return (
    <group>
      {/* Tripod legs */}
      {legs.map((leg, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(leg.angle) * 0.35,
            0.55,
            Math.sin(leg.angle) * 0.35,
          ]}
          rotation={[
            Math.sin(leg.angle) * 0.35,
            0,
            -Math.cos(leg.angle) * 0.35,
          ]}
        >
          <cylinderGeometry args={[0.03, 0.04, 1.2, 5]} />
          <meshStandardMaterial
            color="#8B6914"
            flatShading
            roughness={0.8}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Tripod junction (hub) */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial
          color="#4a4a4a"
          flatShading
          roughness={0.7}
          {...materialProps}
        />
      </mesh>

      {/* Panning group (telescope + lens + eyepiece) */}
      <group ref={pivotRef} position={[0, 1.1, 0]}>
        {/* Telescope tube — angled upward ~30 degrees */}
        <group rotation={[-(Math.PI / 6), 0, 0]}>
          {/* Main tube */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.9, 6]} />
            <meshStandardMaterial
              color="#3a3a5a"
              flatShading
              roughness={0.5}
              {...materialProps}
            />
          </mesh>

          {/* Front lens (sphere) */}
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial
              color="#6a9ac4"
              emissive="#6a9ac4"
              emissiveIntensity={0.3}
              flatShading
              roughness={0.2}
              metalness={0.3}
              {...materialProps}
            />
          </mesh>

          {/* Lens rim */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 6]} />
            <meshStandardMaterial
              color="#2a2a3a"
              flatShading
              roughness={0.6}
              {...materialProps}
            />
          </mesh>

          {/* Eyepiece (back end) */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.15, 6]} />
            <meshStandardMaterial
              color="#2a2a3a"
              flatShading
              roughness={0.6}
              {...materialProps}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default Telescope;
