/**
 * A checked and sanitised project file, ready to be stored as a new project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from './ProjectDocument';

export interface ImportedProjectFile {
  /** The trimmed project name from the file. */
  name: string;
  /** The objects with new ids and sanitised SVG text. */
  document: ProjectDocument;
}
