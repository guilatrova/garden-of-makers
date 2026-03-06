"use client";

/**
 * Fruit Component
 * Individual fruit mesh, instanced for performance
 */

import { useMemo } from "react";
import { SphereGeometry, MeshStandardMaterial } from "three";
import { getFruitDefinition, FRUIT_SIZE_MULTIPLIERS } from "@/lib/constants/fruits";
import { FruitType } from "@/lib/services/tree/types";

export interface FruitProps {
  type: FruitType;
  position: [number, number, number];
}

// Base size for all fruits (in world units)
const BASE_FRUIT_SIZE = 0.5;

/**
 * Get fruit geometry based on type
 */
function getFruitGeometry(type: FruitType) {
  const definition = getFruitDefinition(type);
  if (!definition) {
    return new SphereGeometry(0.05, 4, 3);
  }

  const sizeMultiplier = FRUIT_SIZE_MULTIPLIERS[definition.size];
  const size = BASE_FRUIT_SIZE * sizeMultiplier;

  switch (type) {
    case "blueberry":
      // Tiny sphere, clustered
      return new SphereGeometry(size, 4, 3);

    case "apple":
      // Small sphere
      return new SphereGeometry(size, 5, 4);

    case "orange":
      // Medium sphere
      return new SphereGeometry(size, 6, 5);

    case "watermelon":
      // Large ellipsoid (slightly squashed sphere)
      return new SphereGeometry(size, 8, 6);

    default:
      return new SphereGeometry(size, 4, 3);
  }
}

/**
 * Get fruit material based on type
 */
function getFruitMaterial(type: FruitType): MeshStandardMaterial {
  const definition = getFruitDefinition(type);
  const color = definition?.color ?? "#FF0000";

  switch (type) {
    case "blueberry":
      return new MeshStandardMaterial({
        color: "#4B0082", // Indigo
        flatShading: true,
        roughness: 0.4,
      });

    case "apple":
      return new MeshStandardMaterial({
        color: "#DC143C", // Crimson
        flatShading: true,
        roughness: 0.3,
      });

    case "orange":
      return new MeshStandardMaterial({
        color: "#FF8C00", // Dark orange
        flatShading: true,
        roughness: 0.5,
      });

    case "watermelon":
      return new MeshStandardMaterial({
        color: "#FF6B6B", // Watermelon pink
        flatShading: true,
        roughness: 0.4,
      });

    default:
      return new MeshStandardMaterial({
        color,
        flatShading: true,
      });
  }
}

/**
 * Single Fruit mesh component
 * For use with Instances or standalone
 */
export function Fruit({ type, position }: FruitProps) {
  const geometry = useMemo(() => getFruitGeometry(type), [type]);
  const material = useMemo(() => getFruitMaterial(type), [type]);

  return (
    <mesh position={position} geometry={geometry} material={material}>
      {/* Watermelon gets a green stripe */}
      {type === "watermelon" && (
        <mesh position={[0, 0, 0]} scale={[1.02, 0.3, 1.02]}>
          <sphereGeometry args={[BASE_FRUIT_SIZE * FRUIT_SIZE_MULTIPLIERS.huge, 8, 6]} />
          <meshStandardMaterial color="#228B22" flatShading />
        </mesh>
      )}
    </mesh>
  );
}

/**
 * Fruit geometry and material for instanced rendering
 * Use with drei Instances component
 */
export function useFruitGeometry(type: FruitType) {
  return useMemo(() => getFruitGeometry(type), [type]);
}

export function useFruitMaterial(type: FruitType) {
  return useMemo(() => getFruitMaterial(type), [type]);
}

export default Fruit;
