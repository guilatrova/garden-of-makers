"use client";

/**
 * Animals 3D Decoration
 * Farm animals roaming: 2 chickens and 1 dog, animated along circular paths.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimalsProps {
  isPreview?: boolean;
}

export function Animals({ isPreview = false }: AnimalsProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const chicken1Ref = useRef<THREE.Group>(null);
  const chicken2Ref = useRef<THREE.Group>(null);
  const dogRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Chicken 1 — small circle, moderate speed
    if (chicken1Ref.current) {
      const angle1 = t * 0.6;
      const r1 = 0.8;
      chicken1Ref.current.position.x = Math.cos(angle1) * r1;
      chicken1Ref.current.position.z = Math.sin(angle1) * r1;
      chicken1Ref.current.rotation.y = -angle1 + Math.PI / 2;
    }

    // Chicken 2 — different radius and speed
    if (chicken2Ref.current) {
      const angle2 = t * 0.45 + Math.PI;
      const r2 = 1.1;
      chicken2Ref.current.position.x = Math.cos(angle2) * r2;
      chicken2Ref.current.position.z = Math.sin(angle2) * r2;
      chicken2Ref.current.rotation.y = -angle2 + Math.PI / 2;
    }

    // Dog — larger circle, faster
    if (dogRef.current) {
      const angle3 = t * 0.35;
      const r3 = 1.5;
      dogRef.current.position.x = Math.cos(angle3) * r3;
      dogRef.current.position.z = Math.sin(angle3) * r3;
      dogRef.current.rotation.y = -angle3 + Math.PI / 2;
    }

    // Dog tail wag
    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(t * 8) * 0.4;
    }
  });

  return (
    <group>
      {/* ---- Chicken 1 ---- */}
      <group ref={chicken1Ref} position={[0.8, 0, 0]}>
        {/* Body */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.12, 5, 4]} />
          <meshStandardMaterial
            color="#F5F5DC"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Head */}
        <mesh position={[0.1, 0.25, 0]}>
          <sphereGeometry args={[0.06, 5, 4]} />
          <meshStandardMaterial
            color="#F5F5DC"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Beak */}
        <mesh position={[0.17, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.05, 4]} />
          <meshStandardMaterial
            color="#FF6600"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Comb */}
        <mesh position={[0.1, 0.32, 0]}>
          <coneGeometry args={[0.02, 0.04, 4]} />
          <meshStandardMaterial
            color="#CC0000"
            flatShading
            {...materialProps}
          />
        </mesh>
      </group>

      {/* ---- Chicken 2 ---- */}
      <group ref={chicken2Ref} position={[-1.1, 0, 0]}>
        {/* Body */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.12, 5, 4]} />
          <meshStandardMaterial
            color="#F5F5DC"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Head */}
        <mesh position={[0.1, 0.25, 0]}>
          <sphereGeometry args={[0.06, 5, 4]} />
          <meshStandardMaterial
            color="#F5F5DC"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Beak */}
        <mesh position={[0.17, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.05, 4]} />
          <meshStandardMaterial
            color="#FF6600"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Comb */}
        <mesh position={[0.1, 0.32, 0]}>
          <coneGeometry args={[0.02, 0.04, 4]} />
          <meshStandardMaterial
            color="#CC0000"
            flatShading
            {...materialProps}
          />
        </mesh>
      </group>

      {/* ---- Dog ---- */}
      <group ref={dogRef} position={[1.5, 0, 0]}>
        {/* Body — elongated box */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.35, 0.18, 0.16]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Head */}
        <mesh position={[0.22, 0.26, 0]}>
          <sphereGeometry args={[0.09, 5, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Snout */}
        <mesh position={[0.3, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.03, 0.06, 4]} />
          <meshStandardMaterial
            color="#A08060"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Tail */}
        <mesh
          ref={tailRef}
          position={[-0.2, 0.28, 0]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <cylinderGeometry args={[0.015, 0.01, 0.18, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Front legs */}
        <mesh position={[0.1, 0.06, 0.06]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        <mesh position={[0.1, 0.06, -0.06]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        {/* Back legs */}
        <mesh position={[-0.1, 0.06, 0.06]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
        <mesh position={[-0.1, 0.06, -0.06]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 4]} />
          <meshStandardMaterial
            color="#C4A882"
            flatShading
            {...materialProps}
          />
        </mesh>
      </group>
    </group>
  );
}

export default Animals;
