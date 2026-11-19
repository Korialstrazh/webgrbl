/**
 * A checked and sanitised project file, ready to be stored as a new project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from '../../materials/interfaces/Material';
import type { ProjectDocument } from './ProjectDocument';

export interface ImportedProjectFile {
  /** The trimmed project name from the file. */
  name: string;
  /** The objects with new ids and sanitised SVG text. */
  document: ProjectDocument;
  /** The checked copy of the material from the file; undefined when the file carries none. */
  material: Material | undefined;
}
