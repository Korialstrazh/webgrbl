/**
 * Payload of SimulationTimeSet: the second of the job the simulation shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SimulationTimePayload {
  /** Second of the estimated job time; a negative value is taken as 0. */
  timeS: number;
}
