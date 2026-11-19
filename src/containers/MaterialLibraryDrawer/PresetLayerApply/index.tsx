/**
 * Applies the stored settings of the open preset to a layer the user names, as one undo step, from a labelled block
 * at the foot of the edit view. The block is always there: its note says that applying uses the saved values, or why
 * nothing can be applied yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { selectProjectLayers } from '../../../utils/states/project.document.state';
import type { ApplyPresetToLayer } from '../interfaces/ApplyPresetToLayer';
import type { PresetLayerApplyProps } from '../interfaces/PresetLayerApplyProps';
import { useApplyPresetToLayer } from '../use.apply.preset.to.layer';
import styles from './styles.module.scss';

export const PresetLayerApply = (props: PresetLayerApplyProps): ReactNode => {
  const { preset, isPresetStored, maxPowerWatts, pickedLayerKey, onPickLayer, onApplied } = props;
  const { t } = useTranslation();
  const headingId: string = useId();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const applyPresetToLayer: ApplyPresetToLayer = useApplyPresetToLayer(maxPowerWatts);
  const isAboveLaserPower: boolean = preset ? preset.powerWatts > maxPowerWatts : false;
  const pickedLayer: ProjectLayer | undefined =
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === pickedLayerKey);
  const isApplyAllowed: boolean = Boolean(preset && pickedLayer) && !isAboveLaserPower;

  const getLayerName = (layer: ProjectLayer): string =>
    getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries));

  const applyPreset = (): void => {
    const appliedText: string | undefined =
      preset && pickedLayer && applyPresetToLayer(preset, getLayerKey(pickedLayer));

    if (appliedText) {
      onApplied(appliedText);
    }
  };

  const getNoteText = (): string => {
    if (!preset) {
      return t(isPresetStored
        ? DEFAULT.MATERIAL_LIBRARY_APPLY_OTHER_MACHINE
        : DEFAULT.MATERIAL_LIBRARY_APPLY_SAVE_FIRST);
    }

    return t(isAboveLaserPower
      ? DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG
      : DEFAULT.MATERIAL_LIBRARY_APPLY_SAVED_VALUES);
  };

  return (
    <div className={styles.presetLayerApply} role="group" aria-labelledby={headingId}>
      <span id={headingId} className={styles.heading}>{t(DEFAULT.MATERIAL_LIBRARY_APPLY_HEADING)}</span>
      <div className={styles.controls}>
        <Select<string>
          className={styles.layerSelect}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
          placeholder={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
          value={pickedLayer && getLayerKey(pickedLayer)}
          options={layers.map((layer: ProjectLayer) => ({ value: getLayerKey(layer), label: getLayerName(layer) }))}
          disabled={!preset}
          onChange={onPickLayer}
        />
        <Button
          icon={<CheckOutlined />}
          // The icon carries a label of its own, so the button names itself to keep its accessible name to its text.
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
          disabled={!isApplyAllowed}
          onClick={applyPreset}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
        </Button>
      </div>
      <p className={styles.note} role="note">{getNoteText()}</p>
    </div>
  );
};
