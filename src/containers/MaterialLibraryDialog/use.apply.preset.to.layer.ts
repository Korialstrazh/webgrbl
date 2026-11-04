/**
 * Gives the function that applies a preset of the active laser to a layer, as one undo step, and says which layer was
 * changed, because the dialog stays open and hides the layer. Both the edit panel and the row buttons use it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLayerDisplayName } from '../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../utils/layers/get.layer.palette.entry';
import type { LayerSettingsChange } from '../../utils/layers/interfaces/LayerSettingsChange';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getPresetLayerSettingsChange } from '../../utils/materials/get.preset.layer.settings.change';
import type { MaterialPreset } from '../../utils/materials/interfaces/MaterialPreset';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { LayerSettingsChanged, selectProjectLayers } from '../../utils/states/project.document.state';
import { isFiniteNumber } from '../../utils/type.guards/is.finite.number';
import type { ApplyPresetToLayer } from './interfaces/ApplyPresetToLayer';

const isMinimumPowerLowered = ({ settings }: ProjectLayer, { maxPowerPercent }: LayerSettingsChange): boolean =>
  isFiniteNumber(maxPowerPercent) && settings.minPowerPercent > maxPowerPercent;

export const useApplyPresetToLayer = (maxPowerWatts: number): ApplyPresetToLayer => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);

  return (preset: MaterialPreset, layerKey: string): string | undefined => {
    const layer: ProjectLayer | undefined =
      layers.find((projectLayer: ProjectLayer): boolean => getLayerKey(projectLayer) === layerKey);

    if (!layer) {
      return undefined;
    }

    const settingsChange: LayerSettingsChange = getPresetLayerSettingsChange(preset, maxPowerWatts);

    dispatch(new LayerSettingsChanged({ layerKey, settings: settingsChange }));

    return t(
      isMinimumPowerLowered(layer, settingsChange)
        ? DEFAULT.MATERIAL_LIBRARY_APPLIED_MIN_LOWERED
        : DEFAULT.MATERIAL_LIBRARY_APPLIED,
      { name: getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries)) },
    );
  };
};
