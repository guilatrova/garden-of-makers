"use client";

/**
 * Swing Decoration
 * Garden swing with an A-frame and animated seat swinging back and forth.
 */

import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";

interface SwingProps {
  isPreview?: boolean;
}

export function Swing({ isPreview = false }: SwingProps) {
  const swingGroupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (swingGroupRef.current) {
      const time = clock.getElapsedTime();
      swingGroupRef.current.rotation.z = Math.sin(time) * 0.25;
    }
  });

  const transparent = isPreview;
  const opacity = isPreview ? 0.5 : 1;

  const frameHeight = 2.8;
  const barY = frameHeight;
  const ropeLength = 1.8;

  return (
    <group>
      {/* Left pole */}
      <mesh position={[-0.6, frameHeight / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, frameHeight, 6]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Right pole */}
      <mesh position={[0.6, frameHeight / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, frameHeight, 6]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Horizontal bar */}
      <mesh position={[0, barY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 1.4, 6]} />
        <meshStandardMaterial
          color="#8B6914"
          flatShading
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Swinging group (ropes + seat), pivot at the bar */}
      <group ref={swingGroupRef} position={[0, barY, 0]}>
        {/* Left rope */}
        <mesh position={[-0.25, -ropeLength / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, ropeLength, 4]} />
          <meshStandardMaterial
            color="#8B6914"
            flatShading
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Right rope */}
        <mesh position={[0.25, -ropeLength / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, ropeLength, 4]} />
          <meshStandardMaterial
            color="#8B6914"
            flatShading
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>

        {/* Seat */}
        <mesh position={[0, -ropeLength, 0]}>
          <boxGeometry args={[0.6, 0.06, 0.3]} />
          <meshStandardMaterial
            color="#A0792C"
            flatShading
            transparent={transparent}
            opacity={opacity}
          />
        </mesh>
      </group>
    </group>
  );
}

export default Swing;
