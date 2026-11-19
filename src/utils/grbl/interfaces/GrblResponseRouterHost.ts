/**
 * What the response router needs from the controller it routes for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblCommandWriter } from '../grbl.command.writer';
import type { GrblMachineControls } from '../grbl.machine.controls';
import type { GrblNotRespondingWatchdog } from '../grbl.not.responding.watchdog';
import type { GrblProgramStreamer } from '../grbl.program.streamer';
import type { GrblStatusTracker } from '../grbl.status.tracker';
import type { GrblControllerEvent } from './GrblControllerEvent';
import type { GrblFirmwareIdentity } from './GrblFirmwareIdentity';

export interface GrblResponseRouterHost {
  /** Frees answered lines and sends what then fits. */
  commandWriter: GrblCommandWriter;
  /** Resolves the positions of status reports. */
  statusTracker: GrblStatusTracker;
  /** Counts banners after a reset. */
  machineControls: GrblMachineControls;
  /** Tracks the answers to program lines. */
  programStreamer: GrblProgramStreamer;
  /** Restarts the silence clock on every received line. */
  notRespondingWatchdog: GrblNotRespondingWatchdog;
  /** Tells every controller event listener about an event. */
  emitEvent(event: GrblControllerEvent): void;
  /** Hands a banner to the running handshake, if any. */
  handleHandshakeBanner(identity: GrblFirmwareIdentity): void;
}
