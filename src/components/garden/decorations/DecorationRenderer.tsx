"use client";

/**
 * DecorationRenderer
 * Renders all placed decorations in the garden scene.
 */

import { useCallback } from "react";
import { PlacedDecoration } from "./types";
import { DecorationMesh } from "./DecorationMesh";

interface DecorationRendererProps {
  placements: PlacedDecoration[];
  onRemove?: (instanceId: string) => void;
}

export function DecorationRenderer({ placements, onRemove }: DecorationRendererProps) {
  const handleDoubleClick = useCallback(
    (instanceId: string) => {
      onRemove?.(instanceId);
    },
    [onRemove]
  );

  return (
    <>
      {placements.map((p) => (
        <group
          key={p.instanceId}
          position={[p.position.x, 0, p.position.z]}
          rotation={[0, p.rotation, 0]}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClick(p.instanceId);
          }}
        >
          <DecorationMesh decorationId={p.decorationId} />
        </group>
      ))}
    </>
  );
}
