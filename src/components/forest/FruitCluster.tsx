"use client";

/**
 * FruitCluster Component
 * Distributes fruits on the tree canopy based on FruitBreakdown
 */

import { useMemo, useRef, useLayoutEffect } from "react";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { FruitBreakdown, FruitType } from "@/lib/services/tree/types";
import { useFruitGeometry, useFruitMaterial } from "./Fruit";

export interface FruitClusterProps {
  fruits: FruitBreakdown;
  canopyRadius: number;
  canopyHeight: number; // y position of canopy center
  coneHeight?: number; // if provided, distribute fruits on cone surface instead of sphere
}

// Golden angle for fibonacci sphere distribution
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Get positions for watermelons (prime positions - top/front)
 */
function getWatermelonPositions(count: number, radius: number, coneHeight?: number): Vector3[] {
  const positions: Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count, 1);
    const theta = i * GOLDEN_ANGLE * 2;

    if (coneHeight) {
      // Cone: watermelons near top (t: 0.5 to 0.9)
      const ct = 0.5 + t * 0.4;
      const r = (1 - ct) * radius * 0.9;
      positions.push(new Vector3(Math.cos(theta) * r, (ct - 0.5) * coneHeight, Math.sin(theta) * r));
    } else {
      const y = 0.3 + t * 0.7;
      const radiusAtY = Math.sqrt(1 - y * y) * radius;
      positions.push(new Vector3(Math.cos(theta) * radiusAtY, y * radius, Math.sin(theta) * radiusAtY));
    }
  }

  return positions;
}

/**
 * Get positions for oranges (mid-level)
 */
function getOrangePositions(count: number, radius: number, offset: number, coneHeight?: number): Vector3[] {
  const positions: Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = (i + offset) / Math.max(count + offset, 1);
    const theta = (i + offset * 2) * GOLDEN_ANGLE;

    if (coneHeight) {
      // Cone: oranges in mid section (t: 0.3 to 0.65)
      const ct = 0.3 + t * 0.35;
      const r = (1 - ct) * radius * 0.9;
      positions.push(new Vector3(Math.cos(theta) * r, (ct - 0.5) * coneHeight, Math.sin(theta) * r));
    } else {
      const y = -0.2 + t * 0.6;
      const radiusAtY = Math.sqrt(1 - y * y) * radius;
      positions.push(new Vector3(Math.cos(theta) * radiusAtY, y * radius, Math.sin(theta) * radiusAtY));
    }
  }

  return positions;
}

/**
 * Get positions for apples (scattered throughout)
 */
function getApplePositions(count: number, radius: number, offset: number, coneHeight?: number): Vector3[] {
  const positions: Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = (i + offset) / Math.max(count + offset, 1);
    const theta = (i + offset * 3) * GOLDEN_ANGLE;

    if (coneHeight) {
      // Cone: apples spread throughout (t: 0.1 to 0.85)
      const ct = 0.1 + t * 0.75;
      const r = (1 - ct) * radius * 0.9;
      positions.push(new Vector3(Math.cos(theta) * r, (ct - 0.5) * coneHeight, Math.sin(theta) * r));
    } else {
      const y = -0.8 + t * 1.4;
      const radiusAtY = Math.sqrt(1 - y * y) * radius * 0.9;
      positions.push(new Vector3(Math.cos(theta) * radiusAtY, y * radius, Math.sin(theta) * radiusAtY));
    }
  }

  return positions;
}

/**
 * Get positions for blueberries (clustered in bunches)
 */
function getBlueberryPositions(count: number, radius: number, offset: number, coneHeight?: number): Vector3[] {
  const positions: Vector3[] = [];
  const bunchSize = 5;
  const bunchCount = Math.ceil(count / bunchSize);

  const seededRandom = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let bunch = 0; bunch < bunchCount; bunch++) {
    const bunchIndex = bunch + offset;
    const t = bunchIndex / Math.max(bunchCount + offset, 1);
    const theta = bunchIndex * GOLDEN_ANGLE * 1.5;

    let centerX: number, centerY: number, centerZ: number;

    if (coneHeight) {
      // Cone: blueberries in lower-mid (t: 0.15 to 0.7)
      const ct = 0.15 + t * 0.55;
      const r = (1 - ct) * radius * 0.95;
      centerX = Math.cos(theta) * r;
      centerY = (ct - 0.5) * coneHeight;
      centerZ = Math.sin(theta) * r;
    } else {
      const y = -0.5 + t * 1.0;
      const radiusAtY = Math.sqrt(1 - y * y) * radius * 0.95;
      centerX = Math.cos(theta) * radiusAtY;
      centerY = y * radius;
      centerZ = Math.sin(theta) * radiusAtY;
    }

    const berriesInThisBunch = Math.min(bunchSize, count - bunch * bunchSize);
    for (let b = 0; b < berriesInThisBunch; b++) {
      const angle = (b / bunchSize) * Math.PI * 2;
      const dist = 0.05;

      positions.push(new Vector3(
        centerX + Math.cos(angle) * dist,
        centerY + (seededRandom(bunch * 10 + b) - 0.5) * dist,
        centerZ + Math.sin(angle) * dist
      ));
    }
  }

  return positions;
}

/**
 * FruitInstances component for instanced rendering
 */
function FruitInstances({
  count,
  positions,
  canopyHeight,
  fruitType,
}: {
  count: number;
  positions: Vector3[];
  canopyHeight: number;
  fruitType: FruitType;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useFruitGeometry(fruitType);
  const material = useFruitMaterial(fruitType);

  // Update instance matrices using useLayoutEffect
  useLayoutEffect(() => {
    if (!meshRef.current || count === 0) return;
    
    positions.forEach((pos, i) => {
      dummy.position.set(pos.x, pos.y + canopyHeight, pos.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, canopyHeight, dummy, count]);

  if (count === 0) return null;

  // For small counts, render individual meshes instead of instanced
  if (count <= 20) {
    return (
      <group>
        {positions.map((pos, i) => (
          <mesh
            key={`${fruitType}-${i}`}
            position={[pos.x, pos.y + canopyHeight, pos.z]}
            geometry={geometry}
            material={material}
          />
        ))}
      </group>
    );
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
    />
  );
}

export function FruitCluster({ fruits, canopyRadius, canopyHeight, coneHeight }: FruitClusterProps) {
  // Calculate total fruit count
  const totalFruits =
    fruits.watermelons +
    fruits.oranges +
    fruits.apples +
    fruits.blueberries;

  // Generate positions for each fruit type - always call hooks in same order
  const watermelonPositions = useMemo(() =>
    getWatermelonPositions(fruits.watermelons, canopyRadius, coneHeight),
    [fruits.watermelons, canopyRadius, coneHeight]
  );

  const orangePositions = useMemo(() =>
    getOrangePositions(fruits.oranges, canopyRadius, fruits.watermelons, coneHeight),
    [fruits.oranges, canopyRadius, fruits.watermelons, coneHeight]
  );

  const applePositions = useMemo(() =>
    getApplePositions(
      fruits.apples,
      canopyRadius,
      fruits.watermelons + fruits.oranges,
      coneHeight
    ),
    [fruits.apples, canopyRadius, fruits.watermelons, fruits.oranges, coneHeight]
  );

  const blueberryPositions = useMemo(() =>
    getBlueberryPositions(
      fruits.blueberries,
      canopyRadius,
      fruits.watermelons + fruits.oranges + fruits.apples,
      coneHeight
    ),
    [fruits.blueberries, canopyRadius, fruits.watermelons, fruits.oranges, fruits.apples, coneHeight]
  );

  if (totalFruits === 0) return null;

  return (
    <group>
      {/* Watermelons - prime positions, top of canopy */}
      <FruitInstances
        count={fruits.watermelons}
        positions={watermelonPositions}
        canopyHeight={canopyHeight}
        fruitType="watermelon"
      />

      {/* Oranges - mid-level */}
      <FruitInstances
        count={fruits.oranges}
        positions={orangePositions}
        canopyHeight={canopyHeight}
        fruitType="orange"
      />

      {/* Apples - scattered */}
      <FruitInstances
        count={fruits.apples}
        positions={applePositions}
        canopyHeight={canopyHeight}
        fruitType="apple"
      />

      {/* Blueberries - clustered */}
      <FruitInstances
        count={fruits.blueberries}
        positions={blueberryPositions}
        canopyHeight={canopyHeight}
        fruitType="blueberry"
      />
    </group>
  );
}

export default FruitCluster;
