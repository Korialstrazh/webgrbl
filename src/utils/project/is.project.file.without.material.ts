/**
 * Tells whether a parsed value is a version 2 project file, written before projects had a material, with well-typed
 * objects and layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isProjectLayer } from '../layers/is.project.layer';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { ProjectFileWithoutMaterial } from './interfaces/ProjectFileWithoutMaterial';
import { isProjectObject } from './is.project.object';
import { PROJECT_FILE_FORMAT, PROJECT_FILE_VERSION_WITHOUT_MATERIAL } from './project.constants';

export const isProjectFileWithoutMaterial = (value: unknown): value is ProjectFileWithoutMaterial =>
  isRecord(value) &&
  value.format === PROJECT_FILE_FORMAT &&
  value.version === PROJECT_FILE_VERSION_WITHOUT_MATERIAL &&
  isString(value.name) &&
  Array.isArray(value.objects) &&
  value.objects.every(isProjectObject) &&
  Array.isArray(value.layers) &&
  value.layers.every(isProjectLayer);
