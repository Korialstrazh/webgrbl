/**
 * What the program streamer needs from the controller it belongs to.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblCommandWriter } from '../grbl.command.writer';
import type { GrblControllerEvent } from './GrblControllerEvent';

export interface GrblProgramStreamerHost {
  /** Queues the program lines. */
  commandWriter: GrblCommandWriter;
  /** True once the handshake is done and until the connection closes. */
  isConnected(): boolean;
  /** Runs the controller's stop sequence; resolves once the reset byte is written. */
  stopMachine(): Promise<void>;
  /** Holds the queue until the banner GRBL prints when it leaves check mode, with the banner-wait timeout. */
  holdQueueUntilCheckModeBanner(): void;
  /** Tells every controller event listener about an event. */
  emitEvent(event: GrblControllerEvent): void;
}
