"use client";

/**
 * FlightCamera Component
 * Free flight camera: WASD to move, mouse to look, Space/Shift for up/down
 */

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFlightControls } from "@/hooks/useFlightControls";

// Movement constants
const MIN_Y = 2; // Don't go underground
const SMOOTHING = 0.1; // Lerp factor for smooth movement
const MOUSE_SENSITIVITY = 0.002;

export function FlightCamera() {
  const { camera } = useThree();
  const { keys, speed } = useFlightControls();

  // Refs for smooth interpolation
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(0, 30, 80));
  const rotationRef = useRef({ yaw: 0, pitch: 0 });

  // Initialize camera position
  useEffect(() => {
    camera.position.copy(positionRef.current);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Handle mouse movement for looking around
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (document.pointerLockElement) {
        rotationRef.current.yaw -= event.movementX * MOUSE_SENSITIVITY;
        rotationRef.current.pitch -= event.movementY * MOUSE_SENSITIVITY;

        // Clamp pitch to prevent flipping
        rotationRef.current.pitch = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, rotationRef.current.pitch)
        );
      }
    },
    []
  );

  // Request pointer lock on canvas click
  const handleCanvasClick = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  }, []);

  // Handle escape key to exit pointer lock
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);

    // Add click listener to canvas
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleCanvasClick);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasClick);
      }
    };
  }, [handleMouseMove, handleCanvasClick, handleKeyDown]);

  // Update camera each frame
  useFrame((_, delta) => {
    // Calculate forward direction based on current rotation
    const yaw = rotationRef.current.yaw;
    const pitch = rotationRef.current.pitch;

    // Forward vector (in horizontal plane)
    const forward = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      0,
      Math.cos(yaw) * Math.cos(pitch)
    ).normalize();

    // Right vector (in horizontal plane)
    const right = new THREE.Vector3(
      Math.sin(yaw + Math.PI / 2),
      0,
      Math.cos(yaw + Math.PI / 2)
    ).normalize();

    // Up vector
    const up = new THREE.Vector3(0, 1, 0);

    // Calculate desired velocity based on key presses
    const targetVelocity = new THREE.Vector3();

    if (keys.w) targetVelocity.add(forward);
    if (keys.s) targetVelocity.sub(forward);
    if (keys.a) targetVelocity.sub(right);
    if (keys.d) targetVelocity.add(right);
    if (keys.space) targetVelocity.add(up);
    if (keys.shift) targetVelocity.sub(up);

    // Normalize and scale by speed
    if (targetVelocity.length() > 0) {
      targetVelocity.normalize().multiplyScalar(speed);
    }

    // Smoothly interpolate velocity
    velocityRef.current.lerp(targetVelocity, SMOOTHING);

    // Update position based on velocity
    positionRef.current.add(velocityRef.current.clone().multiplyScalar(delta));

    // Clamp Y to prevent going underground
    positionRef.current.y = Math.max(MIN_Y, positionRef.current.y);

    // Apply position to camera
    camera.position.copy(positionRef.current);

    // Apply rotation to camera
    const lookDirection = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    );
    camera.lookAt(camera.position.clone().add(lookDirection));
  });

  return null;
}

export default FlightCamera;
