/**
 * Tells whether a parsed value is a version 1 project file, written before projects had layers, with well-typed
 * objects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { ProjectFileWithoutLayers } from './interfaces/ProjectFileWithoutLayers';
import { isProjectObject } from './is.project.object';
import { PROJECT_FILE_FORMAT, PROJECT_FILE_VERSION_WITHOUT_LAYERS } from './project.constants';

export const isProjectFileWithoutLayers = (value: unknown): value is ProjectFileWithoutLayers =>
  isRecord(value) &&
  value.format === PROJECT_FILE_FORMAT &&
  value.version === PROJECT_FILE_VERSION_WITHOUT_LAYERS &&
  isString(value.name) &&
  Array.isArray(value.objects) &&
  value.objects.every(isProjectObject);
