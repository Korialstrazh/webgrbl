/**
 * Modal state of the simulated controller that the G-code interpreter reads and updates.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  /** Active modal motion code: 0 (G0), 1 (G1), 2 (G2) or 3 (G3); G0 at power-up. */
  motionMode: number;
  /** True while the laser is switched on by M3 or M4. */
  isLaserOn: boolean;
  /** Machine position in millimetres. */
  position: GrblAxisPosition;
  /** Work coordinate offset in millimetres: work position = machine position minus this offset. */
  workCoordinateOffset: GrblAxisPosition;
}
