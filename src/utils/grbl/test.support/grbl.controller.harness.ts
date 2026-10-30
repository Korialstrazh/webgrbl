import { GrblController } from '../grbl.controller';
import { SimulatedLaserTransport } from '../simulated.laser.transport';
import type { GrblControllerEvent } from '../interfaces/GrblControllerEvent';
import type { GrblControllerHarness } from './GrblControllerHarness';

/**
 * Creates a disconnected controller on a fresh simulated laser that records every event it emits.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const newGrblControllerHarness = (): GrblControllerHarness => {
  const transport: SimulatedLaserTransport = new SimulatedLaserTransport();
  const controller: GrblController = new GrblController(transport);
  const events: GrblControllerEvent[] = [];

  controller.addEventListener((event: GrblControllerEvent): void => {
    events.push(event);
  });

  return { transport, controller, events };
};
