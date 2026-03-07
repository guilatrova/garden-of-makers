"use client";

/**
 * Tree 3D Component
 * Parametric low-poly tree that changes based on TreeTier
 * Height is the star - trees must be tall and imposing
 */

import { useMemo, useRef } from "react";
import { Mesh, Group, CylinderGeometry, SphereGeometry, IcosahedronGeometry } from "three";
import { useFrame } from "@react-three/fiber";
import { getTierConfig, getEffectiveMRR } from "@/lib/services/tree/TreeCalculator";
import { TreeData, TreeTier } from "@/lib/services/tree/types";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";

export interface TreeProps {
  data: TreeData;
  onClick?: (data: TreeData) => void;
  showLabel?: boolean;
}

// Color palettes for each tier
export const TRUNK_COLORS: Record<TreeTier, string> = {
  seed: "#8B4513",
  sprout: "#228B22", // Green stem, no trunk
  shrub: "#228B22", // Bush, no visible trunk
  young: "#DEB887", // Birch-like
  mature: "#8B4513", // Oak
  great: "#654321", // Darker brown
  ancient: "#4A3728", // Sequoia
  world: "#3D2914", // Dark bark with glow
};

export const CANOPY_COLORS: Record<TreeTier, string> = {
  seed: "#8B4513",
  sprout: "#90EE90", // Light green
  shrub: "#228B22", // Forest green
  young: "#7CFC00", // Lawn green
  mature: "#32CD32", // Lime green
  great: "#228B22", // Forest green
  ancient: "#006400", // Dark green
  world: "#9ACD32", // Golden-green
};

/**
 * Calculate interpolated height within tier range
 * Uses effective MRR (with 30-day revenue fallback) for consistent sizing
 */
function getInterpolatedHeight(tree: TreeData): number {
  const config = getTierConfig(tree.tier);
  const baseHeight = BASE_TREE_HEIGHT * config.relativeHeight;

  // For tiers with maxMrrCents, interpolate height within the tier
  if (config.maxMrrCents !== null && config.minMrrCents !== config.maxMrrCents) {
    const tierRange = config.maxMrrCents - config.minMrrCents;
    // Use effective MRR for consistent height calculation
    const effectiveMRR = getEffectiveMRR(tree.mrrCents, tree.revenueLast30DaysCents);
    const mrrInTier = effectiveMRR - config.minMrrCents;
    const progress = Math.min(1, Math.max(0, mrrInTier / tierRange));
    
    // Interpolate between 80% and 100% of the tier's relative height
    // This ensures trees grow within their tier
    const minHeightFactor = 0.8;
    const heightFactor = minHeightFactor + progress * (1 - minHeightFactor);
    return baseHeight * heightFactor;
  }

  return baseHeight;
}

/**
 * Get trunk geometry based on tier
 */
function getTrunkGeometry(tier: TreeTier, height: number, radius: number): CylinderGeometry | null {
  switch (tier) {
    case "seed":
      return null; // No trunk, just a mound
    case "sprout":
      return new CylinderGeometry(radius * 0.5, radius * 0.5, height * 0.8, 5);
    case "shrub":
      return null; // No visible trunk
    case "young":
      return new CylinderGeometry(radius * 0.6, radius * 0.8, height * 0.4, 6);
    case "mature":
      return new CylinderGeometry(radius * 0.7, radius * 0.9, height * 0.35, 7);
    case "great":
      return new CylinderGeometry(radius * 0.8, radius, height * 0.4, 8);
    case "ancient":
      return new CylinderGeometry(radius * 0.85, radius, height * 0.45, 8);
    case "world":
      return new CylinderGeometry(radius * 0.9, radius, height * 0.5, 10);
  }
}

/**
 * Get canopy geometry based on tier
 */
function getCanopyGeometry(tier: TreeTier, radius: number): SphereGeometry | IcosahedronGeometry | null {
  switch (tier) {
    case "seed":
      return new SphereGeometry(radius, 4, 3);
    case "sprout":
      // 2-3 tiny leaves as small spheres
      return null; // Handle specially
    case "shrub":
      return new IcosahedronGeometry(radius, 1);
    case "young":
      return new IcosahedronGeometry(radius, 1);
    case "mature":
      return new IcosahedronGeometry(radius, 1);
    case "great":
      return new IcosahedronGeometry(radius, 2);
    case "ancient":
      return new IcosahedronGeometry(radius, 2);
    case "world":
      return new IcosahedronGeometry(radius, 2);
  }
}

export function Tree({ data, onClick }: TreeProps) {
  const groupRef = useRef<Group>(null);
  const trunkRef = useRef<Mesh>(null);

  const tierConfig = useMemo(() => getTierConfig(data.tier), [data.tier]);
  const height = useMemo(() => getInterpolatedHeight(data), [data]);
  
  const trunkGeometry = useMemo(() => {
    return getTrunkGeometry(data.tier, height, tierConfig.trunkRadius);
  }, [data.tier, height, tierConfig.trunkRadius]);

  const canopyGeometry = useMemo(() => {
    return getCanopyGeometry(data.tier, tierConfig.canopyRadius);
  }, [data.tier, tierConfig.canopyRadius]);

  const trunkColor = TRUNK_COLORS[data.tier];
  const canopyColor = CANOPY_COLORS[data.tier];

  // Subtle sway animation for taller trees
  useFrame(({ clock }) => {
    if (groupRef.current && (data.tier === "great" || data.tier === "ancient" || data.tier === "world")) {
      const time = clock.getElapsedTime();
      const swayAmount = 0.005 * (data.tier === "world" ? 1.5 : data.tier === "ancient" ? 1 : 0.5);
      groupRef.current.rotation.z = Math.sin(time * 0.5) * swayAmount;
      groupRef.current.rotation.x = Math.cos(time * 0.3) * swayAmount * 0.5;
    }
  });

  const handleClick = () => {
    onClick?.(data);
  };

  // Seed tier - just a small mound
  if (data.tier === "seed") {
    return (
      <group ref={groupRef} onClick={handleClick}>
        <mesh position={[0, tierConfig.canopyRadius * 0.3, 0]}>
          <sphereGeometry args={[tierConfig.canopyRadius, 4, 3]} />
          <meshStandardMaterial color={trunkColor} flatShading />
        </mesh>
      </group>
    );
  }

  // Sprout tier - thin stem with tiny leaves
  if (data.tier === "sprout") {
    return (
      <group ref={groupRef} onClick={handleClick}>
        {/* Stem */}
        <mesh position={[0, height * 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.03, height * 0.8, 4]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
        {/* Leaves */}
        <mesh position={[0.05, height * 0.9, 0.02]}>
          <sphereGeometry args={[0.06, 4, 3]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
        <mesh position={[-0.04, height * 0.85, 0.03]}>
          <sphereGeometry args={[0.05, 4, 3]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
        <mesh position={[0.02, height * 0.88, -0.04]}>
          <sphereGeometry args={[0.04, 4, 3]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
      </group>
    );
  }

  // Shrub tier - round bushy shape, no visible trunk
  if (data.tier === "shrub") {
    return (
      <group ref={groupRef} onClick={handleClick}>
        <mesh position={[0, height * 0.5, 0]}>
          <icosahedronGeometry args={[tierConfig.canopyRadius, 1]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
      </group>
    );
  }

  // Standard tree with trunk and canopy
  const trunkHeight = height * 0.6;
  const trunkY = trunkHeight / 2;
  const trunkTop = trunkHeight;
  const canopyY = trunkTop + tierConfig.canopyRadius * 0.5;

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Trunk */}
      {trunkGeometry && (
        <mesh
          ref={trunkRef}
          position={[0, trunkY, 0]}
          geometry={trunkGeometry}
        >
          <meshStandardMaterial color={trunkColor} flatShading roughness={0.9} />
        </mesh>
      )}

      {/* Canopy */}
      {canopyGeometry && (
        <mesh position={[0, canopyY, 0]} geometry={canopyGeometry}>
          <meshStandardMaterial 
            color={canopyColor} 
            flatShading 
            roughness={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

export default Tree;
