"use client";

/**
 * ForSaleSign Component
 * Flag on top of trees with onSale: true
 * Scales with tree height - taller trees get bigger flags
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { DealRating } from "@/lib/services/tree/TreeCalculator";
import { formatAskingPrice } from "@/lib/utils/format";

export interface ForSaleSignProps {
  treeHeight: number;
  canopyRadius: number;
  askingPrice?: number | null;
  dealRating?: DealRating | null;
}

const DEAL_FLAG_STYLES: Record<DealRating, { bg: string; emissive: string; textColor: string; priceColor: string; label: string }> = {
  great: { bg: "#FFD700", emissive: "#FFD700", textColor: "#CC0000", priceColor: "#990000", label: "GREAT DEAL" },
  good:  { bg: "#CC2222", emissive: "#CC2222", textColor: "#FFFFFF", priceColor: "#FFD0D0", label: "GOOD DEAL" },
};

const DEFAULT_FLAG_STYLE = { bg: "#888888", emissive: "#888888", textColor: "#CCCCCC", priceColor: "#AAAAAA", label: "ON SALE" };

export function ForSaleSign({ treeHeight, canopyRadius, askingPrice, dealRating }: ForSaleSignProps) {
  const flagRef = useRef<THREE.Group>(null);

  const hasPrice = askingPrice != null && askingPrice > 0;
  const style = dealRating ? DEAL_FLAG_STYLES[dealRating] : DEFAULT_FLAG_STYLE;
  const sizeScale = dealRating === "great" ? 1 : dealRating === "good" ? 0.75 : 0.5;

  // Scale flag based on tree height - very large to be visible from far
  const flagWidth = Math.max(12, treeHeight * 0.7) * sizeScale;
  const flagHeight = Math.max(6, treeHeight * 0.4) * sizeScale;
  const poleHeight = flagHeight * 2;
  const poleRadius = Math.max(0.3, treeHeight * 0.02) * sizeScale;

  // Flag sits on top of the canopy
  const baseY = treeHeight * 0.6 + canopyRadius;

  // Gentle waving animation
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  const titleSize = Math.max(1, flagHeight * 0.3);
  const priceSize = Math.max(0.8, flagHeight * 0.22);

  // Vertical offsets: if there's a price, push title up and price down
  const titleY = hasPrice ? flagHeight * 0.15 : 0;
  const priceY = -flagHeight * 0.18;

  return (
    <group position={[0, baseY, 0]}>
      {/* Pole */}
      <mesh position={[0, poleHeight / 2, 0]}>
        <cylinderGeometry args={[poleRadius, poleRadius * 1.2, poleHeight, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} flatShading />
      </mesh>

      {/* Flag group - waves */}
      <group ref={flagRef} position={[flagWidth / 2, poleHeight * 0.85, 0]}>
        {/* Flag background */}
        <mesh>
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
          position={[0, titleY, 0.02]}
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
          position={[0, titleY, -0.02]}
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
            position={[0, priceY, 0.02]}
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
            position={[0, priceY, -0.02]}
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
