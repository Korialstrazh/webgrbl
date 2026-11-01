/**
 * A project read from the database together with its full document, SVG text included.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from './ProjectDocument';
import type { StoredProject } from './StoredProject';

export interface LoadedProject {
  /** The stored project row: id, name, times and objects without SVG text. */
  project: StoredProject;
  /** The objects joined with their SVG text, ready for the editor. */
  document: ProjectDocument;
}
