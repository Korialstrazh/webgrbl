/**
 * What the machine controls need from the controller they belong to.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblCommandWriter } from '../grbl.command.writer';
import type { GrblStatusPoller } from '../grbl.status.poller';
import type { GrblStatusTracker } from '../grbl.status.tracker';
import type { GrblControllerEvent } from './GrblControllerEvent';

export interface GrblMachineControlsHost {
  /** Writes lines and realtime bytes. */
  commandWriter: GrblCommandWriter;
  /** Sends the status query at an interval. */
  statusPoller: GrblStatusPoller;
  /** Holds the latest status report. */
  statusTracker: GrblStatusTracker;
  /** True once the handshake is done and until the connection closes. */
  isConnected(): boolean;
  /** Adds a controller event listener and returns the function that removes it. */
  addEventListener(listener: (event: GrblControllerEvent) => void): () => void;
  /** Told right after a soft reset dropped all lines, before the reset byte is written. */
  handleMachineReset(): void;
  /** Told when the queue stops waiting for banners: the last expected banner arrived or the wait timed out. */
  handleBannerWaitEnded(): void;
  /** Tells the controller's listeners about an event. */
  emitEvent(event: GrblControllerEvent): void;
  /** Reports the controller as not responding, at most once per silence. */
  reportNotResponding(): void;
}
