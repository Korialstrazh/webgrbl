/**
 * What the actions that replace the whole machine profiles document carry (loaded from storage, imported).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfilesDocument } from '../../profiles/interfaces/MachineProfilesDocument';

export interface MachineProfilesDocumentPayload {
  /** The document that becomes the current one. */
  document: MachineProfilesDocument;
}
