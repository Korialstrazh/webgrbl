/**
 * Fixed values of the motion timeline: GRBL default limits, unit conversions and numeric tolerances.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
/** GRBL default for `$110` and `$111`, in mm per minute, used while the laser reports no valid rate. */
export const DEFAULT_MAX_RATE_MM_PER_MIN = 6000;
/** GRBL default for `$120` and `$121`, in mm per second squared. */
export const DEFAULT_ACCELERATION_MM_PER_S2 = 1000;
/** GRBL default for `$11`, in mm. */
export const DEFAULT_JUNCTION_DEVIATION_MM = 0.01;
/** Feeds are in mm per minute, speeds in mm per second. */
export const SECONDS_PER_MINUTE = 60;
/** Job times from one hour on are written with hours. */
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_HOUR: number = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
/** A direction component smaller than this is treated as zero when it limits a rate. */
export const DIRECTION_COMPONENT_EPSILON = 1e-9;
/** A turn whose half-angle sine is below this is a straight continuation. */
export const STRAIGHT_SINE_EPSILON = 1e-9;
/** A turn whose half-angle sine is above one minus this is a full reversal. */
export const REVERSAL_SINE_EPSILON = 1e-9;
/** Moves of up to this length, in mm, take no time. */
export const MOTION_LENGTH_EPSILON_MM = 1e-9;
/** Both speeds meeting at a junction start and end the job at rest. */
export const REST_SPEED_MM_PER_S = 0;
/** Half the acceleration times the squared time gives a distance. */
export const HALF = 0.5;
/** Factor of the distance to change from one speed to another: v1^2 = v0^2 + 2 * a * distance. */
export const SPEED_CHANGE_DISTANCE_FACTOR = 2;
