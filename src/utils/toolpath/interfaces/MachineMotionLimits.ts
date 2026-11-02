/**
 * The machine limits that shape the speed of the head: per-axis rates and accelerations and the junction deviation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
