"use client";

/**
 * ForSaleSign Component
 * Small "FOR SALE" sign mesh next to trees with onSale: true
 */

import { Text } from "@react-three/drei";

export interface ForSaleSignProps {
  position: [number, number, number];
}

export function ForSaleSign({ position }: ForSaleSignProps) {
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      {/* Wooden post */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
        <meshStandardMaterial color="#8B4513" flatShading roughness={0.9} />
      </mesh>

      {/* Sign board */}
      <mesh position={[0.15, 0.9, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color="#F5DEB3" flatShading />
      </mesh>

      {/* Sign text */}
      <Text
        position={[0.15, 0.9, 0.02]}
        fontSize={0.08}
        color="#8B0000"
        anchorX="center"
        anchorY="middle"
      >
        FOR SALE
      </Text>

      {/* Support stake */}
      <mesh position={[0.1, 0.3, 0.05]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
    </group>
  );
}

export default ForSaleSign;
