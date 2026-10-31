/**
 * What the actions that replace the whole machine profiles document carry (loaded from storage, imported).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfilesDocument } from '../../profiles/interfaces/MachineProfilesDocument';

export interface MachineProfilesDocumentPayload {
  /** The document that becomes the current one. */
  document: MachineProfilesDocument;
}
