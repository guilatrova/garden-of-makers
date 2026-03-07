"use client";

/**
 * ForestScene Component
 * Main R3F Canvas that renders the forest as a city of buildings
 */

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TreeData } from "@/lib/services/tree/types";
import { Skybox } from "./Skybox";
import { TreeLOD } from "./TreeLOD";

export interface ForestSceneProps {
  trees: TreeData[];
  onTreeClick?: (tree: TreeData) => void;
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
 * Ground plane
 */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
    </mesh>
  );
}

/**
 * Grid overlay on the ground
 */
function GridOverlay() {
  return (
    <gridHelper
      args={[2000, 200, "#2a2a4e", "#222244"]}
      position={[0, 0.01, 0]}
    />
  );
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
        position: [0, 80, 200],
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
        {/* Sky and lighting */}
        <Skybox timeOfDay={12} shadows />

        {/* Dark ground + grid (city-like) */}
        <Ground />
        <GridOverlay />

        {/* Simple orbit controls instead of flight camera */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={1000}
          maxPolarAngle={Math.PI / 2.1}
        />

        {/* Trees */}
        {trees.map((tree) => (
          <group
            key={tree.slug}
            position={[tree.position.x, tree.position.y, tree.position.z]}
          >
            <TreeLOD
              data={tree}
              onClick={() => handleTreeClick(tree)}
              showLabel={selectedTreeSlug === tree.slug}
            />
          </group>
        ))}
      </Suspense>
    </Canvas>
  );
}

export default ForestScene;
