/**
 * What the handshake learned about the connected controller.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblFirmwareIdentity } from './GrblFirmwareIdentity';

export interface GrblConnectionInfo {
  /** Firmware name and version from the welcome banner. */
  identity: GrblFirmwareIdentity;
  /** Usable receive buffer size in bytes, from the $I build options or the default. */
  rxBufferSize: number;
  /** Setting values from $$, keyed by setting number. */
  settings: Record<number, string>;
  /** The $I answer lines, without the final ok. */
  buildInfoLines: string[];
}
