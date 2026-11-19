/**
 * What the handshake needs from the controller it runs for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblRealtimeCommand } from '../grbl.constants';
import type { GrblFirmwareIdentity } from './GrblFirmwareIdentity';

export interface GrblHandshakeContext {
  /** Opens the transport. */
  openTransport(): Promise<void>;
  /** Closes the transport after a failed handshake. */
  closeTransport(): Promise<void>;
  /** Writes one realtime byte straight to the transport. */
  writeRealtimeCommand(command: GrblRealtimeCommand): void;
  /** Sets the callback told about every received banner, or removes it with undefined. */
  setBannerListener(listener: ((identity: GrblFirmwareIdentity) => void) | undefined): void;
  /** Sets the callback that cancels the running handshake with the given error, or removes it with undefined. */
  setHandshakeCanceller(canceller: ((error: Error) => void) | undefined): void;
  /** Forgets all queued and in-flight lines after the controller restarted; their waits reject. */
  dropAllLines(): void;
  /** Sends a private line through the send queue; resolves with its answer lines once it is acknowledged. */
  sendPrivateCommand(commandText: string): Promise<string[]>;
}
