"use client";

/**
 * DecorationMesh
 * Dispatcher that renders the correct decoration mesh by ID.
 */

import { FlowerBed } from "./FlowerBed";
import { Rock } from "./Rock";
import { Signpost } from "./Signpost";
import { Bench } from "./Bench";
import { MushroomCluster } from "./MushroomCluster";
import { Lantern } from "./Lantern";
import { Scarecrow } from "./Scarecrow";
import { Hedge } from "./Hedge";
import { Pond } from "./Pond";
import { Swing } from "./Swing";
import { Fountain } from "./Fountain";
import { Windmill } from "./Windmill";
import { Bridge } from "./Bridge";
import { Campfire } from "./Campfire";
import { Animals } from "./Animals";
import { Gazebo } from "./Gazebo";
import { Statue } from "./Statue";
import { HotAirBalloon } from "./HotAirBalloon";
import { Rocket } from "./Rocket";
import { CastleTower } from "./CastleTower";
import { Rainbow } from "./Rainbow";
import { AmbientParticles } from "./AmbientParticles";
import { Telescope } from "./Telescope";

interface DecorationMeshProps {
  decorationId: string;
  isPreview?: boolean;
  valid?: boolean;
}

const COMPONENTS: Record<string, React.ComponentType<{ isPreview?: boolean }>> = {
  flower_bed: FlowerBed,
  rock: Rock,
  signpost: Signpost,
  bench: Bench,
  mushroom_cluster: MushroomCluster,
  lantern: Lantern,
  scarecrow: Scarecrow,
  hedge: Hedge,
  pond: Pond,
  swing: Swing,
  fountain: Fountain,
  windmill: Windmill,
  bridge: Bridge,
  campfire: Campfire,
  animals: Animals,
  gazebo: Gazebo,
  statue: Statue,
  hot_air_balloon: HotAirBalloon,
  rocket: Rocket,
  castle_tower: CastleTower,
  rainbow: Rainbow,
  ambient_particles: AmbientParticles,
  telescope: Telescope,
};

export function DecorationMesh({ decorationId, isPreview, valid }: DecorationMeshProps) {
  const Component = COMPONENTS[decorationId];
  if (!Component) return null;

  // In preview mode with invalid placement, tint red via a wrapper
  if (isPreview && valid === false) {
    return (
      <group>
        <Component isPreview />
        {/* Red overlay sphere to indicate invalid placement */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.5, 8, 6]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  return <Component isPreview={isPreview} />;
}
