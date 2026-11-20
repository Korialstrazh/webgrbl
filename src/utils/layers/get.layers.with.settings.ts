/**
 * Gets the layers with the laser settings of one layer changed and clamped to the palette ranges. Gives the same list
 * back when the layer is unknown, a value is not a finite number, or neither the settings nor the preset link change.
 *
 * The layer remembers the preset it was set from: a given preset id is stored, and a change without one that alters
 * power, speed or passes clears it. A change to any other setting keeps the link.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getClampedLayerSettings } from './get.clamped.layer.settings';
import { getLayerKey } from './get.layer.key';
import type { LayerSettings } from './interfaces/LayerSettings';
import type { LayerSettingsChange } from './interfaces/LayerSettingsChange';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { isLayerSettings } from './is.layer.settings';

const areLayerSettingsEqual = (firstSettings: LayerSettings, secondSettings: LayerSettings): boolean =>
  firstSettings.mode === secondSettings.mode &&
  firstSettings.maxPowerPercent === secondSettings.maxPowerPercent &&
  firstSettings.minPowerPercent === secondSettings.minPowerPercent &&
  firstSettings.speedMmPerMin === secondSettings.speedMmPerMin &&
  firstSettings.passes === secondSettings.passes &&
  firstSettings.airAssist === secondSettings.airAssist &&
  firstSettings.lineIntervalMm === secondSettings.lineIntervalMm;

const arePresetSettingsEqual = (firstSettings: LayerSettings, secondSettings: LayerSettings): boolean =>
  firstSettings.maxPowerPercent === secondSettings.maxPowerPercent &&
  firstSettings.speedMmPerMin === secondSettings.speedMmPerMin &&
  firstSettings.passes === secondSettings.passes;

const getLinkedPresetId = (
  layer: ProjectLayer,
  clampedSettings: LayerSettings,
  presetId: string | undefined,
): string | undefined => {
  if (typeof presetId === 'string') {
    return presetId;
  }

  return arePresetSettingsEqual(layer.settings, clampedSettings) ? layer.presetId : undefined;
};

export const getLayersWithSettings = (
  layers: ProjectLayer[],
  layerKey: string,
  settingsChange: LayerSettingsChange,
  presetId?: string,
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

  const linkedPresetId: string | undefined = getLinkedPresetId(changedLayer, clampedSettings, presetId);

  if (areLayerSettingsEqual(changedLayer.settings, clampedSettings) && linkedPresetId === changedLayer.presetId) {
    return layers;
  }

  return layers.map(
    (layer: ProjectLayer): ProjectLayer => (layer === changedLayer
      ? { ...layer, settings: clampedSettings, presetId: linkedPresetId }
      : layer),
  );
};
