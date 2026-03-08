"use client";

/**
 * Gazebo 3D Decoration
 * A grand low-poly octagonal gazebo with pillars and a conical roof.
 */

interface GazeboProps {
  isPreview?: boolean;
}

export function Gazebo({ isPreview = false }: GazeboProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  // Pillar positions around the octagonal floor
  const pillarCount = 6;
  const pillarRadius = 1.6;
  const pillars = Array.from({ length: pillarCount }, (_, i) => {
    const angle = (i / pillarCount) * Math.PI * 2;
    return {
      x: Math.cos(angle) * pillarRadius,
      z: Math.sin(angle) * pillarRadius,
    };
  });

  return (
    <group>
      {/* Octagonal floor */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.12, 8]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Pillars */}
      {pillars.map((pos, i) => (
        <mesh key={i} position={[pos.x, 1.5, pos.z]}>
          <cylinderGeometry args={[0.08, 0.08, 2.8, 6]} />
          <meshStandardMaterial
            color="#e8e0d0"
            flatShading
            roughness={0.6}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Roof — hexagonal cone */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[2.3, 1.4, 6]} />
        <meshStandardMaterial
          color="#5a4a3a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Roof rim */}
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[2.2, 2.3, 0.1, 6]} />
        <meshStandardMaterial
          color="#5a4a3a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Small bench inside */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.0, 0.12, 0.5]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Bench legs */}
      <mesh position={[-0.4, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.4]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>
      <mesh position={[0.4, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.25, 0.4]} />
        <meshStandardMaterial
          color="#6B4226"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default Gazebo;
