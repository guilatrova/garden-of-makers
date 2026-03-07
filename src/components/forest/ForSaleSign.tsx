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

export interface ForSaleSignProps {
  treeHeight: number;
  canopyRadius: number;
  askingPriceCents?: number | null;
}

function formatAskingPrice(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}k`;
  return `$${dollars.toFixed(0)}`;
}

export function ForSaleSign({ treeHeight, canopyRadius, askingPriceCents }: ForSaleSignProps) {
  const flagRef = useRef<THREE.Group>(null);

  const hasPrice = askingPriceCents != null && askingPriceCents > 0;

  // Scale flag based on tree height - very large to be visible from far
  const flagWidth = Math.max(12, treeHeight * 0.7);
  const flagHeight = Math.max(6, treeHeight * 0.4);
  const poleHeight = flagHeight * 2;
  const poleRadius = Math.max(0.3, treeHeight * 0.02);

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
            color="#FFD700"
            side={THREE.DoubleSide}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* "ON SALE" - front */}
        <Text
          position={[0, titleY, 0.02]}
          fontSize={titleSize}
          color="#CC0000"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          ON SALE
        </Text>
        {/* "ON SALE" - back */}
        <Text
          position={[0, titleY, -0.02]}
          fontSize={titleSize}
          color="#CC0000"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
          rotation={[0, Math.PI, 0]}
        >
          ON SALE
        </Text>

        {/* Price - front */}
        {hasPrice && (
          <Text
            position={[0, priceY, 0.02]}
            fontSize={priceSize}
            color="#990000"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
          >
            {formatAskingPrice(askingPriceCents)}
          </Text>
        )}
        {/* Price - back */}
        {hasPrice && (
          <Text
            position={[0, priceY, -0.02]}
            fontSize={priceSize}
            color="#990000"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            rotation={[0, Math.PI, 0]}
          >
            {formatAskingPrice(askingPriceCents)}
          </Text>
        )}
      </group>
    </group>
  );
}

export default ForSaleSign;
