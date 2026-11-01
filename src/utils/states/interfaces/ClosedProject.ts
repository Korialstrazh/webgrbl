/**
 * The project that was open before a switch, with the document it held when its last save finished. Its unused SVG
 * rows are deleted against this document once the next project is on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from '../../project/interfaces/ProjectDocument';

export interface ClosedProject {
  /** Id of the project that was open. */
  projectId: string;
  /** Its document as stored by the last save before the switch. */
  document: ProjectDocument;
}
