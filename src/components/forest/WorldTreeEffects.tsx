"use client";

/**
 * WorldTreeEffects Component
 * Special VFX wrapper for ancient ($100k+) and world ($500k+) tier trees
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Mesh, Group, DoubleSide, AdditiveBlending, MeshBasicMaterial } from "three";

export interface WorldTreeEffectsProps {
  tier: "ancient" | "world";
  treeHeight: number;
  trunkRadius: number;
  children: React.ReactNode;
}

// Seeded random for deterministic results
const seededRandom = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Subtle glow sphere around canopy
 */
function CanopyGlow({
  canopyHeight,
  canopyRadius,
}: {
  canopyHeight: number;
  canopyRadius: number;
}) {
  return (
    <mesh position={[0, canopyHeight, 0]}>
      <sphereGeometry args={[canopyRadius * 1.2, 16, 16]} />
      <meshBasicMaterial
        color="#9ACD32"
        transparent
        opacity={0.1}
        side={DoubleSide}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Glowing veins on trunk (world tier only)
 */
function GlowingVeins({
  trunkHeight,
  trunkRadius,
}: {
  trunkHeight: number;
  trunkRadius: number;
}) {
  const groupRef = useRef<Group>(null);

  // Generate vein positions using seeded random
  const veins = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      height: trunkHeight * 0.3 + seededRandom(i) * trunkHeight * 0.5,
      width: trunkRadius * 0.1 + seededRandom(i + 100) * trunkRadius * 0.05,
    }));
  }, [trunkHeight, trunkRadius]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Subtle pulse animation
    const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      {veins.map((vein, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(vein.angle) * trunkRadius * 0.9,
            vein.height,
            Math.sin(vein.angle) * trunkRadius * 0.9,
          ]}
          rotation={[0, vein.angle, 0]}
        >
          <boxGeometry args={[vein.width, trunkHeight * 0.3, trunkRadius * 0.05]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.6}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Roots extending outward on the ground
 */
function TreeRoots({
  trunkRadius,
  rootLength,
}: {
  trunkRadius: number;
  rootLength: number;
}) {
  const groupRef = useRef<Group>(null);

  // Generate root positions using seeded random
  const roots = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + seededRandom(i + 200) * 0.3,
      length: rootLength * (0.7 + seededRandom(i + 300) * 0.6),
      width: trunkRadius * 0.2 * (0.8 + seededRandom(i + 400) * 0.4),
    }));
  }, [rootLength, trunkRadius]);

  return (
    <group ref={groupRef}>
      {roots.map((root, i) => {
        const midX = Math.cos(root.angle) * root.length * 0.5;
        const midZ = Math.sin(root.angle) * root.length * 0.5;

        return (
          <mesh
            key={i}
            position={[midX, 0.05, midZ]}
            rotation={[0, root.angle, 0.1]}
          >
            <cylinderGeometry
              args={[root.width * 0.3, root.width, root.length, 4]}
            />
            <meshStandardMaterial
              color="#3D2914"
              flatShading
              roughness={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Fog/mist at base of tree
 */
function BaseMist({ radius }: { radius: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    // Animate opacity
    const material = meshRef.current.material as MeshBasicMaterial;
    material.opacity = 0.15 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius * 3, 32]} />
      <meshBasicMaterial
        color="#E0E0E0"
        transparent
        opacity={0.15}
        side={DoubleSide}
      />
    </mesh>
  );
}

export function WorldTreeEffects({
  tier,
  treeHeight,
  trunkRadius,
  children,
}: WorldTreeEffectsProps) {
  const groupRef = useRef<Group>(null);
  const canopyHeight = treeHeight * 0.6;
  const canopyRadius = treeHeight * 0.4; // Approximate

  // Gentle sway animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    const swayAmount = 0.008 * (tier === "world" ? 1.5 : 1);
    groupRef.current.rotation.z = Math.sin(time * 0.4) * swayAmount;
    groupRef.current.rotation.x = Math.cos(time * 0.3) * swayAmount * 0.5;
  });

  return (
    <group ref={groupRef}>
      {/* Base effects for both ancient and world */}
      <CanopyGlow canopyHeight={canopyHeight} canopyRadius={canopyRadius} />

      {/* Effects for world tier */}
      {tier === "world" && (
        <>
          {/* Particle system - light particles falling */}
          <Sparkles
            position={[0, canopyHeight, 0]}
            count={50}
            scale={[canopyRadius * 3, treeHeight * 0.5, canopyRadius * 3]}
            size={2}
            speed={0.3}
            opacity={0.6}
            color="#FFD700"
          />

          {/* Glowing veins on trunk */}
          <GlowingVeins
            trunkHeight={treeHeight * 0.4}
            trunkRadius={trunkRadius}
          />

          {/* Fog/mist at base */}
          <BaseMist radius={trunkRadius} />

          {/* Roots extending outward */}
          <TreeRoots
            trunkRadius={trunkRadius}
            rootLength={trunkRadius * 4}
          />
        </>
      )}

      {/* The actual tree */}
      {children}
    </group>
  );
}

export default WorldTreeEffects;
