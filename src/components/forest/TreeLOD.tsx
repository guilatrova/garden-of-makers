"use client";

/**
 * TreeLOD Component
 * Level of Detail wrapper for trees
 * - Near (< 50): Full detail with fruits and label
 * - Mid (50-200): Simplified tree, no fruits, no label
 * - Far (> 200): Billboard sprite
 */

import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { MeshStandardMaterial } from "three";
import { TreeData } from "@/lib/services/tree/types";
import { getTierConfig, getDealRating, DealRating } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";
import { CANOPY_COLORS, TRUNK_COLORS } from "./Tree";
import { FruitCluster } from "./FruitCluster";
import { TreeLabel } from "./TreeLabel";
import { ForSaleSign } from "./ForSaleSign";

export interface TreeLODProps {
  data: TreeData;
  onClick?: (data: TreeData) => void;
  showLabel?: boolean;
}

type LODLevel = "near" | "mid" | "far";

const DEAL_CANOPY_COLORS: Record<DealRating, string> = {
  great: "#FFD700", // Gold
  good: "#CC2222",  // Red
};

// Distance thresholds for LOD levels - scaled for larger trees
const LOD_THRESHOLDS = {
  near: 100,
  mid: 500,
};

// Frame skip for distance calculation (throttle to every 10 frames)
const FRAME_SKIP = 10;
const _worldPos = new THREE.Vector3();

// Seeded random for deterministic results
const seededRandom = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Simple billboard sprite for far LOD
 */
function TreeBillboard({ tier, height, canopyColorOverride, glowing }: { tier: import("@/lib/services/tree/types").TreeTier; height: number; canopyColorOverride?: string; glowing?: boolean }) {
  const canopyColor = canopyColorOverride ?? CANOPY_COLORS[tier];
  const trunkColor = TRUNK_COLORS[tier];

  // Scale based on tree height
  const scale = Math.max(2, height * 0.5);

  return (
    <Billboard>
      {/* Canopy blob */}
      <mesh>
        <circleGeometry args={[scale * 0.75, 8]} />
        <meshStandardMaterial
          color={canopyColor}
          transparent
          opacity={0.8}
          emissive={glowing ? canopyColor : "#000000"}
          emissiveIntensity={glowing ? 0.5 : 0}
        />
      </mesh>
      {/* Trunk indicator */}
      <mesh position={[0, -scale * 0.6, 0]}>
        <circleGeometry args={[scale * 0.12, 6]} />
        <meshBasicMaterial color={trunkColor} />
      </mesh>
    </Billboard>
  );
}

/**
 * Simplified tree for mid LOD (no fruits, no label)
 */
function SimplifiedTree({ data, canopyColorOverride, glowing }: { data: TreeData; canopyColorOverride?: string; glowing?: boolean }) {
  const tierConfig = getTierConfig(data.tier);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;
  const canopyMatRef = useRef<MeshStandardMaterial>(null);

  const trunkColor = TRUNK_COLORS[data.tier];
  const canopyColor = canopyColorOverride ?? CANOPY_COLORS[data.tier];

  useFrame(({ clock }) => {
    if (glowing && canopyMatRef.current) {
      canopyMatRef.current.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  const trunkHeight = height * 0.6;
  const trunkY = trunkHeight / 2;
  const trunkTop = trunkHeight;
  const canopyY = trunkTop + tierConfig.canopyRadius * 0.5;

  // Don't render for seed/sprout/shrub
  if (data.tier === "seed" || data.tier === "sprout" || data.tier === "shrub") {
    return (
      <mesh position={[0, height * 0.5, 0]}>
        <sphereGeometry args={[tierConfig.canopyRadius, 4, 3]} />
        <meshStandardMaterial ref={canopyMatRef} color={canopyColor} flatShading emissive={glowing ? canopyColor : "#000000"} emissiveIntensity={glowing ? 0.3 : 0} />
      </mesh>
    );
  }

  return (
    <group>
      {/* Simple trunk */}
      <mesh position={[0, trunkY, 0]}>
        <cylinderGeometry
          args={[
            tierConfig.trunkRadius * 0.7,
            tierConfig.trunkRadius,
            trunkHeight,
            5
          ]}
        />
        <meshStandardMaterial color={trunkColor} flatShading />
      </mesh>

      {/* Simple canopy */}
      <mesh position={[0, canopyY, 0]}>
        <icosahedronGeometry args={[tierConfig.canopyRadius, 0]} />
        <meshStandardMaterial ref={canopyMatRef} color={canopyColor} flatShading emissive={glowing ? canopyColor : "#000000"} emissiveIntensity={glowing ? 0.3 : 0} />
      </mesh>
    </group>
  );
}

/**
 * Full detail tree for near LOD
 */
function FullTree({
  data,
  onClick,
  showLabel,
  canopyColorOverride,
  glowing,
}: {
  data: TreeData;
  onClick?: (data: TreeData) => void;
  showLabel?: boolean;
  canopyColorOverride?: string;
  glowing?: boolean;
}) {
  const tierConfig = getTierConfig(data.tier);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;
  const canopyMatRef = useRef<MeshStandardMaterial>(null);

  const trunkColor = TRUNK_COLORS[data.tier];
  const canopyColor = canopyColorOverride ?? CANOPY_COLORS[data.tier];

  useFrame(({ clock }) => {
    if (glowing && canopyMatRef.current) {
      canopyMatRef.current.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  const trunkHeight = height * 0.6;
  const trunkY = trunkHeight / 2;
  const trunkTop = trunkHeight;
  const canopyY = trunkTop + tierConfig.canopyRadius * 0.5;

  // Generate deterministic leaf positions
  const leafPositions = useMemo(() => {
    return [0, 1, 2].map((i) => ({
      x: (seededRandom(i) - 0.5) * 0.1,
      y: height * (0.85 + seededRandom(i + 10) * 0.1),
      z: (seededRandom(i + 20) - 0.5) * 0.1,
    }));
  }, [height]);

  const handleClick = () => {
    onClick?.(data);
  };

  // Seed tier
  if (data.tier === "seed") {
    return (
      <group onClick={handleClick}>
        <mesh position={[0, tierConfig.canopyRadius * 0.3, 0]}>
          <sphereGeometry args={[tierConfig.canopyRadius, 4, 3]} />
          <meshStandardMaterial color={trunkColor} flatShading />
        </mesh>
      </group>
    );
  }

  // Sprout tier
  if (data.tier === "sprout") {
    return (
      <group onClick={handleClick}>
        <mesh position={[0, height * 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.03, height * 0.8, 4]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
        {/* Leaves */}
        {leafPositions.map((pos, i) => (
          <mesh
            key={i}
            position={[pos.x, pos.y, pos.z]}
          >
            <sphereGeometry args={[0.05, 4, 3]} />
            <meshStandardMaterial color={canopyColor} flatShading />
          </mesh>
        ))}
      </group>
    );
  }

  // Shrub tier
  if (data.tier === "shrub") {
    return (
      <group onClick={handleClick}>
        <mesh position={[0, height * 0.5, 0]}>
          <icosahedronGeometry args={[tierConfig.canopyRadius, 1]} />
          <meshStandardMaterial color={canopyColor} flatShading />
        </mesh>
      </group>
    );
  }

  // Standard tree
  return (
    <group onClick={handleClick}>
      {/* Trunk */}
      <mesh position={[0, trunkY, 0]}>
        <cylinderGeometry
          args={[
            tierConfig.trunkRadius * 0.7,
            tierConfig.trunkRadius,
            trunkHeight,
            data.tier === "world" || data.tier === "ancient" ? 8 : 6,
          ]}
        />
        <meshStandardMaterial color={trunkColor} flatShading roughness={0.9} />
      </mesh>

      {/* Canopy */}
      <mesh position={[0, canopyY, 0]}>
        <icosahedronGeometry
          args={[
            tierConfig.canopyRadius,
            data.tier === "world" || data.tier === "ancient" ? 2 : 1,
          ]}
        />
        <meshStandardMaterial ref={canopyMatRef} color={canopyColor} flatShading roughness={0.8} emissive={glowing ? canopyColor : "#000000"} emissiveIntensity={glowing ? 0.3 : 0} />
      </mesh>

      {/* Fruits */}
      <FruitCluster
        fruits={data.fruits}
        canopyRadius={tierConfig.canopyRadius}
        canopyHeight={canopyY}
      />

      {/* Label */}
      {showLabel && (
        <TreeLabel
          data={data}
          visible={true}
          position={[0, canopyY + tierConfig.canopyRadius + 2, 0]}
        />
      )}

    </group>
  );
}

export function TreeLOD({ data, onClick, showLabel }: TreeLODProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [lodLevel, setLodLevel] = useState<LODLevel>("near");
  const { camera } = useThree();

  // Scale LOD thresholds by tree height so small plants stay as billboards longer
  const lodScale = useMemo(() => {
    const h = BASE_TREE_HEIGHT * getTierConfig(data.tier).relativeHeight;
    return Math.min(1, Math.max(0.15, h / 40));
  }, [data.tier]);

  // Calculate distance and update LOD (throttled)
  useFrame(({ clock }) => {
    // Only update every FRAME_SKIP frames
    const frame = Math.floor(clock.elapsedTime * 60);
    if (frame % FRAME_SKIP !== 0) return;

    if (!groupRef.current) return;

    const treePosition = groupRef.current.getWorldPosition(_worldPos);
    const distance = treePosition.distanceTo(camera.position);

    const nearThreshold = LOD_THRESHOLDS.near * lodScale;
    const midThreshold = LOD_THRESHOLDS.mid * lodScale;

    let newLevel: LODLevel;
    if (distance < nearThreshold) {
      newLevel = "near";
    } else if (distance < midThreshold) {
      newLevel = "mid";
    } else {
      newLevel = "far";
    }

    if (newLevel !== lodLevel) {
      setLodLevel(newLevel);
    }
  });

  const tierConfig = useMemo(() => getTierConfig(data.tier), [data.tier]);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;

  const dealRating = useMemo(() => getDealRating(data), [data]);
  const canopyColorOverride = dealRating ? DEAL_CANOPY_COLORS[dealRating] : undefined;
  const glowing = dealRating === "great";

  // Invisible hitbox: always present, covers the full tree height + canopy
  const trunkTop = height * 0.6;
  const canopyCenter = trunkTop + tierConfig.canopyRadius * 0.5;
  const hitboxHeight = canopyCenter + tierConfig.canopyRadius;
  const hitboxRadius = Math.max(tierConfig.canopyRadius, 3);

  const handleClick = () => onClick?.(data);

  return (
    <group ref={groupRef}>
      {/* Invisible clickable hitbox — always present at all LOD levels */}
      <mesh
        position={[0, hitboxHeight / 2, 0]}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
        visible={false}
      >
        <cylinderGeometry args={[hitboxRadius, hitboxRadius, hitboxHeight, 8]} />
        <meshBasicMaterial />
      </mesh>

      {lodLevel === "near" && (
        <FullTree data={data} showLabel={showLabel} canopyColorOverride={canopyColorOverride} glowing={glowing} />
      )}
      {lodLevel === "mid" && <SimplifiedTree data={data} canopyColorOverride={canopyColorOverride} glowing={glowing} />}
      {lodLevel === "far" && <TreeBillboard tier={data.tier} height={height} canopyColorOverride={canopyColorOverride} glowing={glowing} />}

      {/* ForSaleSign visible at near and mid LOD */}
      {data.onSale && lodLevel !== "far" && <ForSaleSign treeHeight={height} canopyRadius={tierConfig.canopyRadius} askingPriceCents={data.askingPriceCents} dealRating={dealRating} />}
    </group>
  );
}

export default TreeLOD;
