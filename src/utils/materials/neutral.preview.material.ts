/**
 * The stand-in material the 3D view builds with while the project has none, so the view always shows the cut. It is
 * never stored or listed; picking a real material rebuilds the model with that one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from './interfaces/Material';
import { DEFAULT_MATERIAL_THICKNESS_MM } from './material.constants';

export const NEUTRAL_PREVIEW_MATERIAL: Material = {
  id: 'neutral-preview-material',
  name: '',
  thicknessMm: DEFAULT_MATERIAL_THICKNESS_MM,
  testResults: [],
};
