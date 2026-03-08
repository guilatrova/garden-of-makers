"use client";

/**
 * Hedge Decoration
 * Low-poly topiary hedge with an optional sphere on top.
 */

interface HedgeProps {
  isPreview?: boolean;
}

export function Hedge({ isPreview = false }: HedgeProps) {
  const transparent = isPreview;
  const opacity = isPreview ? 0.5 : 1;

  return (
    <group>
      {/* Base hedge body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[3.5, 1.5, 1]} />
        <meshStandardMaterial
          color="#2d5a1e"
          flatShading
          roughness={0.9}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Topiary ball on top */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.55, 6, 5]} />
        <meshStandardMaterial
          color="#3a7a2a"
          flatShading
          roughness={0.85}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default Hedge;
