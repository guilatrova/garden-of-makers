"use client";

/**
 * Skybox Component
 * Sunset sky and lighting setup for the forest scene
 * Inspired by git-city's SkyDome implementation
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface SkyTheme {
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  fillColor: string;
  fillIntensity: number;
  fillPos: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
}

export interface SkyboxProps {
  /** Enable soft shadows */
  shadows?: boolean;
  /** Gradient stops for the sky dome */
  skyStops?: [number, string][];
  /** Theme overrides */
  theme?: Partial<SkyTheme>;
}

// Sunset gradient stops (from git-city's Sunset theme)
export const SUNSET_SKY_STOPS: [number, string][] = [
  [0, "#0c0614"],
  [0.15, "#1c0e30"],
  [0.28, "#3a1850"],
  [0.38, "#6a3060"],
  [0.46, "#a05068"],
  [0.52, "#d07060"],
  [0.57, "#e89060"],
  [0.62, "#f0b070"],
  [0.68, "#f0c888"],
  [0.75, "#c08060"],
  [0.85, "#603030"],
  [1, "#180c10"],
];

// Sunset theme colors
export const SUNSET_THEME: SkyTheme = {
  fogColor: "#80405a",
  fogNear: 400,
  fogFar: 2500,
  ambientColor: "#e0a080",
  ambientIntensity: 0.7,
  sunColor: "#f0b070",
  sunIntensity: 1.0,
  sunPos: [400, 120, -300],
  fillColor: "#6050a0",
  fillIntensity: 0.35,
  fillPos: [-200, 80, 200],
  hemiSky: "#d09080",
  hemiGround: "#4a2828",
  hemiIntensity: 0.55,
};

/**
 * SkyDome - Creates a gradient sky sphere
 */
function SkyDome({ stops }: { stops: [number, string][] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const mat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    for (const [stop, color] of stops) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });
  }, [stops]);

  // Keep sky dome centered on camera so it always surrounds the viewer
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
    }
  });

  useEffect(() => {
    return () => {
      mat.map?.dispose();
      mat.dispose();
    };
  }, [mat]);

  return (
    <mesh ref={meshRef} material={mat} renderOrder={-1}>
      <sphereGeometry args={[3500, 32, 48]} />
    </mesh>
  );
}

export function Skybox({ shadows = true, skyStops, theme }: SkyboxProps) {
  const t = theme ? { ...SUNSET_THEME, ...theme } : SUNSET_THEME;
  const stops = skyStops ?? SUNSET_SKY_STOPS;

  return (
    <>
      {/* Fog for depth and atmosphere */}
      <fog attach="fog" args={[t.fogColor, t.fogNear, t.fogFar]} />

      {/* Gradient sky dome */}
      <SkyDome stops={stops} />

      {/* Ambient light */}
      <ambientLight intensity={t.ambientIntensity * 3} color={t.ambientColor} />

      {/* Sun (directional light) */}
      <directionalLight
        position={t.sunPos}
        intensity={t.sunIntensity * 3.5}
        color={t.sunColor}
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

      {/* Fill light (opposite side for softer shadows) */}
      <directionalLight
        position={t.fillPos}
        intensity={t.fillIntensity * 3}
        color={t.fillColor}
      />

      {/* Hemisphere light for natural outdoor feel */}
      <hemisphereLight
        args={[t.hemiSky, t.hemiGround, t.hemiIntensity * 3.5]}
      />
    </>
  );
}

export default Skybox;
