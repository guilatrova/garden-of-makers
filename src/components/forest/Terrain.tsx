"use client";

/**
 * Terrain Component
 * Ground plane for the forest with zone boundary indicators
 */

import { useMemo } from "react";
import { DoubleSide } from "three";
import { ZONE_CENTERS, CATEGORY_MAPPINGS, BiomeZone } from "@/lib/constants/categories";

interface ZoneIndicatorProps {
  zone: BiomeZone;
  position: { x: number; z: number };
  color: string;
  radius?: number;
}

function ZoneIndicator({ position, color, radius = 80 }: ZoneIndicatorProps) {
  return (
    <mesh
      position={[position.x, 0.01, position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius - 2, radius, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        side={DoubleSide}
      />
    </mesh>
  );
}

export function Terrain() {
  // Create zone indicators for each biome
  const zoneIndicators = useMemo(() => {
    return CATEGORY_MAPPINGS.map((mapping) => {
      const center = ZONE_CENTERS[mapping.zone];
      return {
        zone: mapping.zone,
        position: center,
        color: mapping.color,
      };
    });
  }, []);

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          color="#4CAF50"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Zone boundary indicators */}
      {zoneIndicators.map((zone) => (
        <ZoneIndicator
          key={zone.zone}
          zone={zone.zone}
          position={zone.position}
          color={zone.color}
          radius={80}
        />
      ))}

      {/* Center zone indicator */}
      <ZoneIndicator
        zone="center"
        position={ZONE_CENTERS.center}
        color="#FFD700"
        radius={50}
      />

      {/* Secondary zone rings for visual depth */}
      {zoneIndicators.map((zone) => (
        <mesh
          key={`${zone.zone}-inner`}
          position={[zone.position.x, 0.02, zone.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[40, 42, 64]} />
          <meshBasicMaterial
            color={zone.color}
            transparent
            opacity={0.08}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default Terrain;
