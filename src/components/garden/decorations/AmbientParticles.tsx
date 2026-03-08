"use client";

/**
 * AmbientParticles 3D Decoration
 * Animated firefly-like particles floating above the garden with unique paths
 * and flickering emissive glow.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AmbientParticlesProps {
  isPreview?: boolean;
}

const PARTICLE_COUNT = 18;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function AmbientParticles({ isPreview = false }: AmbientParticlesProps) {
  const particlesRef = useRef<(THREE.Mesh | null)[]>([]);

  // Pre-compute unique parameters for each particle
  const particleParams = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      baseX: seededRandom(i * 3) * 30 - 15,
      baseY: seededRandom(i * 3 + 1) * 7 + 1,
      baseZ: seededRandom(i * 3 + 2) * 20 - 10,
      freqX: 0.2 + seededRandom(i * 7) * 0.5,
      freqY: 0.3 + seededRandom(i * 7 + 1) * 0.4,
      freqZ: 0.15 + seededRandom(i * 7 + 2) * 0.4,
      phaseX: seededRandom(i * 11) * Math.PI * 2,
      phaseY: seededRandom(i * 11 + 1) * Math.PI * 2,
      phaseZ: seededRandom(i * 11 + 2) * Math.PI * 2,
      ampX: 1.0 + seededRandom(i * 13) * 2.0,
      ampY: 0.5 + seededRandom(i * 13 + 1) * 1.5,
      ampZ: 1.0 + seededRandom(i * 13 + 2) * 2.0,
      glowFreq: 1.5 + seededRandom(i * 17) * 2.0,
      glowPhase: seededRandom(i * 17 + 1) * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = particlesRef.current[i];
      if (!mesh) continue;

      const p = particleParams[i];

      mesh.position.x = p.baseX + Math.sin(t * p.freqX + p.phaseX) * p.ampX;
      mesh.position.y = p.baseY + Math.sin(t * p.freqY + p.phaseY) * p.ampY;
      mesh.position.z = p.baseZ + Math.sin(t * p.freqZ + p.phaseZ) * p.ampZ;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * p.glowFreq + p.glowPhase) * 0.45;
    }
  });

  return (
    <group>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particlesRef.current[i] = el;
          }}
          position={[
            particleParams[i].baseX,
            particleParams[i].baseY,
            particleParams[i].baseZ,
          ]}
        >
          <sphereGeometry args={[0.06, 5, 4]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            flatShading
            transparent
            opacity={isPreview ? 0.5 : 0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

export default AmbientParticles;
