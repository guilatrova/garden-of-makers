"use client";

/**
 * Terrain Component
 * Ground plane for the scene — color and size are configurable.
 */

export interface TerrainProps {
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  size?: number;
}

export function Terrain({
  color = "#8B7355",
  emissive,
  emissiveIntensity = 0.15,
  size = 2000,
}: TerrainProps) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive ?? color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export default Terrain;
