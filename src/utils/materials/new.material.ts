/**
 * Builds a material with no tests; fields not given take the default material values.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
