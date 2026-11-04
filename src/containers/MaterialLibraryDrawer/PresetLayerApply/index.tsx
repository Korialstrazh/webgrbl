/**
 * Applies the stored settings of a preset to a layer the user names, as one undo step. It is the main action while
 * the form beside it has nothing to save.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
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
  const { preset, maxPowerWatts, pickedLayerKey, isFormChanged, onPickLayer, onApplied } = props;
  const { t } = useTranslation();
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const applyPresetToLayer: ApplyPresetToLayer = useApplyPresetToLayer(maxPowerWatts);
  const isAboveLaserPower: boolean = preset.powerWatts > maxPowerWatts;
  const pickedLayer: ProjectLayer | undefined =
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === pickedLayerKey);

  const getLayerName = (layer: ProjectLayer): string =>
    getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries));

  const applyPreset = (): void => {
    const appliedText: string | undefined = pickedLayer && applyPresetToLayer(preset, getLayerKey(pickedLayer));

    if (appliedText) {
      onApplied(appliedText);
    }
  };

  const getNoteText = (): string | undefined => {
    if (isAboveLaserPower) {
      return t(DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG);
    }

    return isFormChanged ? t(DEFAULT.MATERIAL_LIBRARY_APPLY_SAVED_VALUES) : undefined;
  };

  const noteText: string | undefined = getNoteText();

  return (
    <div className={styles.presetLayerApply}>
      <div className={styles.controls}>
        <Select<string>
          className={styles.layerSelect}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
          placeholder={t(DEFAULT.MATERIAL_LIBRARY_APPLY_LAYER)}
          value={pickedLayer && getLayerKey(pickedLayer)}
          options={layers.map((layer: ProjectLayer) => ({ value: getLayerKey(layer), label: getLayerName(layer) }))}
          onChange={onPickLayer}
        />
        <Button
          type={isFormChanged ? ANTD_BUTTON_TYPE_DEFAULT : ANTD_BUTTON_TYPE_PRIMARY}
          icon={<CheckOutlined />}
          // The icon carries a label of its own, so the button names itself to keep its accessible name to its text.
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
          disabled={!pickedLayer || isAboveLaserPower}
          onClick={applyPreset}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_APPLY)}
        </Button>
      </div>
      {noteText && <p className={styles.note} role="note">{noteText}</p>}
    </div>
  );
};
