/**
 * Applies the stored settings of a preset to a layer the user names, as one undo step. It says which layer was changed,
 * because the dialog stays open and hides the layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Select } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import type { LayerSettingsChange } from '../../../utils/layers/interfaces/LayerSettingsChange';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getPresetLayerSettingsChange } from '../../../utils/materials/get.preset.layer.settings.change';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { LayerSettingsChanged, selectProjectLayers } from '../../../utils/states/project.document.state';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { PresetLayerApplyProps } from '../interfaces/PresetLayerApplyProps';
import styles from './styles.module.scss';

const isMinimumPowerLowered = ({ settings }: ProjectLayer, { maxPowerPercent }: LayerSettingsChange): boolean =>
  isFiniteNumber(maxPowerPercent) && settings.minPowerPercent > maxPowerPercent;

export const PresetLayerApply = (props: PresetLayerApplyProps): ReactNode => {
  const { preset, maxPowerWatts, pickedLayerKey, onPickLayer } = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const [appliedText, setAppliedText] = useState<string | undefined>(undefined);
  const isAboveLaserPower: boolean = preset.powerWatts > maxPowerWatts;

  const getLayerName = (layer: ProjectLayer): string =>
    getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries));

  const pickedLayer: ProjectLayer | undefined =
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === pickedLayerKey);

  const applyPreset = (): void => {
    if (pickedLayer) {
      const settingsChange: LayerSettingsChange = getPresetLayerSettingsChange(preset, maxPowerWatts);

      dispatch(new LayerSettingsChanged({ layerKey: getLayerKey(pickedLayer), settings: settingsChange }));
      setAppliedText(t(
        isMinimumPowerLowered(pickedLayer, settingsChange)
          ? DEFAULT.MATERIAL_LIBRARY_APPLIED_MIN_LOWERED
          : DEFAULT.MATERIAL_LIBRARY_APPLIED,
        { name: getLayerName(pickedLayer) },
      ));
    }
  };

  return (
    <div className={styles.presetLayerApply}>
      <Select<string>
        aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
        placeholder={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
        value={pickedLayer && getLayerKey(pickedLayer)}
        options={layers.map((layer: ProjectLayer) => ({ value: getLayerKey(layer), label: getLayerName(layer) }))}
        onChange={(layerKey: string) => {
          onPickLayer(layerKey);
          setAppliedText(undefined);
        }}
      />
      <Button type={ANTD_BUTTON_TYPE_PRIMARY} disabled={!pickedLayer || isAboveLaserPower} onClick={applyPreset}>
        {t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
      </Button>
      {/* The form beside this can hold unsaved edits, which applying does not use. */}
      <p role="note">
        {t(isAboveLaserPower ? DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG : DEFAULT.MATERIAL_LIBRARY_APPLY_SAVED_VALUES)}
      </p>
      <p role="status">{appliedText}</p>
    </div>
  );
};
