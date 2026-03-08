"use client";

/**
 * Terrain Component
 * Ground plane for the forest
 */

export function Terrain() {
  return (
    <group>
      {/* Main ground plane - sunset golden earth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial
          color="#8B7355"
          emissive="#8B7355"
          emissiveIntensity={0.15}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export default Terrain;
