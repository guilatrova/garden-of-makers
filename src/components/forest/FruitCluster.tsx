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
}

// Golden angle for fibonacci sphere distribution
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Get positions for watermelons (prime positions - top/front)
 */
function getWatermelonPositions(count: number, radius: number): Vector3[] {
  const positions: Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    // Watermelons get top hemisphere positions
    const t = i / Math.max(count, 1);
    const y = 0.3 + t * 0.7; // y from 0.3 to 1.0 (top hemisphere)
    const theta = i * GOLDEN_ANGLE * 2; // Spread around
    
    const radiusAtY = Math.sqrt(1 - y * y) * radius;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    positions.push(new Vector3(x, y * radius, z));
  }
  
  return positions;
}

/**
 * Get positions for oranges (mid-level)
 */
function getOrangePositions(count: number, radius: number, offset: number): Vector3[] {
  const positions: Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    // Oranges fill mid-level
    const t = (i + offset) / Math.max(count + offset, 1);
    const y = -0.2 + t * 0.6; // y from -0.2 to 0.4
    const theta = (i + offset * 2) * GOLDEN_ANGLE;
    
    const radiusAtY = Math.sqrt(1 - y * y) * radius;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    positions.push(new Vector3(x, y * radius, z));
  }
  
  return positions;
}

/**
 * Get positions for apples (scattered throughout)
 */
function getApplePositions(count: number, radius: number, offset: number): Vector3[] {
  const positions: Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    // Apples scattered
    const t = (i + offset) / Math.max(count + offset, 1);
    const y = -0.8 + t * 1.4; // Spread across more of the sphere
    const theta = (i + offset * 3) * GOLDEN_ANGLE;
    
    const radiusAtY = Math.sqrt(1 - y * y) * radius * 0.9;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    positions.push(new Vector3(x, y * radius, z));
  }
  
  return positions;
}

/**
 * Get positions for blueberries (clustered in bunches)
 */
function getBlueberryPositions(count: number, radius: number, offset: number): Vector3[] {
  const positions: Vector3[] = [];
  const bunchSize = 5; // Blueberries cluster in groups of 5
  const bunchCount = Math.ceil(count / bunchSize);
  
  // Seeded random for deterministic results
  const seededRandom = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  
  for (let bunch = 0; bunch < bunchCount; bunch++) {
    // Create a cluster center
    const bunchIndex = bunch + offset;
    const t = bunchIndex / Math.max(bunchCount + offset, 1);
    const y = -0.5 + t * 1.0;
    const theta = bunchIndex * GOLDEN_ANGLE * 1.5;
    
    const radiusAtY = Math.sqrt(1 - y * y) * radius * 0.95;
    const centerX = Math.cos(theta) * radiusAtY;
    const centerZ = Math.sin(theta) * radiusAtY;
    const centerY = y * radius;
    
    // Place blueberries around this cluster center
    const berriesInThisBunch = Math.min(bunchSize, count - bunch * bunchSize);
    for (let b = 0; b < berriesInThisBunch; b++) {
      const angle = (b / bunchSize) * Math.PI * 2;
      const dist = 0.05; // Small cluster radius
      
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

export function FruitCluster({ fruits, canopyRadius, canopyHeight }: FruitClusterProps) {
  // Calculate total fruit count
  const totalFruits = 
    fruits.watermelons + 
    fruits.oranges + 
    fruits.apples + 
    fruits.blueberries;

  // Generate positions for each fruit type - always call hooks in same order
  const watermelonPositions = useMemo(() => 
    getWatermelonPositions(fruits.watermelons, canopyRadius),
    [fruits.watermelons, canopyRadius]
  );

  const orangePositions = useMemo(() => 
    getOrangePositions(fruits.oranges, canopyRadius, fruits.watermelons),
    [fruits.oranges, canopyRadius, fruits.watermelons]
  );

  const applePositions = useMemo(() => 
    getApplePositions(
      fruits.apples, 
      canopyRadius, 
      fruits.watermelons + fruits.oranges
    ),
    [fruits.apples, canopyRadius, fruits.watermelons, fruits.oranges]
  );

  const blueberryPositions = useMemo(() => 
    getBlueberryPositions(
      fruits.blueberries,
      canopyRadius,
      fruits.watermelons + fruits.oranges + fruits.apples
    ),
    [fruits.blueberries, canopyRadius, fruits.watermelons, fruits.oranges, fruits.apples]
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
