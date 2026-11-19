/**
 * The content of a version 1 .webgrbl.json project file, written before projects had layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PROJECT_FILE_VERSION_WITHOUT_LAYERS } from '../project.constants';
import type { ProjectFile } from './ProjectFile';

export interface ProjectFileWithoutLayers extends Omit<ProjectFile, 'version' | 'layers' | 'materialId' | 'material'> {
  version: typeof PROJECT_FILE_VERSION_WITHOUT_LAYERS;
}
