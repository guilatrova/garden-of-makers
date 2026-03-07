"use client";

/**
 * Skybox Component
 * Sky and lighting setup for the forest scene
 */

import { useRef } from "react";
import { Sky, Stars } from "@react-three/drei";
import { DirectionalLight } from "three";

export interface SkyboxProps {
  /** Time of day (0-24, where 12 is noon) */
  timeOfDay?: number;
  /** Enable soft shadows */
  shadows?: boolean;
}

export function Skybox({ timeOfDay = 12, shadows = true }: SkyboxProps) {
  const sunRef = useRef<DirectionalLight>(null);

  // Calculate sun position based on time
  const sunPosition = (() => {
    const angle = ((timeOfDay - 6) / 12) * Math.PI; // 6am to 6pm arc
    const x = Math.cos(angle) * 100;
    const y = Math.sin(angle) * 100;
    return [x, y, 50] as [number, number, number];
  })();

  return (
    <>
      {/* Scene background color (light blue sky) */}
      <color attach="background" args={["#4A90D9"]} />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.49}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={0.5}
        turbidity={10}
      />

      {/* Stars (visible during evening/night) */}
      {timeOfDay < 6 || timeOfDay > 18 ? (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0.5}
          fade
          speed={1}
        />
      ) : null}

      {/* Directional light (sun) */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        intensity={1.5}
        color="#FFFACD"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-bias={-0.0001}
      />

      {/* Ambient light for fill */}
      <ambientLight intensity={0.4} color="#E8F5E9" />

      {/* Hemisphere light for natural outdoor feel */}
      <hemisphereLight
        args={["#87CEEB", "#4CAF50", 0.3]}
      />
    </>
  );
}

export default Skybox;
