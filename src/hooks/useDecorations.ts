/**
 * useDecorations hook
 * Manages placed decorations state with localStorage persistence.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { PlacedDecoration } from "@/components/garden/decorations/types";

function storageKey(xHandle: string) {
  return `garden_decorations_${xHandle}`;
}

export interface UseDecorationsReturn {
  placements: PlacedDecoration[];
  placementMode: boolean;
  selectedDecorationId: string | null;

  startPlacing: (decorationId: string) => void;
  cancelPlacing: () => void;
  confirmPlacement: (position: { x: number; z: number }, rotation: number) => void;
  removeDecoration: (instanceId: string) => void;
}

export function useDecorations(xHandle: string): UseDecorationsReturn {
  const [placements, setPlacements] = useState<PlacedDecoration[]>([]);
  const [selectedDecorationId, setSelectedDecorationId] = useState<string | null>(null);
  const loaded = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(xHandle));
      if (saved) {
        setPlacements(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    loaded.current = true;
  }, [xHandle]);

  // Auto-save on change
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storageKey(xHandle), JSON.stringify(placements));
    } catch {
      // ignore
    }
  }, [placements, xHandle]);

  const startPlacing = useCallback((decorationId: string) => {
    setSelectedDecorationId(decorationId);
  }, []);

  const cancelPlacing = useCallback(() => {
    setSelectedDecorationId(null);
  }, []);

  const confirmPlacement = useCallback(
    (position: { x: number; z: number }, rotation: number) => {
      if (!selectedDecorationId) return;
      const newPlacement: PlacedDecoration = {
        instanceId: crypto.randomUUID(),
        decorationId: selectedDecorationId,
        position,
        rotation,
      };
      setPlacements((prev) => [...prev, newPlacement]);
      setSelectedDecorationId(null);
    },
    [selectedDecorationId]
  );

  const removeDecoration = useCallback((instanceId: string) => {
    setPlacements((prev) => prev.filter((p) => p.instanceId !== instanceId));
  }, []);

  return {
    placements,
    placementMode: selectedDecorationId !== null,
    selectedDecorationId,
    startPlacing,
    cancelPlacing,
    confirmPlacement,
    removeDecoration,
  };
}
