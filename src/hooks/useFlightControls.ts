"use client";

/**
 * useFlightControls Hook
 * Tracks WASD + Space + Shift key state for flight camera
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface KeysState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  space: boolean;
  shift: boolean;
  e: boolean;
}

interface UseFlightControlsReturn {
  keys: KeysState;
  speed: number;
  isPointerLocked: boolean;
}

const BASE_SPEED = 30; // units per second
const BOOST_SPEED = 90; // units per second when holding E

export function useFlightControls(): UseFlightControlsReturn {
  const [keys, setKeys] = useState<KeysState>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
    e: false,
  });

  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const pointerLockRef = useRef(false);

  // Calculate current speed based on boost key
  const speed = keys.e ? BOOST_SPEED : BASE_SPEED;

  // Handle keydown
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    setKeys((prev) => {
      switch (key) {
        case "w":
          return { ...prev, w: true };
        case "a":
          return { ...prev, a: true };
        case "s":
          return { ...prev, s: true };
        case "d":
          return { ...prev, d: true };
        case " ":
          return { ...prev, space: true };
        case "shift":
          return { ...prev, shift: true };
        case "e":
          return { ...prev, e: true };
        default:
          return prev;
      }
    });
  }, []);

  // Handle keyup
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    setKeys((prev) => {
      switch (key) {
        case "w":
          return { ...prev, w: false };
        case "a":
          return { ...prev, a: false };
        case "s":
          return { ...prev, s: false };
        case "d":
          return { ...prev, d: false };
        case " ":
          return { ...prev, space: false };
        case "shift":
          return { ...prev, shift: false };
        case "e":
          return { ...prev, e: false };
        default:
          return prev;
      }
    });
  }, []);

  // Handle pointer lock changes
  const handlePointerLockChange = useCallback(() => {
    const locked = document.pointerLockElement !== null;
    pointerLockRef.current = locked;
    setIsPointerLocked(locked);
  }, []);

  useEffect(() => {
    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, [handleKeyDown, handleKeyUp, handlePointerLockChange]);

  return {
    keys,
    speed,
    isPointerLocked,
  };
}
