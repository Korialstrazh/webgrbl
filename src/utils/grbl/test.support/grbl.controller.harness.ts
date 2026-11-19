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
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
