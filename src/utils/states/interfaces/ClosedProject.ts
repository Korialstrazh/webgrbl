/**
 * The project that was open before a switch, with the document it held when its last save finished. Its unused SVG
 * rows are deleted against this document once the next project is on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from '../../project/interfaces/ProjectDocument';

export interface ClosedProject {
  /** Id of the project that was open. */
  projectId: string;
  /** Its document as stored by the last save before the switch. */
  document: ProjectDocument;
}
