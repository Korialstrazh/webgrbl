/**
 * Tells whether a parsed value is a project file of the current format and version, with well-typed objects
 * and layers, and a well-typed material when there is one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isProjectLayer } from '../layers/is.project.layer';
import { isMaterial } from '../materials/is.material';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { ProjectFile } from './interfaces/ProjectFile';
import { isProjectObject } from './is.project.object';
import { PROJECT_FILE_FORMAT, PROJECT_FILE_VERSION } from './project.constants';

export const isProjectFile = (value: unknown): value is ProjectFile =>
  isRecord(value) &&
  value.format === PROJECT_FILE_FORMAT &&
  value.version === PROJECT_FILE_VERSION &&
  isString(value.name) &&
  Array.isArray(value.objects) &&
  value.objects.every(isProjectObject) &&
  Array.isArray(value.layers) &&
  value.layers.every(isProjectLayer) &&
  (!value.materialId || isString(value.materialId)) &&
  (!value.material || isMaterial(value.material));
