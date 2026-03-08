"use client";

/**
 * GardenScene Component
 * Smaller, more intimate 3D scene for a maker's personal garden
 */

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { TreeData } from "@/lib/services/tree/types";
import { Skybox } from "@/components/forest/Skybox";
import { Terrain } from "@/components/forest/Terrain";
import { TreeLOD } from "@/components/forest/TreeLOD";
import { WorldTreeEffects } from "@/components/forest/WorldTreeEffects";
import { FlightCamera } from "@/components/forest/FlightCamera";
import { StartupDrawer } from "@/components/detail/StartupDrawer";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";

interface GardenSceneProps {
  trees: TreeData[];
}

// Check if tree is ancient or world tier
function isSpecialTree(tier: string): boolean {
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
    <TreeLOD data={tree} onClick={handleClick} showLabel={isSelected} />
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

export function GardenScene({ trees }: GardenSceneProps) {
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);

  const handleTreeClick = useCallback((tree: TreeData) => {
    setSelectedTree(tree);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTree(null);
  }, []);

  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [0, 15, 30],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Sunset sky and lighting */}
          <Skybox shadows />

          {/* Terrain */}
          <Terrain />

          {/* Flight camera with closer starting position */}
          <FlightCamera />

          {/* Trees - positioned by the layout engine */}
          {trees.map((tree) => (
            <group
              key={tree.slug}
              position={[tree.position.x, tree.position.y, tree.position.z]}
            >
              <TreeWithEffects
                tree={tree}
                onClick={handleTreeClick}
                isSelected={selectedTree?.slug === tree.slug}
              />
            </group>
          ))}
        </Suspense>
      </Canvas>

      {/* Detail Drawer */}
      <StartupDrawer startup={selectedTree} onClose={handleCloseDrawer} />
    </>
  );
}

export default GardenScene;
