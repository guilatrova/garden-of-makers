"use client";

/**
 * FlowerBed 3D Decoration
 * A 2x2 unit low-poly flower bed with dirt base and colorful flowers.
 */

import { useMemo } from "react";

interface FlowerBedProps {
  isPreview?: boolean;
}

const FLOWER_COLORS = ["#FF69B4", "#FFD700", "#DC143C", "#9B59B6", "#FFFFFF"];

/** Seeded pseudo-random using Math.sin */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s += 1;
    const x = Math.sin(s * 127.1 + s * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
}

export function FlowerBed({ isPreview = false }: FlowerBedProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const flowers = useMemo(() => {
    const rand = seededRandom(42);
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const x = (rand() - 0.5) * 1.4;
      const z = (rand() - 0.5) * 1.4;
      const stemHeight = 0.2 + rand() * 0.25;
      const color = FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)];
      return { x, z, stemHeight, color, key: i };
    });
  }, []);

  return (
    <group>
      {/* Dirt base */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.08, 8]} />
        <meshStandardMaterial color="#6B4226" flatShading {...materialProps} />
      </mesh>

      {/* Flowers */}
      {flowers.map(({ x, z, stemHeight, color, key }) => (
        <group key={key} position={[x, 0.08, z]}>
          {/* Stem */}
          <mesh position={[0, stemHeight / 2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, stemHeight, 4]} />
            <meshStandardMaterial color="#228B22" flatShading {...materialProps} />
          </mesh>
          {/* Flower head */}
          <mesh position={[0, stemHeight + 0.04, 0]}>
            <sphereGeometry args={[0.06, 5, 4]} />
            <meshStandardMaterial color={color} flatShading {...materialProps} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default FlowerBed;
