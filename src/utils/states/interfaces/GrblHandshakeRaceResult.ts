/**
 * Outcome of the handshake race: set when the handshake finished, unset when a disconnect request won.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblConnectionInfo } from '../../grbl/interfaces/GrblConnectionInfo';

export interface GrblHandshakeRaceResult {
  /** What the handshake found out; unset when a disconnect request ended the race first. */
  connectionInfo: GrblConnectionInfo | undefined;
}
