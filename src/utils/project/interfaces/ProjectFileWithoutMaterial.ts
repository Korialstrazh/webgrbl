/**
 * The content of a version 2 .webgrbl.json project file, written before projects had a material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PROJECT_FILE_VERSION_WITHOUT_MATERIAL } from '../project.constants';
import type { ProjectFile } from './ProjectFile';

export interface ProjectFileWithoutMaterial extends Omit<ProjectFile, 'version' | 'materialId' | 'material'> {
  version: typeof PROJECT_FILE_VERSION_WITHOUT_MATERIAL;
}
