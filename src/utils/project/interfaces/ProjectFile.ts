/**
 * The content of a .webgrbl.json project file: self-contained, every object carries its SVG text and the file embeds a
 * copy of the project's material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { Material } from '../../materials/interfaces/Material';
import type { PROJECT_FILE_FORMAT, PROJECT_FILE_VERSION } from '../project.constants';
import type { ProjectObject } from './ProjectObject';

export interface ProjectFile {
  format: typeof PROJECT_FILE_FORMAT;
  version: typeof PROJECT_FILE_VERSION;
  name: string;
  objects: ProjectObject[];
  layers: ProjectLayer[];
  /** The id of the project's material; missing when the project has none. */
  materialId?: string;
  /** A copy of the project's material; missing when the project has none or it is not known here. */
  material?: Material;
}
