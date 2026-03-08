"use client";

/**
 * GardenScene Component
 * Personal garden for a maker — trees around a central fenced plot.
 * Uses OrbitControls, TreeLOD, growth animation, and focus beacon.
 */

import { Suspense, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TreeData } from "@/lib/services/tree/types";
import { GardenPlot } from "@/lib/services/garden/GardenLayoutEngine";
import { Skybox, type SkyboxProps } from "@/components/forest/Skybox";
import { Terrain, type TerrainProps } from "@/components/forest/Terrain";
import { TreeLOD } from "@/components/forest/TreeLOD";
import { WorldTreeEffects } from "@/components/forest/WorldTreeEffects";
import { StartupDrawer } from "@/components/detail/StartupDrawer";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";

interface GardenSceneProps {
  trees: TreeData[];
  plot: GardenPlot;
  sky?: Omit<SkyboxProps, "shadows">;
  terrain?: TerrainProps;
}

// ─── Garden Plot (fenced rectangular area) ─────────────────

function GardenPlotMesh({ width, depth }: GardenPlot) {
  const postHeight = 1.8;
  const railHeight = 0.7;

  // Corner and intermediate fence posts
  const posts = useMemo(() => {
    const p: [number, number][] = [];
    const halfW = width / 2;
    const halfD = depth / 2;

    // Corners
    p.push([-halfW, -halfD], [-halfW, halfD], [halfW, -halfD], [halfW, halfD]);

    // Intermediate posts along edges (every ~10 units)
    const stepsX = Math.max(1, Math.round(width / 10));
    const stepsZ = Math.max(1, Math.round(depth / 10));

    for (let i = 1; i < stepsX; i++) {
      const x = -halfW + (width / stepsX) * i;
      p.push([x, -halfD], [x, halfD]);
    }
    for (let i = 1; i < stepsZ; i++) {
      const z = -halfD + (depth / stepsZ) * i;
      p.push([-halfW, z], [halfW, z]);
    }
    return p;
  }, [width, depth]);

  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group>
      {/* Plot ground — grass-tinted */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#5e7a4a"
          roughness={0.95}
          emissive="#5e7a4a"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Fence posts */}
      {posts.map(([x, z], i) => (
        <mesh key={`post-${i}`} position={[x, postHeight / 2, z]}>
          <boxGeometry args={[0.25, postHeight, 0.25]} />
          <meshStandardMaterial color="#8B6914" roughness={0.85} />
        </mesh>
      ))}

      {/* Horizontal rails — front, back, left, right */}
      {/* Front rail */}
      <mesh position={[0, railHeight, halfD]}>
        <boxGeometry args={[width, 0.12, 0.12]} />
        <meshStandardMaterial color="#A0792C" roughness={0.8} />
      </mesh>
      {/* Back rail */}
      <mesh position={[0, railHeight, -halfD]}>
        <boxGeometry args={[width, 0.12, 0.12]} />
        <meshStandardMaterial color="#A0792C" roughness={0.8} />
      </mesh>
      {/* Left rail */}
      <mesh position={[-halfW, railHeight, 0]}>
        <boxGeometry args={[0.12, 0.12, depth]} />
        <meshStandardMaterial color="#A0792C" roughness={0.8} />
      </mesh>
      {/* Right rail */}
      <mesh position={[halfW, railHeight, 0]}>
        <boxGeometry args={[0.12, 0.12, depth]} />
        <meshStandardMaterial color="#A0792C" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Camera Focus (smooth zoom to selected tree) ──────────

function CameraFocus({
  trees,
  focusedSlug,
  controlsRef,
}: {
  trees: TreeData[];
  focusedSlug: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const startPos = useRef(new THREE.Vector3());
  const startLook = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const endLook = useRef(new THREE.Vector3());
  const progress = useRef(1);
  const active = useRef(false);
  const treesRef = useRef(trees);
  useEffect(() => { treesRef.current = trees; }, [trees]);

  useEffect(() => {
    if (!focusedSlug) {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
      return;
    }

    const tree = treesRef.current.find((t) => t.slug === focusedSlug);
    if (!tree) return;

    const tc = getTierConfig(tree.tier);
    const height = BASE_TREE_HEIGHT * tc.relativeHeight;
    const trunkTop = height * 0.6;
    const canopyCenter = trunkTop + tc.canopyRadius * 0.5;
    const dist = Math.max(12, tc.canopyRadius * 3);

    startPos.current.copy(camera.position);
    if (controlsRef.current) startLook.current.copy(controlsRef.current.target);

    endPos.current.set(
      tree.position.x + dist * 0.7,
      canopyCenter + tc.canopyRadius * 0.6,
      tree.position.z + dist * 0.7
    );
    endLook.current.set(tree.position.x, canopyCenter, tree.position.z);

    progress.current = 0;
    active.current = true;
    if (controlsRef.current) controlsRef.current.autoRotate = false;
  }, [focusedSlug, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!active.current || progress.current >= 1) return;

    progress.current = Math.min(1, progress.current + delta * 0.8);
    const t = 1 - Math.pow(1 - progress.current, 3); // ease-out cubic

    camera.position.lerpVectors(startPos.current, endPos.current, t);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(startLook.current, endLook.current, t);
      controlsRef.current.update();
    }

    if (progress.current >= 1) active.current = false;
  });

  return null;
}

// ─── Focus Beacon (light beam + floating diamond) ─────────

const BEACON_ACCENT = "#4ade80";

function FocusBeacon({
  treeHeight,
  canopyRadius,
}: {
  treeHeight: number;
  canopyRadius: number;
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coneRef.current) {
      (coneRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(t * 1.5) * 0.03;
    }
    if (markerRef.current) {
      markerRef.current.position.y = treeHeight + 10 + Math.sin(t * 2) * 2;
      markerRef.current.rotation.y = t * 1.5;
    }
  });

  const coneRadius = Math.max(canopyRadius * 1.5, 4);
  const diamondSize = Math.max(canopyRadius * 0.35, 1.5);
  const spotlightY = 150;

  return (
    <group>
      <mesh ref={coneRef} position={[0, spotlightY / 2, 0]}>
        <cylinderGeometry args={[0, coneRadius, spotlightY, 24, 1, true]} />
        <meshBasicMaterial
          color={BEACON_ACCENT}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, spotlightY / 2, 0]}>
        <boxGeometry args={[0.6, spotlightY, 0.6]} />
        <meshBasicMaterial color={BEACON_ACCENT} transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <group ref={markerRef} position={[0, treeHeight + 10, 0]}>
        <mesh>
          <octahedronGeometry args={[diamondSize, 0]} />
          <meshBasicMaterial color={BEACON_ACCENT} />
        </mesh>
        <mesh scale={[1.5, 1.5, 1.5]}>
          <octahedronGeometry args={[diamondSize, 0]} />
          <meshBasicMaterial color={BEACON_ACCENT} transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Growing Tree (scale-up animation) ────────────────────

const GROW_DURATION = 0.8;
const MAX_STAGGER = 2;

function GrowingTree({
  children,
  order,
  total,
}: {
  children: React.ReactNode;
  order: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);
  const done = useRef(false);
  const delay = order * Math.min(0.15, MAX_STAGGER / Math.max(1, total));

  useFrame(({ clock }) => {
    if (!groupRef.current || done.current) return;

    if (startTime.current === null) startTime.current = clock.elapsedTime;

    const elapsed = clock.elapsedTime - startTime.current - delay;
    if (elapsed < 0) {
      groupRef.current.scale.set(1, 0, 1);
      return;
    }

    const progress = Math.min(1, elapsed / GROW_DURATION);
    const t = 1 - Math.pow(1 - progress, 3);
    groupRef.current.scale.set(1, t, 1);

    if (progress >= 1) done.current = true;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Tree with WorldTreeEffects wrapper ───────────────────

function TreeWithEffects({
  tree,
  onClick,
  isSelected,
}: {
  tree: TreeData;
  onClick: (tree: TreeData) => void;
  isSelected: boolean;
}) {
  const handleClick = useCallback(() => onClick(tree), [onClick, tree]);

  const treeContent = (
    <TreeLOD data={tree} onClick={handleClick} showLabel={isSelected} />
  );

  if (tree.tier === "ancient" || tree.tier === "world") {
    const tc = getTierConfig(tree.tier);
    const height = BASE_TREE_HEIGHT * tc.relativeHeight;
    return (
      <WorldTreeEffects
        tier={tree.tier as "ancient" | "world"}
        treeHeight={height}
        trunkRadius={tc.trunkRadius}
      >
        {treeContent}
      </WorldTreeEffects>
    );
  }

  return treeContent;
}

// ─── Main GardenScene ─────────────────────────────────────

export function GardenScene({ trees, plot, sky, terrain }: GardenSceneProps) {
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const handleTreeClick = useCallback((tree: TreeData) => {
    setSelectedTree(tree);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTree(null);
  }, []);

  // Compute grow order: front trees first (highest Z first)
  const growOrder = useMemo(() => {
    const withZ = trees.map((t, i) => ({ index: i, z: t.position.z }));
    withZ.sort((a, b) => b.z - a.z); // front (high Z) first
    const order = new Array<number>(trees.length);
    withZ.forEach((item, pos) => { order[item.index] = pos; });
    return order;
  }, [trees]);

  // Camera: high enough to see horizon bands of the sky dome (like the forest)
  const cameraZ = plot.depth / 2 + 50;
  const cameraY = Math.max(60, plot.depth * 1.5);

  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [0, cameraY, cameraZ],
          fov: 55,
          near: 0.1,
          far: 5000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <Skybox shadows {...sky} />
          <Terrain {...terrain} />

          {/* Fenced garden plot */}
          <GardenPlotMesh width={plot.width} depth={plot.depth} />

          {/* Orbit controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            target={[0, 3, 0]}
            minDistance={10}
            maxDistance={200}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate
            autoRotateSpeed={0.2}
          />

          {/* Camera focus on selected tree */}
          <CameraFocus
            trees={trees}
            focusedSlug={selectedTree?.slug ?? null}
            controlsRef={controlsRef}
          />

          {/* Trees */}
          {trees.map((tree, i) => {
            const isSelected = selectedTree?.slug === tree.slug;
            const tc = getTierConfig(tree.tier);
            const h = BASE_TREE_HEIGHT * tc.relativeHeight;
            return (
              <group
                key={tree.slug}
                position={[tree.position.x, tree.position.y, tree.position.z]}
              >
                <GrowingTree order={growOrder[i]} total={trees.length}>
                  <TreeWithEffects
                    tree={tree}
                    onClick={handleTreeClick}
                    isSelected={isSelected}
                  />
                </GrowingTree>
                {isSelected && (
                  <FocusBeacon treeHeight={h} canopyRadius={tc.canopyRadius} />
                )}
              </group>
            );
          })}
        </Suspense>
      </Canvas>

      <StartupDrawer startup={selectedTree} onClose={handleCloseDrawer} />
    </>
  );
}

export default GardenScene;
