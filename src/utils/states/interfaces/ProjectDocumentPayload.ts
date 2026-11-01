/**
 * What the action that replaces the whole project document carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from '../../project/interfaces/ProjectDocument';

export interface ProjectDocumentPayload {
  /** The document to open, with an empty history. */
  document: ProjectDocument;
}
