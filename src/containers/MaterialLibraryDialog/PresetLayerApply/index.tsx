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
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getPresetLayerSettingsChange } from '../../../utils/materials/get.preset.layer.settings.change';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { LayerSettingsChanged, selectProjectLayers } from '../../../utils/states/project.document.state';
import type { PresetLayerApplyProps } from '../interfaces/PresetLayerApplyProps';
import styles from './styles.module.scss';

export const PresetLayerApply = ({ preset, maxPowerWatts, initialLayerKey }: PresetLayerApplyProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const [pickedLayerKey, setPickedLayerKey] = useState<string | undefined>(initialLayerKey);
  const [appliedLayerName, setAppliedLayerName] = useState<string | undefined>(undefined);

  const getLayerName = (layer: ProjectLayer): string =>
    getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries));

  const pickedLayer: ProjectLayer | undefined =
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === pickedLayerKey);

  const applyPreset = (): void => {
    if (pickedLayer) {
      dispatch(new LayerSettingsChanged({
        layerKey: getLayerKey(pickedLayer),
        settings: getPresetLayerSettingsChange(preset, maxPowerWatts),
      }));
      setAppliedLayerName(getLayerName(pickedLayer));
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
          setPickedLayerKey(layerKey);
          setAppliedLayerName(undefined);
        }}
      />
      <Button type={ANTD_BUTTON_TYPE_PRIMARY} disabled={!pickedLayer} onClick={applyPreset}>
        {t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
      </Button>
      <p role="status">{appliedLayerName && t(DEFAULT.MATERIAL_LIBRARY_APPLIED, { name: appliedLayerName })}</p>
    </div>
  );
};
