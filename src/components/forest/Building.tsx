"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import { TreeData, TreeTier } from "@/lib/services/tree/types";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { BASE_TREE_HEIGHT } from "@/lib/constants/tiers";

// Building colors per tier (inspired by git-city's midnight theme)
const BUILDING_COLORS: Record<TreeTier, { face: string; roof: string; accent: string }> = {
  seed:    { face: "#1a1a2e", roof: "#2a2a4e", accent: "#555577" },
  sprout:  { face: "#1a2a1a", roof: "#2a4a2a", accent: "#4a8a4a" },
  shrub:   { face: "#1a2a2e", roof: "#2a4a4e", accent: "#4a8a8a" },
  young:   { face: "#1e2a3e", roof: "#2e4a5e", accent: "#5a9aca" },
  mature:  { face: "#2a1e3e", roof: "#4a2e5e", accent: "#8a5aca" },
  great:   { face: "#2e2a1e", roof: "#5e4a2e", accent: "#ca9a5a" },
  ancient: { face: "#3e1e1e", roof: "#6e2e2e", accent: "#ea6a4a" },
  world:   { face: "#3e3e1e", roof: "#7e7e2e", accent: "#eaea5a" },
};

// Building width/depth per tier
const BUILDING_SIZE: Record<TreeTier, { width: number; depth: number }> = {
  seed:    { width: 2, depth: 2 },
  sprout:  { width: 3, depth: 3 },
  shrub:   { width: 4, depth: 3 },
  young:   { width: 5, depth: 4 },
  mature:  { width: 6, depth: 5 },
  great:   { width: 8, depth: 6 },
  ancient: { width: 10, depth: 8 },
  world:   { width: 14, depth: 12 },
};

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Create a window texture for a building face
function createWindowTexture(
  rows: number,
  cols: number,
  litPct: number,
  seed: number,
  faceColor: string,
  accentColor: string,
): THREE.CanvasTexture {
  const WS = 6;
  const GAP = 2;
  const PAD = 3;

  const w = PAD * 2 + cols * WS + Math.max(0, cols - 1) * GAP;
  const h = PAD * 2 + rows * WS + Math.max(0, rows - 1) * GAP;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, w, h);

  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const litColors = [accentColor, "#e0e8ff", "#a0c0f0"];
  const offColor = "#0c0e18";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = PAD + c * (WS + GAP);
      const y = PAD + r * (WS + GAP);
      if (rand() < litPct) {
        ctx.fillStyle = litColors[Math.floor(rand() * litColors.length)];
      } else {
        ctx.fillStyle = offColor;
      }
      ctx.fillRect(x, y, WS, WS);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface BuildingProps {
  data: TreeData;
  onClick?: () => void;
  showLabel?: boolean;
}

export function Building({ data, onClick, showLabel }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  const tierConfig = getTierConfig(data.tier);
  const height = BASE_TREE_HEIGHT * tierConfig.relativeHeight;
  const { width, depth } = BUILDING_SIZE[data.tier];
  const colors = BUILDING_COLORS[data.tier];

  const seed = hashStr(data.slug);

  // Lit percentage based on MRR (more revenue = more windows lit)
  const effectiveMRR = data.mrrCents > 0 ? data.mrrCents : data.revenueLast30DaysCents;
  const litPct = Math.min(0.95, 0.1 + (effectiveMRR / 10_000_000) * 0.85);

  const floorH = 3;
  const floors = Math.max(2, Math.floor(height / floorH));
  const windowsPerFloor = Math.max(2, Math.floor(width / 2));
  const sideWindows = Math.max(2, Math.floor(depth / 2));

  // Create textures
  const textures = useMemo(() => {
    const front = createWindowTexture(floors, windowsPerFloor, litPct, seed, colors.face, colors.accent);
    const side = createWindowTexture(floors, sideWindows, litPct, seed + 7919, colors.face, colors.accent);
    return { front, side };
  }, [floors, windowsPerFloor, sideWindows, litPct, seed, colors.face, colors.accent]);

  // Materials: [+x, -x, +y, -y, +z, -z]
  const materials = useMemo(() => {
    const WHITE = new THREE.Color("#ffffff");
    const roofMat = new THREE.MeshStandardMaterial({
      color: colors.roof,
      emissive: new THREE.Color(colors.roof),
      emissiveIntensity: 0.5,
      roughness: 0.6,
    });
    const makeFaceMat = (tex: THREE.CanvasTexture) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        emissive: WHITE,
        emissiveMap: tex,
        emissiveIntensity: 1.5,
        roughness: 0.85,
      });
    const sideMat = makeFaceMat(textures.side);
    const frontMat = makeFaceMat(textures.front);
    return [sideMat, sideMat, roofMat, roofMat, frontMat, frontMat];
  }, [textures, colors.roof]);

  // Label
  const labelText = data.name || data.slug;

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Building body */}
      <mesh
        position={[0, height / 2, 0]}
        material={materials}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Accent trim at roofline */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Label */}
      {showLabel && (
        <Billboard position={[0, height + 3, 0]}>
          <Text
            fontSize={2}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            {labelText}
          </Text>
          <Text
            fontSize={1}
            color={colors.accent}
            anchorX="center"
            anchorY="top"
            position={[0, -0.5, 0]}
          >
            {data.tier.toUpperCase()}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export default Building;
