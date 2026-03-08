/**
 * Sky & Terrain presets for maker gardens.
 * Each preset is a complete visual theme.
 */

import type { SkyTheme } from "@/components/forest/Skybox";
import type { TerrainProps } from "@/components/forest/Terrain";

export interface GardenPreset {
  label: string;
  skyStops: [number, string][];
  skyTheme: Partial<SkyTheme>;
  terrain: TerrainProps;
}

// ─── Sky presets ──────────────────────────────────────────

export const SKY_PRESETS = {
  sunset: {
    label: "Sunset",
    stops: [
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
    ] as [number, string][],
    theme: {
      fogColor: "#80405a",
      fogNear: 400,
      fogFar: 2500,
      ambientColor: "#e0a080",
      ambientIntensity: 0.7,
      sunColor: "#f0b070",
      sunIntensity: 1.0,
      sunPos: [400, 120, -300] as [number, number, number],
      fillColor: "#6050a0",
      fillIntensity: 0.35,
      fillPos: [-200, 80, 200] as [number, number, number],
      hemiSky: "#d09080",
      hemiGround: "#4a2828",
      hemiIntensity: 0.55,
    },
  },
  daylight: {
    label: "Daylight",
    stops: [
      [0, "#1a3a6a"],
      [0.2, "#2a5a9a"],
      [0.4, "#4a8acc"],
      [0.5, "#6ab0e8"],
      [0.6, "#8ac8f0"],
      [0.7, "#b0daf5"],
      [0.85, "#d8ecfa"],
      [1, "#a0c0d8"],
    ] as [number, string][],
    theme: {
      fogColor: "#8ab8d8",
      fogNear: 400,
      fogFar: 2500,
      ambientColor: "#ffffff",
      ambientIntensity: 0.8,
      sunColor: "#fff8e0",
      sunIntensity: 1.2,
      sunPos: [300, 400, -100] as [number, number, number],
      fillColor: "#8090c0",
      fillIntensity: 0.3,
      fillPos: [-200, 80, 200] as [number, number, number],
      hemiSky: "#87ceeb",
      hemiGround: "#5a7a4a",
      hemiIntensity: 0.6,
    },
  },
  twilight: {
    label: "Twilight",
    stops: [
      [0, "#050510"],
      [0.15, "#0a0a20"],
      [0.3, "#151540"],
      [0.45, "#2a2060"],
      [0.55, "#4a3080"],
      [0.65, "#704090"],
      [0.75, "#905080"],
      [0.85, "#a06070"],
      [1, "#1a1020"],
    ] as [number, string][],
    theme: {
      fogColor: "#3a2050",
      fogNear: 400,
      fogFar: 2500,
      ambientColor: "#8060a0",
      ambientIntensity: 0.5,
      sunColor: "#c080a0",
      sunIntensity: 0.6,
      sunPos: [400, 40, -300] as [number, number, number],
      fillColor: "#4040a0",
      fillIntensity: 0.25,
      fillPos: [-200, 60, 200] as [number, number, number],
      hemiSky: "#6040a0",
      hemiGround: "#2a1828",
      hemiIntensity: 0.45,
    },
  },
  night: {
    label: "Night",
    stops: [
      [0, "#020208"],
      [0.2, "#060612"],
      [0.4, "#0a0a1a"],
      [0.55, "#101025"],
      [0.7, "#181830"],
      [0.85, "#101020"],
      [1, "#080810"],
    ] as [number, string][],
    theme: {
      fogColor: "#0a0a18",
      fogNear: 400,
      fogFar: 2500,
      ambientColor: "#4050a0",
      ambientIntensity: 0.3,
      sunColor: "#8090c0",
      sunIntensity: 0.2,
      sunPos: [-300, 200, 100] as [number, number, number],
      fillColor: "#303060",
      fillIntensity: 0.15,
      fillPos: [200, 80, -200] as [number, number, number],
      hemiSky: "#1a1a40",
      hemiGround: "#0a0a14",
      hemiIntensity: 0.3,
    },
  },
} as const;

export type SkyPresetKey = keyof typeof SKY_PRESETS;

// ─── Terrain presets ──────────────────────────────────────

export const TERRAIN_PRESETS = {
  earth: {
    label: "Earth",
    color: "#8B7355",
    emissiveIntensity: 0.15,
  },
  grass: {
    label: "Grass",
    color: "#4a6b3a",
    emissiveIntensity: 0.1,
  },
  sand: {
    label: "Sand",
    color: "#c2a878",
    emissiveIntensity: 0.12,
  },
  snow: {
    label: "Snow",
    color: "#d8dce8",
    emissiveIntensity: 0.2,
  },
  dark: {
    label: "Dark",
    color: "#2a2a30",
    emissiveIntensity: 0.05,
  },
} as const;

export type TerrainPresetKey = keyof typeof TERRAIN_PRESETS;
