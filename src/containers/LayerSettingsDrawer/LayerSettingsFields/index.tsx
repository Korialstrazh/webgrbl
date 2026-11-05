/**
 * The fields of the layer settings drawer: send to laser, mode, power, speed, passes, air assist and line interval,
 * with the buttons that save the settings to the palette and open the palette, and the material preset buttons. Every
 * change is one change in the project history.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  ColumnHeightOutlined,
  DashboardOutlined,
  SaveOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Segmented, Switch } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_SWITCH_SIZE_SMALL } from '../../../utils/antd.constants';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import { getPaletteEntryFromLayer } from '../../../utils/layers/get.palette.entry.from.layer';
import { getPowerWattsText } from '../../../utils/layers/get.power.watts.text';
import type { LayerSettingsChange } from '../../../utils/layers/interfaces/LayerSettingsChange';
import { LAYER_MODE_LABEL_KEY } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { LAYER_MODE } from '../../../utils/palette/palette.constants';
import type { LayerMode } from '../../../utils/palette/palette.constants';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { PaletteEntrySaved, selectPaletteEntries } from '../../../utils/states/palette.state';
import {
  LayerPaletteEntryLinked,
  LayerSettingsChanged,
  LayerToggled,
} from '../../../utils/states/project.document.state';
import { IconActionButton } from '../../../views/IconActionButton';
import { LayerModeIcon } from '../../../views/LayerModeIcon';
import { PaletteIcon } from '../../../views/PaletteIcon';
import type { LayerNumberFieldConfig } from '../interfaces/LayerNumberFieldConfig';
import type { LayerSettingsFieldsProps } from '../interfaces/LayerSettingsFieldsProps';
import { LayerNumberField } from '../LayerNumberField';
import { LayerPresetButtons } from '../LayerPresetButtons';
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

  const getWattsHint = (percent: number): string | undefined =>
    maxPowerWatts ? t(DEFAULT.LAYER_POWER_WATTS, { watts: getPowerWattsText(maxPowerWatts, percent) }) : undefined;

  const renderNumberField = (
    config: LayerNumberFieldConfig,
    iconComponent: ReactNode,
    hintText: string | undefined,
  ): ReactNode => (
    <LayerNumberField
      key={[layerKey, config.field].join(LAYER_FIELD_KEY_SEPARATOR)}
      label={t(config.labelKey)}
      iconComponent={iconComponent}
      captionText={config.captionKey && t(config.captionKey)}
      unitText={config.unitKey && t(config.unitKey)}
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
        options={MODE_OPTION_VALUES.map((mode: LayerMode) => ({
          value: mode,
          icon: <LayerModeIcon mode={mode} />,
          label: t(LAYER_MODE_LABEL_KEY[mode]),
        }))}
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
        {renderNumberField(LAYER_MAX_POWER_FIELD, <ThunderboltOutlined />, getWattsHint(settings.maxPowerPercent))}
        {renderNumberField(LAYER_MIN_POWER_FIELD, <ThunderboltOutlined />, getWattsHint(settings.minPowerPercent))}
        {renderNumberField(LAYER_SPEED_FIELD, <DashboardOutlined />, undefined)}
        {renderNumberField(LAYER_PASSES_FIELD, <SyncOutlined />, undefined)}
        {isFill && renderNumberField(LAYER_LINE_INTERVAL_FIELD, <ColumnHeightOutlined />, undefined)}
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
        <LayerPresetButtons layer={layer} />
        <div className={styles.paletteActions}>
          <IconActionButton
            labelText={t(DEFAULT.LAYER_SETTINGS_SAVE_TO_PALETTE)}
            iconComponent={<SaveOutlined />}
            onClick={savePaletteEntry}
          />
          <IconActionButton
            labelText={t(DEFAULT.LAYER_SETTINGS_EDIT_PALETTE)}
            iconComponent={<PaletteIcon />}
            onClick={onEditPalette}
          />
        </div>
      </div>
    </div>
  );
};
