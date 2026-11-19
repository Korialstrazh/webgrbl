/**
 * The controller parts a handshake context is built from.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblCommandWriter } from '../grbl.command.writer';
import type { GrblHandshakeContext } from './GrblHandshakeContext';
import type { SerialTransport } from './SerialTransport';

/** The handshake hooks the controller provides itself. */
type GrblHandshakeHooks = Pick<GrblHandshakeContext, 'setBannerListener' | 'setHandshakeCanceller'>;

export interface GrblHandshakeContextParts extends GrblHandshakeHooks {
  /** The byte pipe the handshake opens and, on failure, closes. */
  transport: SerialTransport;
  /** Writes the reset byte and the private lines. */
  commandWriter: GrblCommandWriter;
}
