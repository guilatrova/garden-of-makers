"use client";

/**
 * HotAirBalloon 3D Decoration
 * A colorful floating hot air balloon with gentle bob and rotation animation.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HotAirBalloonProps {
  isPreview?: boolean;
}

export function HotAirBalloon({ isPreview = false }: HotAirBalloonProps) {
  const materialProps = isPreview
    ? { transparent: true as const, opacity: 0.5 }
    : {};

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.5;
      groupRef.current.rotation.y = t * 0.08;
    }
  });

  // Rope connection points around the balloon base
  const ropeCount = 4;
  const ropeRadius = 0.5;
  const ropes = Array.from({ length: ropeCount }, (_, i) => {
    const angle = (i / ropeCount) * Math.PI * 2;
    return {
      x: Math.cos(angle) * ropeRadius,
      z: Math.sin(angle) * ropeRadius,
      angle,
    };
  });

  return (
    <group ref={groupRef}>
      {/* Balloon envelope (main sphere) */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial
          color="#FF6347"
          flatShading
          roughness={0.6}
          {...materialProps}
        />
      </mesh>

      {/* Stripe panels (decorative thin boxes around the sphere) */}
      {[
        { color: "#FFD700", rz: 0 },
        { color: "#4169E1", rz: Math.PI / 2 },
        { color: "#32CD32", rz: Math.PI / 4 },
        { color: "#FF6347", rz: -Math.PI / 4 },
      ].map((stripe, i) => (
        <mesh
          key={i}
          position={[0, 2.5, 0]}
          rotation={[0, stripe.rz, 0]}
        >
          <boxGeometry args={[0.08, 2.4, 2.8]} />
          <meshStandardMaterial
            color={stripe.color}
            flatShading
            roughness={0.5}
            {...materialProps}
          />
        </mesh>
      ))}

      {/* Balloon bottom (neck) */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.4, 6]} />
        <meshStandardMaterial
          color="#CC4030"
          flatShading
          roughness={0.6}
          {...materialProps}
        />
      </mesh>

      {/* Ropes connecting balloon to basket */}
      {ropes.map((rope, i) => {
        const topX = rope.x;
        const topZ = rope.z;
        const bottomX = rope.x * 0.5;
        const bottomZ = rope.z * 0.5;
        const midX = (topX + bottomX) / 2;
        const midZ = (topZ + bottomZ) / 2;
        const dx = bottomX - topX;
        const dz = bottomZ - topZ;
        const ropeLength = Math.sqrt(dx * dx + 0.65 * 0.65 + dz * dz);

        return (
          <mesh
            key={i}
            position={[midX, 0.35, midZ]}
            rotation={[
              -Math.sin(rope.angle) * 0.15,
              0,
              Math.cos(rope.angle) * 0.15,
            ]}
          >
            <cylinderGeometry args={[0.015, 0.015, ropeLength, 4]} />
            <meshStandardMaterial
              color="#8B6914"
              flatShading
              roughness={0.9}
              {...materialProps}
            />
          </mesh>
        );
      })}

      {/* Basket */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Basket rim */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
        <meshStandardMaterial
          color="#A0792C"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>
    </group>
  );
}

export default HotAirBalloon;
