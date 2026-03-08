"use client";

/**
 * Bench 3D Decoration
 * A low-poly wooden bench with seat, legs, and backrest.
 */

interface BenchProps {
  isPreview?: boolean;
}

export function Bench({ isPreview = false }: BenchProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 0.12, 0.8]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Front-left leg */}
      <mesh position={[-1.0, 0.3, 0.3]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#6B4226" flatShading roughness={0.9} {...materialProps} />
      </mesh>

      {/* Front-right leg */}
      <mesh position={[1.0, 0.3, 0.3]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#6B4226" flatShading roughness={0.9} {...materialProps} />
      </mesh>

      {/* Back-left leg */}
      <mesh position={[-1.0, 0.3, -0.3]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#6B4226" flatShading roughness={0.9} {...materialProps} />
      </mesh>

      {/* Back-right leg */}
      <mesh position={[1.0, 0.3, -0.3]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#6B4226" flatShading roughness={0.9} {...materialProps} />
      </mesh>

      {/* Backrest - tilted slightly back */}
      <mesh
        position={[0, 1.05, -0.35]}
        rotation={[0.15, 0, 0]}
      >
        <boxGeometry args={[2.5, 0.8, 0.1]} />
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

export default Bench;
