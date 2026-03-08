"use client";

/**
 * Scarecrow Decoration
 * Friendly low-poly scarecrow with a cross-shaped body, round head, and cone hat.
 */

interface ScarecrowProps {
  isPreview?: boolean;
}

export function Scarecrow({ isPreview = false }: ScarecrowProps) {
  const transparent = isPreview;
  const opacity = isPreview ? 0.5 : 1;

  return (
    <group>
      {/* Body (torso) */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.5, 1.2, 0.3]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Arms (horizontal cross) */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.6, 0.15, 0.15]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.25, 6, 5]} />
        <meshStandardMaterial
          color="#C4A882"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Hat */}
      <mesh position={[0, 2.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.45, 6]} />
        <meshStandardMaterial
          color="#3a3a3a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Hat brim */}
      <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 6]} />
        <meshStandardMaterial
          color="#3a3a3a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.08, 1.95, 0.24]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial
          color="#1a1a1a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.08, 1.95, 0.24]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial
          color="#1a1a1a"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default Scarecrow;
