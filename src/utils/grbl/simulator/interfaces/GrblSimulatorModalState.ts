/**
 * Modal state of the simulated controller that the G-code interpreter reads and updates.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../../interfaces/GrblAxisPosition';

export interface GrblSimulatorModalState {
  /** True while G90 (absolute coordinates) is active, false under G91. */
  isAbsolute: boolean;
  /** True while G21 (millimetres) is active, false under G20 (inches). */
  isMetric: boolean;
  /** Current feed rate in mm/min; 0 until a feed rate has been set. */
  feedRate: number;
  /** Current spindle (laser power) value set by S. */
  spindleSpeed: number;
  /** True while the laser is switched on by M3 or M4. */
  isLaserOn: boolean;
  /** Machine position in millimetres. */
  position: GrblAxisPosition;
  /** Work coordinate offset in millimetres: work position = machine position minus this offset. */
  workCoordinateOffset: GrblAxisPosition;
}
