/**
 * Builds a material with no tests; fields not given take the default material values.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from './interfaces/Material';
import { DEFAULT_MATERIAL_NAME, DEFAULT_MATERIAL_THICKNESS_MM } from './material.constants';

export const newMaterial = (overrides: Partial<Material> = {}): Material => ({
  id: crypto.randomUUID(),
  name: DEFAULT_MATERIAL_NAME,
  thicknessMm: DEFAULT_MATERIAL_THICKNESS_MM,
  testResults: [],
  ...overrides,
});
