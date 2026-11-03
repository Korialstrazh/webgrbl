/**
 * Gets the cut settings to offer for the test sample: those of the first Line layer, else the default Cut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY, LAYER_MODE } from '../palette/palette.constants';
import type { SampleCutSettings } from './interfaces/SampleCutSettings';

export const getSampleCutSettings = (layers: ProjectLayer[]): SampleCutSettings => {
  const lineLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => layer.settings.mode === LAYER_MODE.LINE,
  );
  const { maxPowerPercent, speedMmPerMin, passes } = lineLayer?.settings ?? DEFAULT_CUT_ENTRY;

  return { powerPercent: maxPowerPercent, speedMmPerMin, passes };
};
