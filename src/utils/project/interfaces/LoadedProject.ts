/**
 * A project read from the database together with its full document, SVG text included.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from './ProjectDocument';
import type { StoredProject } from './StoredProject';

export interface LoadedProject {
  /** The stored project row: id, name, times and objects without SVG text. */
  project: StoredProject;
  /** The objects joined with their SVG text, ready for the editor. */
  document: ProjectDocument;
  /**
   * Whether stored layers failed validation and were left out. The layers derived again for their colours then start
   * switched off, so a layer the user had turned off never comes back on.
   */
  hasDroppedLayers?: boolean;
}
