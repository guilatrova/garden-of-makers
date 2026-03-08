"use client";

/**
 * Rainbow 3D Decoration
 * A colorful rainbow arc made of small spheres arranged in concentric semicircles,
 * with a gentle opacity pulse animation.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RainbowProps {
  isPreview?: boolean;
}

const RAINBOW_COLORS = [
  "#FF0000", // red
  "#FF8C00", // orange
  "#FFD700", // yellow
  "#32CD32", // green
  "#4169E1", // blue
  "#8A2BE2", // violet
];

const SPHERES_PER_ARC = 14;

export function Rainbow({ isPreview = false }: RainbowProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Pre-compute sphere positions for each color band
  const arcs = useMemo(() => {
    return RAINBOW_COLORS.map((color, bandIndex) => {
      const radius = 5.0 + bandIndex * 0.5;
      const spheres = Array.from({ length: SPHERES_PER_ARC }, (_, i) => {
        const angle = (i / (SPHERES_PER_ARC - 1)) * Math.PI;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: 0,
        };
      });
      return { color, spheres, radius };
    });
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      const pulse = 0.7 + Math.sin(t * 0.8) * 0.3;
      groupRef.current.children.forEach((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.opacity !== undefined) {
            mat.opacity = isPreview ? 0.5 * pulse : pulse;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {arcs.map((arc, bandIndex) =>
        arc.spheres.map((pos, sphereIndex) => (
          <mesh
            key={`${bandIndex}-${sphereIndex}`}
            position={[pos.x, pos.y, pos.z]}
          >
            <sphereGeometry args={[0.25 - bandIndex * 0.01, 5, 4]} />
            <meshStandardMaterial
              color={arc.color}
              emissive={arc.color}
              emissiveIntensity={0.3}
              flatShading
              transparent
              opacity={isPreview ? 0.5 : 0.85}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

export default Rainbow;
