/**
 * A controller wired to the simulated laser, with every event it emitted, for engine tests.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblController } from '../grbl.controller';
import type { GrblControllerEvent } from '../interfaces/GrblControllerEvent';
import type { SimulatedLaserTransport } from '../simulated.laser.transport';

export interface GrblControllerHarness {
  /** The simulated laser behind the controller. */
  transport: SimulatedLaserTransport;
  /** The controller under test. */
  controller: GrblController;
  /** Every event the controller emitted, oldest first. */
  events: GrblControllerEvent[];
}
