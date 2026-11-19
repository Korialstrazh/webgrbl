/**
 * The list of the material library, compact enough for the narrow drawer: each row names the material, thickness and
 * operation on one line and the power, speed and passes on a second, with the machine after them when the rows can
 * belong to several lasers. A click or Enter on a row opens it in the edit view; a tick selects it for export
 * without opening it. Opened from a layer, each row of the active laser gets an Apply button that applies it to that
 * layer at once, and the row says "Applied" in its place for a moment, so the confirmation is where the click was.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Key, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_TABLE_SIZE_SMALL, ANTD_TAG_COLOR_SUCCESS } from '../../../utils/antd.constants';
import { ENTER_KEY, SPACE_KEY } from '../../../utils/browser/browser.events.constants';
import { MIDDLE_DOT } from '../../../utils/characters.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import { getPresetPowerPercent } from '../../../utils/materials/get.preset.power.percent';
import type { MaterialPresetRow } from '../../../utils/materials/interfaces/MaterialPresetRow';
import type { MaterialPresetRowApply, MaterialPresetTableProps } from '../interfaces/MaterialPresetTableProps';
import styles from './styles.module.scss';

const ROW_TAB_INDEX = 0;
const DETAIL_SEPARATOR = ` ${MIDDLE_DOT} `;

const COLUMN_KEY = {
  PRESET: 'preset',
  APPLY: 'apply',
} as const;

const getPresetRowKey = ({ preset }: MaterialPresetRow): string => preset.id;

const isRowOpenKey = ({ key }: KeyboardEvent<HTMLElement>): boolean => key === ENTER_KEY || key === SPACE_KEY;

const canApplyRow = ({ machineProfileId, powerWatts }: MaterialPreset, rowApply: MaterialPresetRowApply): boolean =>
  machineProfileId === rowApply.machineProfileId && powerWatts <= rowApply.maxPowerWatts;

export const MaterialPresetTable = (props: MaterialPresetTableProps): ReactNode => {
  const {
    rows, tickedPresetIds, isMachineNamed, activeProfile, rowApply, emptyStateComponent,
    getOperationLabel, getProfileName, onTick, onPick,
  } = props;
  const { t } = useTranslation();

  /** The watts, and for a preset of the active laser the percent beside them, as the layers show power in percent. */
  const renderPower = (preset: MaterialPreset): ReactNode => (
    <span>
      {t(DEFAULT.MATERIAL_LIBRARY_POWER_VALUE, { watts: preset.powerWatts })}
      {activeProfile && preset.machineProfileId === activeProfile.id && (
        <span className={styles.powerPercent}>
          {t(DEFAULT.MATERIAL_LIBRARY_POWER_PERCENT, {
            percent: getPresetPowerPercent(preset, activeProfile.maxPowerWatts),
          })}
        </span>
      )}
    </span>
  );

  const renderPreset = ({ preset, materialName, thicknessMm }: MaterialPresetRow): ReactNode => (
    <span className={styles.presetCell}>
      <span className={styles.presetName}>
        {t(DEFAULT.MATERIAL_LIBRARY_PRESET_NAME, {
          name: materialName,
          thickness: thicknessMm,
          operation: getOperationLabel(preset.operation),
        })}
      </span>
      <span className={styles.presetDetail}>
        <span className={styles.numbers}>
          {renderPower(preset)}
          {DETAIL_SEPARATOR}
          <span>{t(DEFAULT.MATERIAL_LIBRARY_SPEED_VALUE, { speed: preset.speedMmPerMin })}</span>
          {DETAIL_SEPARATOR}
          <span>{t(DEFAULT.MATERIAL_LIBRARY_PASSES_VALUE, { passes: preset.passes })}</span>
        </span>
        {isMachineNamed && (
          <span className={styles.machineName}>
            {DETAIL_SEPARATOR}
            {getProfileName(preset.machineProfileId)}
          </span>
        )}
      </span>
    </span>
  );

  const renderApplyButton = ({ preset }: MaterialPresetRow): ReactNode => {
    if (!rowApply || preset.machineProfileId !== rowApply.machineProfileId) {
      return null;
    }

    if (preset.id === rowApply.appliedPresetId) {
      return (
        <Tag className={styles.appliedTag} color={ANTD_TAG_COLOR_SUCCESS} icon={<CheckOutlined aria-hidden />}>
          {t(DEFAULT.MATERIAL_LIBRARY_APPLIED_ROW)}
        </Tag>
      );
    }

    if (!canApplyRow(preset, rowApply)) {
      // A disabled button fires no hover events, so the tooltip with the reason listens on a plain wrapper.
      return (
        <Tooltip title={t(DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG)}>
          <span className={styles.applyButtonWrapper}>
            <Button size={ANTD_BUTTON_SIZE_SMALL} aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG)} disabled>
              {t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW_COLUMN)}
            </Button>
          </span>
        </Tooltip>
      );
    }

    // No tooltip: the text says what the button does, and a tooltip would take the first Escape meant for the drawer.
    return (
      <Button
        size={ANTD_BUTTON_SIZE_SMALL}
        aria-label={t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW, { layer: rowApply.layerName })}
        onClick={(clickEvent: MouseEvent<HTMLElement>) => {
          // The button must not open the row in the edit view as well.
          clickEvent.stopPropagation();
          rowApply.onApply(preset);
        }}
      >
        {t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW_COLUMN)}
      </Button>
    );
  };

  const columns: TableColumnsType<MaterialPresetRow> = [
    { key: COLUMN_KEY.PRESET, title: t(DEFAULT.MATERIAL_LIBRARY_PRESET_COLUMN), render: renderPreset },
    ...(rowApply ? [{
      key: COLUMN_KEY.APPLY,
      title: t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW_COLUMN),
      className: styles.applyCell,
      render: renderApplyButton,
    }] : []),
  ];

  return (
    <Table<MaterialPresetRow>
      className={styles.presetTable}
      size={ANTD_TABLE_SIZE_SMALL}
      pagination={false}
      rowKey={getPresetRowKey}
      columns={columns}
      dataSource={rows}
      locale={{ emptyText: emptyStateComponent }}
      // An empty list shows its empty state alone, never column names over nothing.
      showHeader={rows.length > 0}
      rowSelection={{
        // Ticks are for export and stay while search or the machine filter hides their rows.
        preserveSelectedRowKeys: true,
        selectedRowKeys: tickedPresetIds,
        // The header tick says what the ticks are for, as nothing else in the list does.
        columnTitle: (selectAllComponent: ReactNode) => (
          <Tooltip title={t(DEFAULT.MATERIAL_LIBRARY_TICK_FOR_EXPORT)}>
            <span className={styles.selectAllWrapper}>{selectAllComponent}</span>
          </Tooltip>
        ),
        getCheckboxProps: () => ({ 'aria-label': t(DEFAULT.MATERIAL_LIBRARY_TICK_FOR_EXPORT) }),
        onChange: (rowKeys: Key[]) => onTick(rowKeys),
        // A tick must not open the row in the edit view as well.
        onCell: () => ({
          onClick: (clickEvent: MouseEvent<HTMLElement>) => clickEvent.stopPropagation(),
        }),
      }}
      rowClassName={() => styles.presetRow ?? ''}
      onRow={({ preset }: MaterialPresetRow) => ({
        tabIndex: ROW_TAB_INDEX,
        onClick: () => onPick(preset),
        onKeyDown: (keyboardEvent: KeyboardEvent<HTMLElement>) => {
          // Only a key on the row itself: a key in the checkbox or a button of the row is theirs.
          if (keyboardEvent.target === keyboardEvent.currentTarget && isRowOpenKey(keyboardEvent)) {
            keyboardEvent.preventDefault();
            onPick(preset);
          }
        },
      })}
    />
  );
};
