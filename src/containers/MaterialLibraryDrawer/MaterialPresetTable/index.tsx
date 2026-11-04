/**
 * The table of the material library. A click or Enter on a row opens it in the edit pane; a tick selects it for
 * export without opening it. Opened from a layer, each row of the active laser gets an Apply button that applies it
 * to that layer at once, and the row says "Applied" in its place for a moment, so the confirmation is where the click
 * was.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { HTMLAttributes, Key, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_TABLE_COLUMN_ALIGN_RIGHT,
  ANTD_TABLE_SIZE_SMALL,
  ANTD_TAG_COLOR_SUCCESS,
} from '../../../utils/antd.constants';
import { ENTER_KEY, SPACE_KEY } from '../../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import { getPresetPowerPercent } from '../../../utils/materials/get.preset.power.percent';
import type { MaterialPresetRow } from '../../../utils/materials/interfaces/MaterialPresetRow';
import type { MaterialPresetRowApply, MaterialPresetTableProps } from '../interfaces/MaterialPresetTableProps';
import styles from './styles.module.scss';

const ROW_TAB_INDEX = 0;
const MATERIAL_NAME_FIELD: keyof MaterialPresetRow = 'materialName';

const COLUMN_KEY = {
  MATERIAL: 'material',
  THICKNESS: 'thickness',
  OPERATION: 'operation',
  POWER: 'power',
  SPEED: 'speed',
  PASSES: 'passes',
  MACHINE: 'machine',
  APPLY: 'apply',
} as const;

const getPresetRowKey = ({ preset }: MaterialPresetRow): string => preset.id;

/** The number cells, not their headers, use the mono font, as the layer summaries do. */
const getNumberCellProps = (): HTMLAttributes<HTMLElement> => ({ className: styles.numberCell });

const isRowOpenKey = ({ key }: KeyboardEvent<HTMLElement>): boolean => key === ENTER_KEY || key === SPACE_KEY;

const canApplyRow = ({ machineProfileId, powerWatts }: MaterialPreset, rowApply: MaterialPresetRowApply): boolean =>
  machineProfileId === rowApply.machineProfileId && powerWatts <= rowApply.maxPowerWatts;

export const MaterialPresetTable = (props: MaterialPresetTableProps): ReactNode => {
  const {
    rows, editedPresetId, tickedPresetIds, isMachineColumnShown, activeProfile, rowApply, emptyStateComponent,
    getOperationLabel, getProfileName, onTick, onPick,
  } = props;
  const { t } = useTranslation();

  /** The watts, and for a preset of the active laser the percent beside them, as the layers show power in percent. */
  const renderPower = ({ preset }: MaterialPresetRow): ReactNode => (
    <>
      {t(DEFAULT.MATERIAL_LIBRARY_POWER_VALUE, { watts: preset.powerWatts })}
      {activeProfile && preset.machineProfileId === activeProfile.id && (
        <span className={styles.powerPercent}>
          {t(DEFAULT.MATERIAL_LIBRARY_POWER_PERCENT, {
            percent: getPresetPowerPercent(preset, activeProfile.maxPowerWatts),
          })}
        </span>
      )}
    </>
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
          // The button must not open the row in the edit pane as well.
          clickEvent.stopPropagation();
          rowApply.onApply(preset);
        }}
      >
        {t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW_COLUMN)}
      </Button>
    );
  };

  const columns: TableColumnsType<MaterialPresetRow> = [
    { key: COLUMN_KEY.MATERIAL, title: t(DEFAULT.MATERIAL_LIBRARY_MATERIAL), dataIndex: MATERIAL_NAME_FIELD },
    {
      key: COLUMN_KEY.THICKNESS,
      title: t(DEFAULT.MATERIAL_LIBRARY_THICKNESS),
      align: ANTD_TABLE_COLUMN_ALIGN_RIGHT,
      onCell: getNumberCellProps,
      render: ({ thicknessMm }: MaterialPresetRow) =>
        t(DEFAULT.MATERIAL_LIBRARY_THICKNESS_VALUE, { thickness: thicknessMm }),
    },
    {
      key: COLUMN_KEY.OPERATION,
      title: t(DEFAULT.MATERIAL_LIBRARY_OPERATION),
      render: ({ preset }: MaterialPresetRow) => getOperationLabel(preset.operation),
    },
    {
      key: COLUMN_KEY.POWER,
      title: t(DEFAULT.MATERIAL_LIBRARY_POWER_COLUMN),
      align: ANTD_TABLE_COLUMN_ALIGN_RIGHT,
      onCell: getNumberCellProps,
      render: renderPower,
    },
    {
      key: COLUMN_KEY.SPEED,
      title: t(DEFAULT.MATERIAL_LIBRARY_SPEED),
      align: ANTD_TABLE_COLUMN_ALIGN_RIGHT,
      onCell: getNumberCellProps,
      render: ({ preset }: MaterialPresetRow) => preset.speedMmPerMin,
    },
    {
      key: COLUMN_KEY.PASSES,
      title: t(DEFAULT.MATERIAL_LIBRARY_PASSES),
      align: ANTD_TABLE_COLUMN_ALIGN_RIGHT,
      onCell: getNumberCellProps,
      render: ({ preset }: MaterialPresetRow) => t(DEFAULT.MATERIAL_LIBRARY_PASSES_VALUE, { passes: preset.passes }),
    },
    // With every machine listed, the same material can appear for several lasers.
    ...(isMachineColumnShown ? [{
      key: COLUMN_KEY.MACHINE,
      title: t(DEFAULT.MATERIAL_LIBRARY_MACHINE),
      render: ({ preset }: MaterialPresetRow) => getProfileName(preset.machineProfileId),
    }] : []),
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
      rowSelection={{
        // Ticks are for export and stay while search or the machine filter hides their rows.
        preserveSelectedRowKeys: true,
        selectedRowKeys: tickedPresetIds,
        // The header tick says what the ticks are for, as nothing else in the table does.
        columnTitle: (selectAllComponent: ReactNode) => (
          <Tooltip title={t(DEFAULT.MATERIAL_LIBRARY_TICK_FOR_EXPORT)}>
            <span className={styles.selectAllWrapper}>{selectAllComponent}</span>
          </Tooltip>
        ),
        getCheckboxProps: () => ({ 'aria-label': t(DEFAULT.MATERIAL_LIBRARY_TICK_FOR_EXPORT) }),
        onChange: (rowKeys: Key[]) => onTick(rowKeys),
        // A tick must not open the row in the edit panel as well.
        onCell: () => ({
          onClick: (clickEvent: MouseEvent<HTMLElement>) => clickEvent.stopPropagation(),
        }),
      }}
      rowClassName={({ preset }: MaterialPresetRow): string =>
        (preset.id === editedPresetId ? [styles.presetRow, styles.editedRow].join(' ') : styles.presetRow ?? '')}
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
