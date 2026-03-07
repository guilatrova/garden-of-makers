"use client";

/**
 * ForestScene Component
 * Main R3F Canvas that renders the entire forest
 */

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { TreeData, TreeTier } from "@/lib/services/tree/types";
import { Skybox } from "./Skybox";
import { Terrain } from "./Terrain";
import { TreeLOD } from "./TreeLOD";
import { WorldTreeEffects } from "./WorldTreeEffects";
import { FlightCamera } from "./FlightCamera";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";

export interface ForestSceneProps {
  trees: TreeData[];
  onTreeClick?: (tree: TreeData) => void;
}

// Check if tree is ancient or world tier
function isSpecialTree(tier: TreeTier): boolean {
  return tier === "ancient" || tier === "world";
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#4CAF50" wireframe />
    </mesh>
  );
}

/**
 * Single tree component with special effects wrapper
 */
function TreeWithEffects({
  tree,
  onClick,
  isSelected,
}: {
  tree: TreeData;
  onClick?: (tree: TreeData) => void;
  isSelected: boolean;
}) {
  const handleClick = useCallback(() => {
    onClick?.(tree);
  }, [onClick, tree]);

  const treeContent = (
    <TreeLOD
      data={tree}
      onClick={handleClick}
      showLabel={isSelected}
    />
  );

  // Wrap ancient/world trees with special effects
  if (isSpecialTree(tree.tier)) {
    const tierConfig = getTierConfig(tree.tier);
    const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;

    return (
      <WorldTreeEffects
        tier={tree.tier as "ancient" | "world"}
        treeHeight={height}
        trunkRadius={tierConfig.trunkRadius}
      >
        {treeContent}
      </WorldTreeEffects>
    );
  }

  return treeContent;
}

export function ForestScene({ trees, onTreeClick }: ForestSceneProps) {
  const [selectedTreeSlug, setSelectedTreeSlug] = useState<string | null>(null);

  const handleTreeClick = useCallback(
    (tree: TreeData) => {
      setSelectedTreeSlug(tree.slug);
      onTreeClick?.(tree);
    },
    [onTreeClick]
  );

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 50, 150],
        fov: 60,
        near: 0.1,
        far: 5000,
      }}
      gl={{
        antialias: true,
        alpha: false,
      }}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Lighting and sky */}
        <Skybox timeOfDay={12} shadows />

        {/* Terrain */}
        <Terrain />

        {/* Flight camera */}
        <FlightCamera />

        {/* Trees */}
        {trees.map((tree) => (
          <group
            key={tree.slug}
            position={[tree.position.x, tree.position.y, tree.position.z]}
          >
            <TreeWithEffects
              tree={tree}
              onClick={handleTreeClick}
              isSelected={selectedTreeSlug === tree.slug}
            />
          </group>
        ))}
      </Suspense>
    </Canvas>
  );
}

export default ForestScene;
