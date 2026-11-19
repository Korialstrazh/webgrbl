/**
 * What the action that replaces the whole project document carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from '../../project/interfaces/ProjectDocument';

export interface ProjectDocumentPayload {
  /** The document to open, with an empty history. */
  document: ProjectDocument;
}
