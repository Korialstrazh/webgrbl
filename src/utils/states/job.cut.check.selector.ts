/**
 * Selects the line layers the end-of-job cut check offers to run again: the enabled line layers of the last job that
 * finished normally, those set from the Cut palette entry ticked by default.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getLayerDisplayName } from '../layers/get.layer.display.name';
import { getLayerKey } from '../layers/get.layer.key';
import { getLayerPaletteEntry } from '../layers/get.layer.palette.entry';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { CUT_ENTRY_ID, LAYER_MODE } from '../palette/palette.constants';
import type { JobCutCheckLayer } from './interfaces/JobCutCheckLayer';
import { selectJobCutCheckLayerKeys } from './job.run.state';
import { selectPaletteEntries } from './palette.state';
import { selectEnabledProjectLayers } from './project.document.state';

const isCutCheckLayer = (layer: ProjectLayer, layerKeys: string[]): boolean =>
  layer.settings.mode === LAYER_MODE.LINE && layerKeys.includes(getLayerKey(layer));

export const selectJobCutCheckLayers = createSelector(
  [selectJobCutCheckLayerKeys, selectEnabledProjectLayers, selectPaletteEntries],
  (layerKeys: string[], enabledLayers: ProjectLayer[], paletteEntries: PaletteEntry[]): JobCutCheckLayer[] => {
    const cutCheckLayers: JobCutCheckLayer[] = [];

    for (const layer of enabledLayers) {
      if (isCutCheckLayer(layer, layerKeys)) {
        cutCheckLayers.push({
          layerKey: getLayerKey(layer),
          name: getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries)),
          isTickedByDefault: layer.paletteEntryId === CUT_ENTRY_ID,
          presetId: layer.presetId,
        });
      }
    }

    return cutCheckLayers;
  },
);
