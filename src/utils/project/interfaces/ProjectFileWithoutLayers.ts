/**
 * The content of a version 1 .webgrbl.json project file, written before projects had layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PROJECT_FILE_VERSION_WITHOUT_LAYERS } from '../project.constants';
import type { ProjectFile } from './ProjectFile';

export interface ProjectFileWithoutLayers extends Omit<ProjectFile, 'version' | 'layers'> {
  version: typeof PROJECT_FILE_VERSION_WITHOUT_LAYERS;
}
