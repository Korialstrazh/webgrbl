/**
 * The machine limits that shape the speed of the head: per-axis rates and accelerations and the junction deviation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MachineMotionLimits {
  /** Maximum rate of the X axis in mm per minute (`$110`). */
  maxRateXMmPerMin: number;
  /** Maximum rate of the Y axis in mm per minute (`$111`). */
  maxRateYMmPerMin: number;
  /** Acceleration of the X axis in mm per second squared (`$120`). */
  accelXMmPerS2: number;
  /** Acceleration of the Y axis in mm per second squared (`$121`). */
  accelYMmPerS2: number;
  /** Junction deviation in mm (`$11`). */
  junctionDeviationMm: number;
}
