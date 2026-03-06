/**
 * Garden Service Module
 * Exports for maker garden functionality
 */

export { MakerGardenService } from "./MakerGardenService";
export type {
  MakerGarden,
  GardenSize,
  MakerGardenServiceConfig,
} from "./types";
export {
  calculateGardenSize,
  calculateTotalMRR,
  calculateTotalCustomers,
  extractMakerInfo,
} from "./types";
