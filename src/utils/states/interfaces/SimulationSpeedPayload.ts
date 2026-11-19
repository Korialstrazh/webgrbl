/**
 * Payload of SimulationSpeedSet: the chosen playback speed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SimulationSpeed } from '../simulation.speed.constants';

export interface SimulationSpeedPayload {
  /** Seconds of job time per real second. */
  speed: SimulationSpeed;
}
