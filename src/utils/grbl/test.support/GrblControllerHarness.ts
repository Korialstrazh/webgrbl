/**
 * A controller wired to the simulated laser, with every event it emitted, for engine tests.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
