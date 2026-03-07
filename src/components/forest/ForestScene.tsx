"use client";

/**
 * ForestScene Component
 * Main R3F Canvas that renders the forest with intro flyover + zoom-to-tree
 */

import { Suspense, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TreeData } from "@/lib/services/tree/types";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";
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

// ─── Intro Flyover ──────────────────────────────────────────

const INTRO_DURATION = 6; // seconds

// Smootherstep easing (Perlin): zero velocity AND zero acceleration at both ends
function introEase(t: number): number {
  const s = Math.max(0, Math.min(1, t));
  return s * s * s * (s * (s * 6 - 15) + 10);
}

const _introPos = new THREE.Vector3();
const _introLook = new THREE.Vector3();

function IntroFlyover({
  tallestTree,
  onEnd,
}: {
  tallestTree: { x: number; y: number; z: number; height: number } | null;
  onEnd: () => void;
}) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const ended = useRef(false);

  // Target: tallest tree or center
  const tx = tallestTree?.x ?? 0;
  const tz = tallestTree?.z ?? 0;
  const ty = tallestTree?.height ?? 50;

  const { posCurve, lookCurve } = useMemo(() => {
    const posPoints = [
      new THREE.Vector3(-400, 200, 400),   // WP0: Far, high, left
      new THREE.Vector3(-200, 160, 300),   // WP1: Descending
      new THREE.Vector3(0, 120, 200),      // WP2: Approaching center
      new THREE.Vector3(tx + 100, 100, tz + 150), // WP3: Near target
      new THREE.Vector3(tx + 80, 80, tz + 200),   // WP4: Final orbit position
    ];
    const lookPoints = [
      new THREE.Vector3(0, 30, 0),          // WP0: City center
      new THREE.Vector3(tx, ty * 0.5, tz),  // WP1: Toward target
      new THREE.Vector3(tx, ty * 0.3, tz),  // WP2: Locking on
      new THREE.Vector3(tx, ty * 0.3, tz),  // WP3: Holding
      new THREE.Vector3(tx, ty * 0.3, tz),  // WP4: Final
    ];
    const posCurve = new THREE.CatmullRomCurve3(posPoints, false, "centripetal");
    const lookCurve = new THREE.CatmullRomCurve3(lookPoints, false, "centripetal");
    posCurve.getLength();
    lookCurve.getLength();
    return { posCurve, lookCurve };
  }, [tx, tz, ty]);

  useEffect(() => {
    camera.position.set(-400, 200, 400);
    camera.lookAt(0, 30, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (ended.current) return;
    elapsed.current += delta;

    const rawT = Math.min(elapsed.current / INTRO_DURATION, 1);
    const t = introEase(rawT);

    posCurve.getPointAt(t, _introPos);
    lookCurve.getPointAt(t, _introLook);

    camera.position.copy(_introPos);
    camera.lookAt(_introLook);

    if (elapsed.current >= INTRO_DURATION && !ended.current) {
      ended.current = true;
      onEnd();
    }
  });

  return null;
}

// ─── Camera Focus (zoom to tree on click) ───────────────────

function CameraFocus({
  trees,
  focusedTreeSlug,
  controlsRef,
}: {
  trees: TreeData[];
  focusedTreeSlug: string | null;
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

  useEffect(() => {
    treesRef.current = trees;
  }, [trees]);

  useEffect(() => {
    if (!focusedTreeSlug) {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
      }
      return;
    }

    const tree = treesRef.current.find((t) => t.slug === focusedTreeSlug);
    if (!tree) return;

    const tierConfig = getTierConfig(tree.tier);
    const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;

    // Capture current camera state
    startPos.current.copy(camera.position);
    if (controlsRef.current) {
      startLook.current.copy(controlsRef.current.target);
    }

    const dist = Math.max(30, height * 2.5);
    const camHeight = Math.max(20, height * 1.2);

    endPos.current.set(
      tree.position.x + dist,
      camHeight,
      tree.position.z + dist
    );
    endLook.current.set(
      tree.position.x,
      height * 0.4,
      tree.position.z
    );

    progress.current = 0;
    active.current = true;

    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  }, [focusedTreeSlug, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!active.current || progress.current >= 1) return;

    progress.current = Math.min(1, progress.current + delta * 0.7);
    // Ease-out cubic
    const t = 1 - Math.pow(1 - progress.current, 3);

    camera.position.lerpVectors(startPos.current, endPos.current, t);

    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(startLook.current, endLook.current, t);
      controlsRef.current.update();
    }

    if (progress.current >= 1) {
      active.current = false;
    }
  });

  return null;
}

// ─── Orbit Controls Scene ───────────────────────────────────

function OrbitScene({
  trees,
  focusedTreeSlug,
}: {
  trees: TreeData[];
  focusedTreeSlug: string | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  return (
    <>
      <CameraFocus
        trees={trees}
        focusedTreeSlug={focusedTreeSlug}
        controlsRef={controlsRef}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={1000}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate
        autoRotateSpeed={0.15}
      />
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function ForestScene({ trees, onTreeClick }: ForestSceneProps) {
  const [selectedTreeSlug, setSelectedTreeSlug] = useState<string | null>(null);
  const [introMode, setIntroMode] = useState(true);

  const handleTreeClick = useCallback(
    (tree: TreeData) => {
      setSelectedTreeSlug(tree.slug);
      onTreeClick?.(tree);
    },
    [onTreeClick]
  );

  const handleIntroEnd = useCallback(() => {
    setIntroMode(false);
  }, []);

  // Find tallest tree for intro target
  const tallestTree = useMemo(() => {
    if (trees.length === 0) return null;
    let best = trees[0];
    let bestHeight = 0;
    for (const tree of trees) {
      const h = BASE_TREE_HEIGHT * getTierConfig(tree.tier).relativeHeight;
      if (h > bestHeight) {
        bestHeight = h;
        best = tree;
      }
    }
    return { x: best.position.x, y: best.position.y, z: best.position.z, height: bestHeight };
  }, [trees]);

  return (
    <Canvas
      shadows
      camera={{
        position: [-400, 200, 400],
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

        {/* Dark ground + grid */}
        <Ground />
        <GridOverlay />

        {/* Intro flyover or orbit controls */}
        {introMode ? (
          <IntroFlyover tallestTree={tallestTree} onEnd={handleIntroEnd} />
        ) : (
          <OrbitScene trees={trees} focusedTreeSlug={selectedTreeSlug} />
        )}

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
