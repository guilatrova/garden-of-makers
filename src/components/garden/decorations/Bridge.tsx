"use client";

/**
 * Bridge 3D Decoration
 * A wooden bridge with railings and support beams.
 */

import { useMemo } from "react";

interface BridgeProps {
  isPreview?: boolean;
}

const POST_COUNT = 5;

export function Bridge({ isPreview = false }: BridgeProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const posts = useMemo(() => {
    const items: { x: number; key: number }[] = [];
    for (let i = 0; i < POST_COUNT; i++) {
      const x = -2 + (i / (POST_COUNT - 1)) * 4;
      items.push({ x, key: i });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Deck — slightly arched */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[5, 0.15, 1.5]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Left railing posts */}
      {posts.map(({ x, key }) => (
        <mesh key={`l-${key}`} position={[x, 0.65, 0.65]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial
            color="#8B6914"
            flatShading
            roughness={0.8}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Right railing posts */}
      {posts.map(({ x, key }) => (
        <mesh key={`r-${key}`} position={[x, 0.65, -0.65]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial
            color="#8B6914"
            flatShading
            roughness={0.8}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Left horizontal rail */}
      <mesh position={[0, 0.9, 0.65]}>
        <boxGeometry args={[4.8, 0.06, 0.06]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Right horizontal rail */}
      <mesh position={[0, 0.9, -0.65]}>
        <boxGeometry args={[4.8, 0.06, 0.06]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Support beam — front */}
      <mesh position={[2.2, 0.1, 0]} rotation={[0, 0, Math.PI / 12]}>
        <boxGeometry args={[0.15, 0.4, 1.2]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Support beam — back */}
      <mesh position={[-2.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <boxGeometry args={[0.15, 0.4, 1.2]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Bridge;
