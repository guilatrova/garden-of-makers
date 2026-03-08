"use client";

/**
 * MushroomCluster 3D Decoration
 * A cluster of 3-4 low-poly mushrooms with white stems and red spotted caps.
 */

import { useMemo } from "react";

interface MushroomClusterProps {
  isPreview?: boolean;
}

/** Seeded pseudo-random using Math.sin */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s += 1;
    const x = Math.sin(s * 127.1 + s * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
}

interface MushroomData {
  x: number;
  z: number;
  stemHeight: number;
  stemRadius: number;
  capRadius: number;
  spotOffsets: Array<{ dx: number; dz: number; dy: number; r: number }>;
}

export function MushroomCluster({ isPreview = false }: MushroomClusterProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const mushrooms: MushroomData[] = useMemo(() => {
    const rand = seededRandom(73);
    const sizes = [
      { stemH: 0.3, stemR: 0.06, capR: 0.2 },   // small
      { stemH: 0.5, stemR: 0.08, capR: 0.3 },   // medium
      { stemH: 0.25, stemR: 0.05, capR: 0.17 },  // small
      { stemH: 0.15, stemR: 0.035, capR: 0.1 },  // tiny
    ];

    return sizes.map((size) => {
      const x = (rand() - 0.5) * 0.8;
      const z = (rand() - 0.5) * 0.8;
      const spotCount = 2 + Math.floor(rand() * 3);
      const spotOffsets = Array.from({ length: spotCount }, () => {
        const angle = rand() * Math.PI * 2;
        const dist = size.capR * 0.4 * rand();
        return {
          dx: Math.cos(angle) * dist,
          dz: Math.sin(angle) * dist,
          dy: size.capR * 0.3 + rand() * size.capR * 0.2,
          r: 0.02 + rand() * 0.02,
        };
      });
      return {
        x,
        z,
        stemHeight: size.stemH,
        stemRadius: size.stemR,
        capRadius: size.capR,
        spotOffsets,
      };
    });
  }, []);

  return (
    <group>
      {mushrooms.map((m, i) => (
        <group key={i} position={[m.x, 0, m.z]}>
          {/* Stem */}
          <mesh position={[0, m.stemHeight / 2, 0]}>
            <cylinderGeometry args={[m.stemRadius, m.stemRadius * 1.2, m.stemHeight, 6]} />
            <meshStandardMaterial color="#F5F5DC" flatShading {...materialProps} />
          </mesh>

          {/* Cap - flattened sphere */}
          <mesh position={[0, m.stemHeight + m.capRadius * 0.2, 0]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[m.capRadius, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#DC143C" flatShading {...materialProps} />
          </mesh>

          {/* White spots on cap */}
          {m.spotOffsets.map((spot, j) => (
            <mesh
              key={j}
              position={[spot.dx, m.stemHeight + spot.dy, spot.dz]}
            >
              <sphereGeometry args={[spot.r, 4, 3]} />
              <meshStandardMaterial color="#FFFFFF" flatShading {...materialProps} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default MushroomCluster;
