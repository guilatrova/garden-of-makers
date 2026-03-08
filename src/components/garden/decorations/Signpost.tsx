"use client";

/**
 * Signpost 3D Decoration
 * A welcome signpost with a wooden post, sign board, and directional arrow.
 */

interface SignpostProps {
  isPreview?: boolean;
}

export function Signpost({ isPreview = false }: SignpostProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  return (
    <group>
      {/* Wooden post */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 2, 6]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.85}
          {...materialProps}
        />
      </mesh>

      {/* Sign board */}
      <mesh position={[0, 1.7, 0.06]}>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Arrow on top, pointing right */}
      <mesh
        position={[0.3, 2.25, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Signpost;
