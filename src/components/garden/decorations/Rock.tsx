"use client";

/**
 * Rock 3D Decoration
 * A decorative low-poly boulder with 1-2 smaller rocks nearby.
 */

interface RockProps {
  isPreview?: boolean;
}

export function Rock({ isPreview = false }: RockProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  return (
    <group>
      {/* Main boulder */}
      <mesh position={[0, 0.28, 0]} scale={[1, 0.7, 1]}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color="#888888"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Small rock 1 */}
      <mesh position={[0.7, 0.12, 0.3]} scale={[1, 0.7, 0.9]}>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial
          color="#777777"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Small rock 2 */}
      <mesh position={[-0.5, 0.1, -0.4]} scale={[0.9, 0.65, 1]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color="#999999"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Rock;
