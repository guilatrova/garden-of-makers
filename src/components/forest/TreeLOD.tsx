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
import { TreeData } from "@/lib/services/tree/types";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
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

// Distance thresholds for LOD levels - scaled for larger trees
const LOD_THRESHOLDS = {
  near: 100,
  mid: 500,
};

// Frame skip for distance calculation (throttle to every 10 frames)
const FRAME_SKIP = 10;

// Seeded random for deterministic results
const seededRandom = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Simple billboard sprite for far LOD
 */
function TreeBillboard({ tier, height }: { tier: import("@/lib/services/tree/types").TreeTier; height: number }) {
  const canopyColor = CANOPY_COLORS[tier];
  const trunkColor = TRUNK_COLORS[tier];

  // Scale based on tree height
  const scale = Math.max(2, height * 0.5);

  return (
    <Billboard>
      {/* Canopy blob */}
      <mesh>
        <circleGeometry args={[scale * 0.75, 8]} />
        <meshBasicMaterial
          color={canopyColor}
          transparent
          opacity={0.8}
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
function SimplifiedTree({ data }: { data: TreeData }) {
  const tierConfig = getTierConfig(data.tier);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;

  const trunkColor = TRUNK_COLORS[data.tier];
  const canopyColor = CANOPY_COLORS[data.tier];

  const trunkHeight = height * 0.6;
  const trunkY = trunkHeight / 2;
  const trunkTop = trunkHeight;
  const canopyY = trunkTop + tierConfig.canopyRadius * 0.5;

  // Don't render for seed/sprout/shrub
  if (data.tier === "seed" || data.tier === "sprout" || data.tier === "shrub") {
    return (
      <mesh position={[0, height * 0.5, 0]}>
        <sphereGeometry args={[tierConfig.canopyRadius, 4, 3]} />
        <meshStandardMaterial color={canopyColor} flatShading />
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
        <meshStandardMaterial color={canopyColor} flatShading />
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
}: {
  data: TreeData;
  onClick?: (data: TreeData) => void;
  showLabel?: boolean;
}) {
  const tierConfig = getTierConfig(data.tier);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;
  
  const trunkColor = TRUNK_COLORS[data.tier];
  const canopyColor = CANOPY_COLORS[data.tier];

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
        {data.onSale && <ForSaleSign position={[tierConfig.canopyRadius, 0, 0]} />}
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
        {data.onSale && <ForSaleSign position={[tierConfig.canopyRadius, 0, 0]} />}
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
        {data.onSale && <ForSaleSign position={[tierConfig.canopyRadius, 0, 0]} />}
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
        <meshStandardMaterial color={canopyColor} flatShading roughness={0.8} />
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

      {/* For Sale Sign */}
      {data.onSale && <ForSaleSign position={[tierConfig.canopyRadius + 1, 0, 0]} />}
    </group>
  );
}

export function TreeLOD({ data, onClick, showLabel }: TreeLODProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [lodLevel, setLodLevel] = useState<LODLevel>("near");
  const { camera } = useThree();

  // Calculate distance and update LOD (throttled)
  useFrame(({ clock }) => {
    // Only update every FRAME_SKIP frames
    const frame = Math.floor(clock.elapsedTime * 60);
    if (frame % FRAME_SKIP !== 0) return;

    if (!groupRef.current) return;

    const treePosition = groupRef.current.position;
    const cameraPosition = camera.position;

    const distance = treePosition.distanceTo(cameraPosition);

    let newLevel: LODLevel;
    if (distance < LOD_THRESHOLDS.near) {
      newLevel = "near";
    } else if (distance < LOD_THRESHOLDS.mid) {
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
        <FullTree data={data} showLabel={showLabel} />
      )}
      {lodLevel === "mid" && <SimplifiedTree data={data} />}
      {lodLevel === "far" && <TreeBillboard tier={data.tier} height={height} />}
    </group>
  );
}

export default TreeLOD;
