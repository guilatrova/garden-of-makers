"use client";

/**
 * DecorationPlacementMode
 * 3D placement interaction — ghost preview follows mouse on the plot ground plane.
 * Click to place, R to rotate, Escape to cancel.
 */

import { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GardenPlot } from "@/lib/services/garden/GardenLayoutEngine";
import { PlacedDecoration } from "@/components/garden/decorations/types";
import { getDecorationById } from "@/lib/constants/decorations";
import {
  snapToGrid,
  isWithinPlot,
  hasCollision,
} from "@/lib/services/garden/DecorationPlacementEngine";
import { DecorationMesh } from "./decorations/DecorationMesh";

interface DecorationPlacementModeProps {
  decorationId: string;
  plot: GardenPlot;
  existingPlacements: PlacedDecoration[];
  onConfirm: (position: { x: number; z: number }, rotation: number) => void;
  onCancel: () => void;
}

const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.02); // plot ground y=0.02
const _intersection = new THREE.Vector3();

export function DecorationPlacementMode({
  decorationId,
  plot,
  existingPlacements,
  onConfirm,
  onCancel,
}: DecorationPlacementModeProps) {
  const { camera, gl } = useThree();
  const [ghostPos, setGhostPos] = useState<{ x: number; z: number }>({
    x: 0,
    z: 0,
  });
  const [rotation, setRotation] = useState(0);
  const [valid, setValid] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });
  const definition = getDecorationById(decorationId);

  // Track mouse position
  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    canvas.addEventListener("mousemove", onMove);
    return () => canvas.removeEventListener("mousemove", onMove);
  }, [gl]);

  // Keyboard: R to rotate, Escape to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyR") {
        setRotation((r) => (r + Math.PI / 2) % (Math.PI * 2));
      }
      if (e.code === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // Click to place
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      if (valid) {
        onConfirm(ghostPos, rotation);
      }
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [gl, valid, ghostPos, rotation, onConfirm]);

  // Raycast to ground plane each frame
  useFrame(() => {
    _mouse.set(mouseRef.current.x, mouseRef.current.y);
    _raycaster.setFromCamera(_mouse, camera);

    if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
      const snapped = snapToGrid(
        { x: _intersection.x, z: _intersection.z },
        1
      );
      setGhostPos(snapped);

      if (definition) {
        const withinBounds = isWithinPlot(
          snapped,
          definition.footprint,
          rotation,
          plot
        );
        const collides = hasCollision(
          snapped,
          definition.footprint,
          rotation,
          existingPlacements
        );
        setValid(withinBounds && !collides);
      }
    }
  });

  if (!definition) return null;

  return (
    <group
      position={[ghostPos.x, 0, ghostPos.z]}
      rotation={[0, rotation, 0]}
    >
      <DecorationMesh decorationId={decorationId} isPreview valid={valid} />
    </group>
  );
}
