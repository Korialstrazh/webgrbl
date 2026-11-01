/**
 * Gets the layers with the laser settings of one layer changed and clamped to the palette ranges. Gives the same list
 * back when the layer is unknown, a value is not a finite number, or the settings stay the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getClampedLayerSettings } from './get.clamped.layer.settings';
import { getLayerKey } from './get.layer.key';
import { isLayerSettings } from './is.layer.settings';
import type { LayerSettings } from './interfaces/LayerSettings';
import type { LayerSettingsChange } from './interfaces/LayerSettingsChange';
import type { ProjectLayer } from './interfaces/ProjectLayer';

const areLayerSettingsEqual = (firstSettings: LayerSettings, secondSettings: LayerSettings): boolean =>
  firstSettings.mode === secondSettings.mode &&
  firstSettings.maxPowerPercent === secondSettings.maxPowerPercent &&
  firstSettings.minPowerPercent === secondSettings.minPowerPercent &&
  firstSettings.speedMmPerMin === secondSettings.speedMmPerMin &&
  firstSettings.passes === secondSettings.passes &&
  firstSettings.airAssist === secondSettings.airAssist &&
  firstSettings.lineIntervalMm === secondSettings.lineIntervalMm;

export const getLayersWithSettings = (
  layers: ProjectLayer[],
  layerKey: string,
  settingsChange: LayerSettingsChange,
): ProjectLayer[] => {
  const changedLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  if (!changedLayer) {
    return layers;
  }

  // A change can carry a value that is not a finite number, such as an emptied input field; it is ignored.
  const changedSettings: unknown = { ...changedLayer.settings, ...settingsChange };

  if (!isLayerSettings(changedSettings)) {
    return layers;
  }

  const clampedSettings: LayerSettings = getClampedLayerSettings(changedSettings);

  if (areLayerSettingsEqual(changedLayer.settings, clampedSettings)) {
    return layers;
  }

  return layers.map(
    (layer: ProjectLayer): ProjectLayer => (layer === changedLayer ? { ...layer, settings: clampedSettings } : layer),
  );
};
