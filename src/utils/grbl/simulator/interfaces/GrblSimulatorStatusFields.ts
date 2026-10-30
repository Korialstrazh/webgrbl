/**
 * Values the simulated controller prints in one status report.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../../interfaces/GrblAxisPosition';

export interface GrblSimulatorStatusFields {
  /** State as GRBL prints it, including a substate such as Hold:0. */
  stateText: string;
  /** Machine position in millimetres. */
  machinePosition: GrblAxisPosition;
  /** Current feed rate in mm/min. */
  feedRate: number;
  /** Current effective laser power. */
  laserPower: number;
  /** Work coordinate offset, or undefined when this report leaves it out. */
  workCoordinateOffset: GrblAxisPosition | undefined;
}
