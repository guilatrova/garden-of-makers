/**
 * Decoration placement types for the garden scene.
 */

export interface PlacedDecoration {
  instanceId: string;
  decorationId: string;
  position: { x: number; z: number };
  rotation: number; // Y-axis radians (0, PI/2, PI, 3PI/2)
}
