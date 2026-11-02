/**
 * A row of the palette list: a drag handle and a button that selects the entry, with its swatch, name and summary,
 * move buttons that reorder it without a pointer, and a delete button that asks first. The shading entry has none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, HolderOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { DragEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../../utils/antd.constants';
import { getLayerSummaryParts } from '../../../../utils/layers/get.layer.summary.parts';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import { SHADING_ENTRY_ID } from '../../../../utils/palette/palette.constants';
import { LayerSummaryText } from '../../../../views/LayerSummaryText';
import { LayerSwatch } from '../../../../views/LayerSwatch';
import type { PaletteEntryRowProps } from '../interfaces/PaletteEntryRowProps';
import styles from './styles.module.scss';

const allowDropOnRow = (dragEvent: DragEvent<HTMLLIElement>): void => {
  dragEvent.preventDefault();
};

export const PaletteEntryRow = ({
  entry,
  isEdited,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDrop,
}: PaletteEntryRowProps): ReactNode => {
  const { t } = useTranslation();
  const { name: entryName } = entry;
  const isShading: boolean = entry.id === SHADING_ENTRY_ID;

  return (
    <li
      className={isEdited ? [styles.row, styles.editedRow].join(' ') : styles.row}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={allowDropOnRow}
      onDrop={onDrop}
    >
      <HolderOutlined className={styles.handle} aria-hidden="true" />
      <Button
        className={styles.selectButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-current={isEdited}
        onClick={onSelect}
      >
        <span className={styles.swatch}>
          <LayerSwatch colour={entry.colour} isShading={isShading} />
        </span>
        <span className={styles.name} title={entryName}>{entryName}</span>
        <LayerSummaryText className={styles.summary} parts={getLayerSummaryParts(t, entry)} />
      </Button>
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<ArrowUpOutlined />}
        disabled={isFirst}
        aria-label={t(DEFAULT.PALETTE_MOVE_UP, { name: entryName })}
        onClick={onMoveUp}
      />
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<ArrowDownOutlined />}
        disabled={isLast}
        aria-label={t(DEFAULT.PALETTE_MOVE_DOWN, { name: entryName })}
        onClick={onMoveDown}
      />
      {!isShading && (
        <Popconfirm
          title={t(DEFAULT.PALETTE_DELETE_CONFIRM, { name: entryName })}
          okText={t(DEFAULT.PALETTE_DELETE_OK)}
          cancelText={t(DEFAULT.PALETTE_DELETE_CANCEL)}
          okButtonProps={{ danger: true }}
          onConfirm={onDelete}
        >
          <Button
            className={styles.deleteButton}
            type={ANTD_BUTTON_TYPE_TEXT}
            size={ANTD_BUTTON_SIZE_SMALL}
            icon={<CloseOutlined />}
            aria-label={t(DEFAULT.PALETTE_DELETE, { name: entryName })}
          />
        </Popconfirm>
      )}
    </li>
  );
};
