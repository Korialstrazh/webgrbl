/**
 * Tells whether a value is a material preset. It checks the types only; ranges are for whoever takes in the value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';

const MATERIAL_PRESET_OPERATIONS: readonly unknown[] = Object.values(MATERIAL_PRESET_OPERATION);

export const isMaterialPreset = (value: unknown): value is MaterialPreset =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.materialId) &&
  isString(value.machineProfileId) &&
  MATERIAL_PRESET_OPERATIONS.includes(value.operation) &&
  isFiniteNumber(value.powerWatts) &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isString(value.notes);
