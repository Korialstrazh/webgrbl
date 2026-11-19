/**
 * The content of a version 2 .webgrbl.json project file, written before projects had a material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PROJECT_FILE_VERSION_WITHOUT_MATERIAL } from '../project.constants';
import type { ProjectFile } from './ProjectFile';

export interface ProjectFileWithoutMaterial extends Omit<ProjectFile, 'version' | 'materialId' | 'material'> {
  version: typeof PROJECT_FILE_VERSION_WITHOUT_MATERIAL;
}
