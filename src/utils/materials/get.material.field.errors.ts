/**
 * Checks the name and the thickness a user entered for a material. The name is measured without the spaces around it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import type { MaterialFieldErrors } from './interfaces/MaterialFieldErrors';
import {
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_NAME_LENGTH_MIN,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from './material.constants';

const isMaterialNameValid = (materialName: string): boolean => {
  const { length } = materialName.trim();

  return length >= MATERIAL_NAME_LENGTH_MIN && length <= MATERIAL_NAME_LENGTH_MAX;
};

const isMaterialThicknessValid = (thicknessMm: number): boolean =>
  isFiniteNumber(thicknessMm) && thicknessMm >= MATERIAL_THICKNESS_MM_MIN && thicknessMm <= MATERIAL_THICKNESS_MM_MAX;

export const getMaterialFieldErrors = (materialName: string, thicknessMm: number): MaterialFieldErrors => ({
  nameErrorKey: isMaterialNameValid(materialName) ? undefined : DEFAULT.MATERIAL_DIALOG_NAME_INVALID,
  thicknessErrorKey: isMaterialThicknessValid(thicknessMm) ? undefined : DEFAULT.MATERIAL_DIALOG_THICKNESS_INVALID,
});
