/**
 * The table of the material library. A click or Enter on a row opens it in the edit panel; a tick selects it for
 * export without opening it. Opened from a layer, each row of the active laser gets a button that applies it to that
 * layer at once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import type { HTMLAttributes, Key, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_TABLE_COLUMN_ALIGN_RIGHT, ANTD_TABLE_SIZE_SMALL } from '../../../utils/antd.constants';
import { ENTER_KEY, SPACE_KEY } from '../../../utils/browser/browser.events.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
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
    rows, editedPresetId, tickedPresetIds, isMachineColumnShown, rowApply, emptyStateComponent,
    getOperationLabel, getProfileName, onTick, onPick,
  } = props;
  const { t } = useTranslation();

  const renderApplyButton = ({ preset }: MaterialPresetRow): ReactNode => {
    if (!rowApply || preset.machineProfileId !== rowApply.machineProfileId) {
      return null;
    }

    const isApplyAllowed: boolean = canApplyRow(preset, rowApply);
    const buttonLabel: string = isApplyAllowed
      ? t(DEFAULT.MATERIAL_LIBRARY_APPLY_ROW, { layer: rowApply.layerName })
      : t(DEFAULT.MATERIAL_LIBRARY_APPLY_TOO_STRONG);

    return (
      <Tooltip title={buttonLabel}>
        {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
        <span className={styles.applyButtonWrapper}>
          <Button
            size={ANTD_BUTTON_SIZE_SMALL}
            icon={<CheckOutlined />}
            aria-label={buttonLabel}
            disabled={!isApplyAllowed}
            onClick={(clickEvent: MouseEvent<HTMLElement>) => {
              // The button must not open the row in the edit panel as well.
              clickEvent.stopPropagation();
              rowApply.onApply(preset);
            }}
          />
        </span>
      </Tooltip>
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
      title: t(DEFAULT.MATERIAL_LIBRARY_POWER),
      align: ANTD_TABLE_COLUMN_ALIGN_RIGHT,
      onCell: getNumberCellProps,
      render: ({ preset }: MaterialPresetRow) => preset.powerWatts,
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
