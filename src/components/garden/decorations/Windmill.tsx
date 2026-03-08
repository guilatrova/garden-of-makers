"use client";

/**
 * Windmill 3D Decoration
 * A spinning low-poly windmill with rotating blades.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WindmillProps {
  isPreview?: boolean;
}

export function Windmill({ isPreview = false }: WindmillProps) {
  const materialProps = useMemo(
    () => (isPreview ? { transparent: true, opacity: 0.5 } : {}),
    [isPreview]
  );

  const bladesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group>
      {/* Stone base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
        <meshStandardMaterial
          color="#9a9a8a"
          flatShading
          roughness={0.9}
          {...materialProps}
        />
      </mesh>

      {/* Body — tapered cylinder */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 1.4, 6]} />
        <meshStandardMaterial
          color="#e8e0d0"
          flatShading
          roughness={0.7}
          {...materialProps}
        />
      </mesh>

      {/* Roof cone */}
      <mesh position={[0, 2.0, 0]}>
        <coneGeometry args={[0.3, 0.35, 6]} />
        <meshStandardMaterial
          color="#8B4513"
          flatShading
          roughness={0.8}
          {...materialProps}
        />
      </mesh>

      {/* Blade hub + blades group */}
      <group position={[0, 1.75, 0.28]}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 6]} />
          <meshStandardMaterial
            color="#555555"
            flatShading
            roughness={0.8}
            {...materialProps}
          />
        </mesh>

        {/* Rotating blades */}
        <group ref={bladesRef}>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.12, 0.8, 0.03]} />
                <meshStandardMaterial
                  color="#8B6914"
                  flatShading
                  roughness={0.8}
                  {...materialProps}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

export default Windmill;
