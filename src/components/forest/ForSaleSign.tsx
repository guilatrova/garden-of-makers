"use client";

/**
 * ForSaleSign Component
 * Flag on top of trees with onSale: true
 * Scales with tree height - taller trees get bigger flags
 */

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { DealRating } from "@/lib/services/tree/TreeCalculator";
import { formatAskingPrice } from "@/lib/utils/format";

const GROW_DURATION = 0.6;
const SHRINK_DURATION = 0.4;

export interface ForSaleSignProps {
  treeHeight: number;
  canopyRadius: number;
  askingPrice?: number | null;
  dealRating?: DealRating | null;
  visible?: boolean;
  onClick?: () => void;
}

const DEAL_FLAG_STYLES: Record<DealRating, { bg: string; emissive: string; textColor: string; priceColor: string; label: string }> = {
  great: { bg: "#FFD700", emissive: "#FFD700", textColor: "#CC0000", priceColor: "#990000", label: "GREAT DEAL" },
  good:  { bg: "#CC2222", emissive: "#CC2222", textColor: "#FFFFFF", priceColor: "#FFD0D0", label: "GOOD DEAL" },
};

const DEFAULT_FLAG_STYLE = { bg: "#888888", emissive: "#888888", textColor: "#CCCCCC", priceColor: "#AAAAAA", label: "ON SALE" };

export function ForSaleSign({ treeHeight, canopyRadius, askingPrice, dealRating, visible = true, onClick }: ForSaleSignProps) {
  const flagRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);
  const transitionStart = useRef<number | null>(null);
  // "growing" | "visible" | "shrinking" | "hidden"
  const animState = useRef<"growing" | "visible" | "shrinking" | "hidden">("growing");

  // React to visible prop changes
  useEffect(() => {
    if (visible && (animState.current === "hidden" || animState.current === "shrinking")) {
      animState.current = "growing";
      transitionStart.current = null; // reset to pick up clock on next frame
    } else if (!visible && (animState.current === "visible" || animState.current === "growing")) {
      animState.current = "shrinking";
      transitionStart.current = null;
    }
  }, [visible]);

  const hasPrice = askingPrice != null && askingPrice > 0;
  const style = dealRating ? DEAL_FLAG_STYLES[dealRating] : DEFAULT_FLAG_STYLE;
  const sizeScale = dealRating === "great" ? 1 : dealRating === "good" ? 0.75 : 0.5;

  // Scale flag based on tree height - very large to be visible from far
  const flagWidth = Math.max(15, treeHeight * 0.85) * sizeScale;
  const flagHeight = Math.max(6, treeHeight * 0.4) * sizeScale;
  const poleHeight = flagHeight * 2;
  const poleRadius = Math.max(0.3, treeHeight * 0.02) * sizeScale;

  // Flag sits on top of the canopy
  const baseY = treeHeight * 0.6 + canopyRadius;

  // Grow / shrink animation + gentle waving
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }

    if (!rootRef.current || animState.current === "visible" || animState.current === "hidden") return;

    if (transitionStart.current === null) {
      transitionStart.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - transitionStart.current;

    if (animState.current === "growing") {
      const progress = Math.min(1, elapsed / GROW_DURATION);
      const t = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      rootRef.current.scale.set(t, t, t);
      if (progress >= 1) animState.current = "visible";
    } else if (animState.current === "shrinking") {
      const progress = Math.min(1, elapsed / SHRINK_DURATION);
      const t = 1 - progress * progress; // ease-in quad (1 → 0)
      rootRef.current.scale.set(t, t, t);
      if (progress >= 1) animState.current = "hidden";
    }
  });

  const titleSize = Math.max(1, flagHeight * 0.3);
  const priceSize = Math.max(0.8, flagHeight * 0.22);
  const textZOffset = Math.max(0.5, flagHeight * 0.15);

  // Vertical offsets: if there's a price, push title up and price down
  const titleY = hasPrice ? flagHeight * 0.15 : 0;
  const priceY = -flagHeight * 0.18;

  return (
    <group ref={rootRef} position={[0, baseY, 0]} scale={[0, 0, 0]}>
      {/* Pole */}
      <mesh
        position={[0, poleHeight / 2, 0]}
        onClick={(e) => { if (e.delta <= 5) { e.stopPropagation(); onClick?.(); } }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <cylinderGeometry args={[poleRadius, poleRadius * 1.2, poleHeight, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} flatShading />
      </mesh>

      {/* Flag group - waves */}
      <group ref={flagRef} position={[flagWidth / 2, poleHeight * 0.85, 0]}>
        {/* Flag background */}
        <mesh
          onClick={(e) => { if (e.delta <= 5) { e.stopPropagation(); onClick?.(); } }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <planeGeometry args={[flagWidth, flagHeight]} />
          <meshStandardMaterial
            color={style.bg}
            side={THREE.DoubleSide}
            emissive={style.emissive}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Label - front */}
        <Text
          position={[0, titleY, textZOffset]}
          fontSize={titleSize}
          color={style.textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          {style.label}
        </Text>
        {/* Label - back */}
        <Text
          position={[0, titleY, -textZOffset]}
          fontSize={titleSize}
          color={style.textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
          rotation={[0, Math.PI, 0]}
        >
          {style.label}
        </Text>

        {/* Price - front */}
        {hasPrice && (
          <Text
            position={[0, priceY, textZOffset]}
            fontSize={priceSize}
            color={style.priceColor}
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            {formatAskingPrice(askingPrice)}
          </Text>
        )}
        {/* Price - back */}
        {hasPrice && (
          <Text
            position={[0, priceY, -textZOffset]}
            fontSize={priceSize}
            color={style.priceColor}
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            rotation={[0, Math.PI, 0]}
          >
            {formatAskingPrice(askingPrice)}
          </Text>
        )}
      </group>
    </group>
  );
}

export default ForSaleSign;
