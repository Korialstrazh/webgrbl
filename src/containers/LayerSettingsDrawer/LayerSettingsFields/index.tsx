/**
 * The fields of the layer settings drawer: send to laser, mode, power, speed, passes, air assist and line interval,
 * with the buttons that save the settings to the palette and open the palette. Every change is one change in the
 * project history.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Segmented, Switch } from 'antd';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT, ANTD_SWITCH_SIZE_SMALL } from '../../../utils/antd.constants';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import { getPaletteEntryFromLayer } from '../../../utils/layers/get.palette.entry.from.layer';
import { getPowerWattsText } from '../../../utils/layers/get.power.watts.text';
import type { LayerSettingsChange } from '../../../utils/layers/interfaces/LayerSettingsChange';
import { LAYER_MODE_LABEL_KEY } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { Material } from '../../../utils/materials/interfaces/Material';
import { newMaterialPresetFromLayer } from '../../../utils/materials/new.material.preset.from.layer';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { LAYER_MODE } from '../../../utils/palette/palette.constants';
import type { LayerMode } from '../../../utils/palette/palette.constants';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import { MaterialPresetSaved } from '../../../utils/states/material.preset.state';
import { selectActiveMaterial } from '../../../utils/states/material.selectors';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PaletteEntrySaved, selectPaletteEntries } from '../../../utils/states/palette.state';
import {
  LayerPaletteEntryLinked,
  LayerSettingsChanged,
  LayerToggled,
} from '../../../utils/states/project.document.state';
import { MaterialLibraryDialog } from '../../MaterialLibraryDialog';
import type { LayerNumberFieldConfig } from '../interfaces/LayerNumberFieldConfig';
import type { LayerSettingsFieldsProps } from '../interfaces/LayerSettingsFieldsProps';
import { LayerNumberField } from '../LayerNumberField';
import {
  LAYER_FIELD_KEY_SEPARATOR,
  LAYER_LINE_INTERVAL_FIELD,
  LAYER_MAX_POWER_FIELD,
  LAYER_MIN_POWER_FIELD,
  LAYER_PASSES_FIELD,
  LAYER_SPEED_FIELD,
} from '../layer.settings.drawer.constants';
import { ShadingPowerBar } from '../ShadingPowerBar';
import styles from './styles.module.scss';

const MODE_OPTION_VALUES: readonly LayerMode[] = [LAYER_MODE.LINE, LAYER_MODE.FILL];

export const LayerSettingsFields = ({ layer, onEditPalette }: LayerSettingsFieldsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const sendLabelId: string = useId();
  const airAssistLabelId: string = useId();
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const machineProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [savedPresetMaterialName, setSavedPresetMaterialName] = useState<string | undefined>(undefined);
  const layerKey: string = getLayerKey(layer);
  const { settings } = layer;
  const maxPowerWatts: number | undefined = machineProfile?.maxPowerWatts;
  const isFill: boolean = settings.mode === LAYER_MODE.FILL;

  const changeSettings = (settingsChange: LayerSettingsChange): void => {
    dispatch(new LayerSettingsChanged({ layerKey, settings: settingsChange }));
  };

  const savePaletteEntry = (): void => {
    const layerEntry: PaletteEntry | undefined = getLayerPaletteEntry(layer, paletteEntries);
    const savedEntry: PaletteEntry = getPaletteEntryFromLayer(layer, layerEntry);

    dispatch(new PaletteEntrySaved({ entry: savedEntry }));

    if (!layerEntry) {
      dispatch(new LayerPaletteEntryLinked({ layerKey, paletteEntryId: savedEntry.id }));
    }
  };

  const savePreset = (): void => {
    if (activeMaterial && machineProfile) {
      dispatch(new MaterialPresetSaved({
        preset: newMaterialPresetFromLayer(layer, activeMaterial.id, machineProfile),
      }));
      setSavedPresetMaterialName(activeMaterial.name);
    }
  };

  const getWattsHint = (percent: number): string | undefined =>
    maxPowerWatts ? t(DEFAULT.LAYER_POWER_WATTS, { watts: getPowerWattsText(maxPowerWatts, percent) }) : undefined;

  const renderNumberField = (config: LayerNumberFieldConfig, hintText: string | undefined): ReactNode => (
    <LayerNumberField
      key={[layerKey, config.field].join(LAYER_FIELD_KEY_SEPARATOR)}
      label={t(config.labelKey)}
      value={settings[config.field]}
      decimals={config.decimals}
      hintText={hintText}
      onCommit={(fieldValue: number) => changeSettings({ [config.field]: fieldValue })}
    />
  );

  return (
    <div className={styles.fields}>
      <div className={styles.switchRow}>
        <span id={sendLabelId}>{t(DEFAULT.LAYER_SETTINGS_SEND)}</span>
        <Switch
          size={ANTD_SWITCH_SIZE_SMALL}
          checked={layer.enabled}
          aria-labelledby={sendLabelId}
          onChange={(enabled: boolean) => dispatch(new LayerToggled({ layerKey, enabled }))}
        />
      </div>
      <Segmented<LayerMode>
        block
        aria-label={t(DEFAULT.LAYER_SETTINGS_MODE)}
        value={settings.mode}
        options={MODE_OPTION_VALUES.map((mode: LayerMode) => ({ value: mode, label: t(LAYER_MODE_LABEL_KEY[mode]) }))}
        onChange={(mode: LayerMode) => changeSettings({ mode })}
      />
      {layer.isShading && (
        <ShadingPowerBar
          maxPowerPercent={settings.maxPowerPercent}
          minPowerPercent={settings.minPowerPercent}
          maxPowerWatts={maxPowerWatts}
        />
      )}
      <div className={styles.grid}>
        {renderNumberField(LAYER_MAX_POWER_FIELD, getWattsHint(settings.maxPowerPercent))}
        {renderNumberField(LAYER_MIN_POWER_FIELD, getWattsHint(settings.minPowerPercent))}
        {renderNumberField(LAYER_SPEED_FIELD, undefined)}
        {renderNumberField(LAYER_PASSES_FIELD, undefined)}
        {isFill && renderNumberField(LAYER_LINE_INTERVAL_FIELD, undefined)}
      </div>
      {machineProfile?.hasAirAssist && (
        <div className={styles.switchRow}>
          <span id={airAssistLabelId}>{t(DEFAULT.LAYER_SETTINGS_AIR_ASSIST)}</span>
          <Switch
            size={ANTD_SWITCH_SIZE_SMALL}
            checked={settings.airAssist}
            aria-labelledby={airAssistLabelId}
            onChange={(airAssist: boolean) => changeSettings({ airAssist })}
          />
        </div>
      )}
      <div className={styles.actions}>
        <Button type={ANTD_BUTTON_TYPE_DEFAULT} onClick={savePaletteEntry}>
          {t(DEFAULT.LAYER_SETTINGS_SAVE_TO_PALETTE)}
        </Button>
        <Button type={ANTD_BUTTON_TYPE_DEFAULT} onClick={onEditPalette}>
          {t(DEFAULT.LAYER_SETTINGS_EDIT_PALETTE)}
        </Button>
      </div>
      <div className={styles.actions}>
        {/* A preset at 0 W could never be saved again in the library, so it is not offered. */}
        <Button
          type={ANTD_BUTTON_TYPE_DEFAULT}
          disabled={!activeMaterial || !machineProfile || !settings.maxPowerPercent}
          onClick={savePreset}
        >
          {t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE)}
        </Button>
        <Button type={ANTD_BUTTON_TYPE_DEFAULT} onClick={() => setIsLibraryOpen(true)}>
          {t(DEFAULT.LAYER_SETTINGS_PRESET_APPLY)}
        </Button>
      </div>
      {!activeMaterial && <p role="note">{t(DEFAULT.LAYER_SETTINGS_PRESET_NEEDS_MATERIAL)}</p>}
      <p role="status">
        {savedPresetMaterialName && t(DEFAULT.LAYER_SETTINGS_PRESET_SAVED, { name: savedPresetMaterialName })}
      </p>
      <MaterialLibraryDialog
        isOpen={isLibraryOpen}
        initialLayerKey={layerKey}
        onClose={() => setIsLibraryOpen(false)}
      />
    </div>
  );
};
