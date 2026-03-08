"use client";

/**
 * Rocket 3D Decoration
 * A low-poly rocket with fins, a window, and animated exhaust flames.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RocketProps {
  isPreview?: boolean;
}

export function Rocket({ isPreview = false }: RocketProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  const groupRef = useRef<THREE.Group>(null);
  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle hover
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.15;
    }

    // Exhaust flame pulsing
    if (flame1Ref.current) {
      const s = 1.0 + Math.sin(t * 8) * 0.3;
      flame1Ref.current.scale.set(s, s * 1.2, s);
    }
    if (flame2Ref.current) {
      const s = 0.8 + Math.sin(t * 10 + 1) * 0.3;
      flame2Ref.current.scale.set(s, s * 1.1, s);
    }
  });

  // Fin positions: 3 fins evenly spaced
  const finCount = 3;
  const fins = Array.from({ length: finCount }, (_, i) => {
    const angle = (i / finCount) * Math.PI * 2;
    return { angle };
  });

  return (
    <group ref={groupRef}>
      {/* Rocket body */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 2.2, 8]} />
        <meshStandardMaterial
          color="#e8e8e8"
          flatShading
          roughness={0.5}
          {...materialProps}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 2.95, 0]}>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshStandardMaterial
          color="#CC2222"
          flatShading
          roughness={0.5}
          {...materialProps}
        />
      </mesh>

      {/* Window */}
      <mesh position={[0, 1.8, 0.36]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial
          color="#4169E1"
          emissive="#4169E1"
          emissiveIntensity={0.2}
          flatShading
          roughness={0.3}
          {...materialProps}
        />
      </mesh>

      {/* Fins */}
      {fins.map((fin, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(fin.angle) * 0.45,
            0.3,
            Math.sin(fin.angle) * 0.45,
          ]}
          rotation={[0, -fin.angle, -0.2]}
        >
          <boxGeometry args={[0.4, 0.6, 0.06]} />
          <meshStandardMaterial
            color="#CC2222"
            flatShading
            roughness={0.5}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Engine nozzle */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.2, 8]} />
        <meshStandardMaterial
          color="#4a4a4a"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Exhaust flame (outer - orange) */}
      <mesh ref={flame1Ref} position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.7, 6]} />
        <meshStandardMaterial
          color="#FF8C00"
          emissive="#FF6600"
          emissiveIntensity={0.8}
          flatShading
          {...materialProps}
        />
      </mesh>

      {/* Exhaust flame (inner - yellow) */}
      <mesh ref={flame2Ref} position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.12, 0.5, 6]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFAA00"
          emissiveIntensity={1.0}
          flatShading
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Rocket;
