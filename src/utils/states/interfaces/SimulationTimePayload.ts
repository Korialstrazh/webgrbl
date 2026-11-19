/**
 * Payload of SimulationTimeSet: the second of the job the simulation shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SimulationTimePayload {
  /** Second of the estimated job time; a negative value is taken as 0. */
  timeS: number;
}
