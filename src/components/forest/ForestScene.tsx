"use client";

/**
 * ForestScene Component
 * Main R3F Canvas that renders the forest with intro flyover + zoom-to-tree
 */

import React, { Suspense, useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  flyMode?: boolean;
  onExitFly?: () => void;
  holdGrowth?: boolean;
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
      <meshStandardMaterial color="#4A3728" roughness={0.9} />
    </mesh>
  );
}

/**
 * Grid overlay on the ground
 */
function GridOverlay() {
  return (
    <gridHelper
      args={[2000, 200, "#5C4A3A", "#503E30"]}
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

    // Position camera close to the tree, like git-city does with buildings
    const trunkTop = height * 0.6;
    const canopyCenter = trunkTop + tierConfig.canopyRadius * 0.5;
    const canopyTop = canopyCenter + tierConfig.canopyRadius;

    // Camera offset: close, slightly above canopy, looking at canopy center
    const dist = Math.max(15, tierConfig.canopyRadius * 3);

    endPos.current.set(
      tree.position.x + dist,
      canopyTop + tierConfig.canopyRadius * 0.5,
      tree.position.z + dist
    );
    endLook.current.set(
      tree.position.x,
      canopyCenter,
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

// ─── Focus Beacon (light beam + floating diamond on selected tree) ───

const BEACON_HEIGHT = 300;
const SPOTLIGHT_Y = 250;
const ACCENT_COLOR = "#4ade80"; // green-400

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
      markerRef.current.position.y = treeHeight + 15 + Math.sin(t * 2) * 3;
      markerRef.current.rotation.y = t * 1.5;
    }
  });

  const coneRadius = Math.max(canopyRadius * 1.5, 5);
  const diamondSize = Math.max(canopyRadius * 0.4, 2);

  return (
    <group>
      {/* Spotlight cone from sky */}
      <mesh ref={coneRef} position={[0, SPOTLIGHT_Y / 2, 0]}>
        <cylinderGeometry args={[0, coneRadius, SPOTLIGHT_Y, 32, 1, true]} />
        <meshBasicMaterial
          color={ACCENT_COLOR}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Thin bright core beam */}
      <mesh position={[0, BEACON_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.8, BEACON_HEIGHT, 0.8]} />
        <meshBasicMaterial color={ACCENT_COLOR} transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Floating diamond marker */}
      <group ref={markerRef} position={[0, treeHeight + 15, 0]}>
        <mesh>
          <octahedronGeometry args={[diamondSize, 0]} />
          <meshBasicMaterial color={ACCENT_COLOR} />
        </mesh>
        <mesh scale={[1.6, 1.6, 1.6]}>
          <octahedronGeometry args={[diamondSize, 0]} />
          <meshBasicMaterial color={ACCENT_COLOR} transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Flight Mode (mouse-driven flight over the forest) ──────

const FLY_SPEED = 60;
const MIN_ALT = 15;
const MAX_ALT = 500;
const TURN_RATE = 2.0;
const CLIMB_RATE = 50;
const MAX_BANK = 0.55;
const MAX_PITCH = 0.7;
const FLY_DEADZONE = 0.08;

function flyDeadzoneCurve(v: number): number {
  const abs = Math.abs(v);
  if (abs < FLY_DEADZONE) return 0;
  const adjusted = (abs - FLY_DEADZONE) / (1 - FLY_DEADZONE);
  return Math.sign(v) * adjusted * adjusted;
}

const _fwd = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _idealCamPos = new THREE.Vector3();
const _idealLook = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);

function FlightMode({ onExit }: { onExit: () => void }) {
  const { camera } = useThree();
  const birdRef = useRef<THREE.Group>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pos = useRef(new THREE.Vector3(0, 80, 200));
  const bank = useRef(0);
  const pitch = useRef(0);
  const camPos = useRef(new THREE.Vector3(0, 100, 250));
  const camLook = useRef(new THREE.Vector3(0, 80, 200));

  // Initialize from current camera
  useEffect(() => {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    yaw.current = Math.atan2(-camDir.x, -camDir.z);

    const startPos = camera.position.clone();
    startPos.y = Math.max(MIN_ALT, Math.min(MAX_ALT, startPos.y));
    pos.current.copy(startPos);

    const behindOffset = new THREE.Vector3(
      Math.sin(yaw.current) * 40,
      15,
      Math.cos(yaw.current) * 40
    );
    camPos.current.copy(startPos).add(behindOffset);
    camLook.current.copy(startPos);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
  }, [camera]);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Escape") onExit();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onExit]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = keys.current;

    let turnInput = flyDeadzoneCurve(mouse.current.x);
    if (k["KeyA"] || k["ArrowLeft"]) turnInput = -1;
    if (k["KeyD"] || k["ArrowRight"]) turnInput = 1;
    yaw.current -= turnInput * TURN_RATE * dt;

    let altInput = flyDeadzoneCurve(mouse.current.y);
    if (k["KeyW"] || k["ArrowUp"]) altInput = 1;
    if (k["KeyS"] || k["ArrowDown"]) altInput = -1;

    let speedMult = 1;
    if (k["ShiftLeft"] || k["ShiftRight"]) speedMult = 2;
    if (k["Space"]) speedMult = 0;

    const actualSpeed = FLY_SPEED * speedMult;
    pos.current.y += altInput * CLIMB_RATE * dt;
    pos.current.y = Math.max(MIN_ALT, Math.min(MAX_ALT, pos.current.y));

    _fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    pos.current.addScaledVector(_fwd, actualSpeed * dt);

    bank.current += (-turnInput * MAX_BANK - bank.current) * 5 * dt;
    pitch.current += (altInput * MAX_PITCH - pitch.current) * 6 * dt;

    if (birdRef.current) {
      birdRef.current.visible = true;
      birdRef.current.position.copy(pos.current);
      birdRef.current.rotation.set(pitch.current, yaw.current, bank.current, "YXZ");
    }

    const camDist = 30 + actualSpeed * 0.15;
    _camOffset.set(0, 12, camDist).applyAxisAngle(_yAxis, yaw.current);
    _idealCamPos.copy(pos.current).add(_camOffset);
    _idealLook.copy(pos.current).addScaledVector(_fwd, 5);
    _idealLook.y += 2;

    camPos.current.x += (_idealCamPos.x - camPos.current.x) * 2.0 * dt;
    camPos.current.z += (_idealCamPos.z - camPos.current.z) * 2.0 * dt;
    camPos.current.y += (_idealCamPos.y - camPos.current.y) * 1.8 * dt;
    camLook.current.lerp(_idealLook, 4.0 * dt);

    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);
  });

  return (
    <group ref={birdRef}>
      <group scale={[3, 3, 3]}>
        <AirplaneMesh />
      </group>
      <pointLight position={[0, -2, 0]} color="#f0c870" intensity={15} distance={60} />
      <pointLight position={[0, 3, -4]} color="#ffffff" intensity={5} distance={30} />
    </group>
  );
}

function AirplaneMesh() {
  const propRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (propRef.current) propRef.current.rotation.z += delta * 30;
  });

  return (
    <group>
      {/* Fuselage */}
      <mesh>
        <boxGeometry args={[1.2, 0.9, 5]} />
        <meshStandardMaterial color="#e0e0e0" emissive="#aaa" emissiveIntensity={0.4} />
      </mesh>
      {/* Nose taper */}
      <mesh position={[0, 0, -3]}>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#ccc" emissive="#999" emissiveIntensity={0.3} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, 0, -3.7]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#bbb" emissive="#888" emissiveIntensity={0.3} />
      </mesh>
      {/* Cockpit glass */}
      <mesh position={[0, 0.55, -1.2]}>
        <boxGeometry args={[0.7, 0.35, 1]} />
        <meshStandardMaterial color="#3399dd" emissive="#2277bb" emissiveIntensity={0.8} />
      </mesh>
      {/* Main wings */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[8, 0.12, 2]} />
        <meshStandardMaterial color="#d8d8d8" emissive="#999" emissiveIntensity={0.3} />
      </mesh>
      {/* Wing tips */}
      <mesh position={[-4.2, 0.15, 0.3]}>
        <boxGeometry args={[0.6, 0.5, 0.8]} />
        <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[4.2, 0.15, 0.3]}>
        <boxGeometry args={[0.6, 0.5, 0.8]} />
        <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      {/* Tail vertical stabilizer */}
      <mesh position={[0, 0.9, 2.4]}>
        <boxGeometry args={[0.12, 1.3, 1]} />
        <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      {/* Tail horizontal stabilizers */}
      <mesh position={[0, 0.35, 2.4]}>
        <boxGeometry args={[3, 0.1, 0.8]} />
        <meshStandardMaterial color="#d8d8d8" emissive="#999" emissiveIntensity={0.3} />
      </mesh>
      {/* Propeller hub */}
      <mesh position={[0, 0, -4]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#555" emissive="#333" emissiveIntensity={0.3} />
      </mesh>
      {/* Spinning propeller */}
      <group ref={propRef} position={[0, 0, -4.1]}>
        <mesh>
          <boxGeometry args={[3, 0.25, 0.06]} />
          <meshStandardMaterial color="#666" emissive="#555" emissiveIntensity={0.4} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[3, 0.25, 0.06]} />
          <meshStandardMaterial color="#666" emissive="#555" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* Engine glow */}
      <pointLight position={[0, 0, 2.8]} color="#ff8844" intensity={3} distance={10} />
    </group>
  );
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

// ─── Tree Growth Animation ───────────────────────────────────

const GROW_DURATION = 1.0;
const MAX_GROW_STAGGER = 3;

function GrowingTree({
  children,
  growOrder,
  totalTrees,
  holdGrowth,
  enabled,
}: {
  children: React.ReactNode;
  growOrder: number;
  totalTrees: number;
  holdGrowth: boolean;
  enabled: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);
  const done = useRef(!enabled);
  const delay = growOrder * Math.min(0.03, MAX_GROW_STAGGER / Math.max(1, totalTrees));

  useFrame(({ clock }) => {
    if (!groupRef.current || done.current) return;

    if (holdGrowth) {
      groupRef.current.scale.set(1, 0, 1);
      startTime.current = null;
      return;
    }

    if (startTime.current === null) {
      startTime.current = clock.elapsedTime;
    }

    const elapsed = clock.elapsedTime - startTime.current - delay;
    if (elapsed < 0) {
      groupRef.current.scale.set(1, 0, 1);
      return;
    }

    const progress = Math.min(1, elapsed / GROW_DURATION);
    const t = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    groupRef.current.scale.set(1, t, 1);

    if (progress >= 1) done.current = true;
  });

  // Don't set scale via JSX prop — R3F reconciler would reset it on re-renders,
  // overwriting the useFrame animation. Scale is managed entirely in useFrame.
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function ForestScene({ trees, onTreeClick, flyMode, onExitFly, holdGrowth = false }: ForestSceneProps) {
  const [selectedTreeSlug, setSelectedTreeSlug] = useState<string | null>(null);
  const [introMode, setIntroMode] = useState(true);

  // Track whether holdGrowth was ever true (to enable growth animation)
  const wasHeld = useRef(holdGrowth);
  if (holdGrowth) wasHeld.current = true;

  // Compute grow order: trees near center grow first, radiating outward
  const growOrder = useMemo(() => {
    const withDist = trees.map((t, i) => ({
      index: i,
      dist: Math.sqrt(t.position.x ** 2 + t.position.z ** 2),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    const order = new Array<number>(trees.length);
    withDist.forEach((item, sortPos) => {
      order[item.index] = sortPos;
    });
    return order;
  }, [trees]);

  const handleTreeClick = useCallback(
    (tree: TreeData) => {
      if (flyMode) {
        onExitFly?.();
      }
      setSelectedTreeSlug(tree.slug);
      onTreeClick?.(tree);
    },
    [onTreeClick, flyMode, onExitFly]
  );

  // Clear selected tree when entering fly mode
  useEffect(() => {
    if (flyMode) setSelectedTreeSlug(null);
  }, [flyMode]);

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

        {/* Camera mode: intro → fly → orbit (hold intro while loading) */}
        {introMode && !holdGrowth ? (
          <IntroFlyover tallestTree={tallestTree} onEnd={handleIntroEnd} />
        ) : flyMode && !introMode ? (
          <FlightMode onExit={onExitFly ?? (() => {})} />
        ) : !introMode ? (
          <OrbitScene trees={trees} focusedTreeSlug={selectedTreeSlug} />
        ) : null}

        {/* Trees */}
        {trees.map((tree, i) => {
          const isSelected = selectedTreeSlug === tree.slug;
          const tc = getTierConfig(tree.tier);
          const h = BASE_TREE_HEIGHT * tc.relativeHeight;
          return (
            <group
              key={tree.slug}
              position={[tree.position.x, tree.position.y, tree.position.z]}
            >
              <GrowingTree
                growOrder={growOrder[i]}
                totalTrees={trees.length}
                holdGrowth={holdGrowth}
                enabled={wasHeld.current}
              >
                <TreeLOD
                  data={tree}
                  onClick={() => handleTreeClick(tree)}
                  showLabel={false}
                />
              </GrowingTree>
              {!introMode && isSelected && (
                <FocusBeacon treeHeight={h} canopyRadius={tc.canopyRadius} />
              )}
            </group>
          );
        })}
      </Suspense>
    </Canvas>
  );
}

export default ForestScene;
