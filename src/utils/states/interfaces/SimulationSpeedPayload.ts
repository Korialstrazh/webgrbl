/**
 * Payload of SimulationSpeedSet: the chosen playback speed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SimulationSpeed } from '../simulation.speed.constants';

export interface SimulationSpeedPayload {
  /** Seconds of job time per real second. */
  speed: SimulationSpeed;
}
