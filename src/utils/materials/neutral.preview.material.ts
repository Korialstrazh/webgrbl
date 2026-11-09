/**
 * The stand-in material the 3D view builds with while the project has none, so the view always shows the cut. It is
 * never stored or listed; picking a real material rebuilds the model with that one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Material } from './interfaces/Material';
import { DEFAULT_MATERIAL_THICKNESS_MM } from './material.constants';

export const NEUTRAL_PREVIEW_MATERIAL: Material = {
  id: 'neutral-preview-material',
  name: '',
  thicknessMm: DEFAULT_MATERIAL_THICKNESS_MM,
  testResults: [],
};
