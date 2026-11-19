/**
 * Outcome of the handshake race: set when the handshake finished, unset when a disconnect request won.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblConnectionInfo } from '../../grbl/interfaces/GrblConnectionInfo';

export interface GrblHandshakeRaceResult {
  /** What the handshake found out; unset when a disconnect request ended the race first. */
  connectionInfo: GrblConnectionInfo | undefined;
}
