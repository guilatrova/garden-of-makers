"use client";

/**
 * CastleTower 3D Decoration
 * A majestic low-poly castle tower with battlements, a conical roof, and a flag.
 */

interface CastleTowerProps {
  isPreview?: boolean;
}

export function CastleTower({ isPreview = false }: CastleTowerProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  // Merlon positions around the top rim
  const merlonCount = 6;
  const merlonRadius = 0.65;
  const merlons = Array.from({ length: merlonCount }, (_, i) => {
    const angle = (i / merlonCount) * Math.PI * 2;
    return {
      x: Math.cos(angle) * merlonRadius,
      z: Math.sin(angle) * merlonRadius,
    };
  });

  return (
    <group>
      {/* Main tower body */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 3.6, 8]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Battlement rim (wider top) */}
      <mesh position={[0, 3.7, 0]}>
        <cylinderGeometry args={[0.75, 0.7, 0.2, 8]} />
        <meshStandardMaterial
          color="#8a8a7a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Merlons (box notches around the top) */}
      {merlons.map((pos, i) => (
        <mesh key={i} position={[pos.x, 3.95, pos.z]}>
          <boxGeometry args={[0.2, 0.3, 0.15]} />
          <meshStandardMaterial
            color="#8a8a7a"
            flatShading
            roughness={0.9}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Conical roof */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[0.85, 1.0, 8]} />
        <meshStandardMaterial
          color="#3a3a6a"
          flatShading
          roughness={0.7}
          {...materialProps}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.3, 0.72]}>
        <boxGeometry args={[0.35, 0.55, 0.06]} />
        <meshStandardMaterial
          color="#2a2a2a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Door arch */}
      <mesh position={[0, 0.6, 0.72]}>
        <sphereGeometry args={[0.175, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#2a2a2a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Window (dark square) */}
      <mesh position={[0, 2.2, 0.62]}>
        <boxGeometry args={[0.18, 0.25, 0.06]} />
        <meshStandardMaterial
          color="#1a1a3a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Flag pole */}
      <mesh position={[0, 5.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 4]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Flag */}
      <mesh position={[0.18, 5.55, 0]}>
        <boxGeometry args={[0.32, 0.2, 0.02]} />
        <meshStandardMaterial
          color="#CC2222"
          flatShading
          roughness={0.5}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default CastleTower;
