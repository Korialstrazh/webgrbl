/**
 * A row of the layer list: a drag handle, an on/off checkbox and a button that opens the layer settings, showing the
 * swatch, the name, a summary and a note when the colour is not in the palette. Move buttons reorder it
 * without a pointer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { DragEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LayerModeIcon } from '../../../views/LayerModeIcon';
import { LayerSwatch } from '../../../views/LayerSwatch';
import { LayerValueCells } from '../../../views/LayerValueCells';
import type { LayerRowProps } from '../interfaces/LayerRowProps';
import styles from './styles.module.scss';

const allowDropOnRow = (dragEvent: DragEvent<HTMLLIElement>): void => {
  dragEvent.preventDefault();
};

export const LayerRow = ({
  layer,
  layerEntry,
  isFirst,
  isLast,
  isOpen,
  onOpen,
  openButtonRef,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDrop,
}: LayerRowProps): ReactNode => {
  const { t } = useTranslation();
  const layerName: string = getLayerDisplayName(layer, layerEntry);
  const { settings } = layer;
  const hasNoPaletteEntry: boolean = !layerEntry;

  return (
    <li
      className={isOpen ? [styles.row, styles.openRow].join(' ') : styles.row}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={allowDropOnRow}
      onDrop={onDrop}
    >
      <HolderOutlined className={styles.handle} aria-hidden="true" />
      <Tooltip title={t(DEFAULT.LAYERS_TOGGLE, { name: layerName })}>
        <Checkbox
          checked={layer.enabled}
          aria-label={t(DEFAULT.LAYERS_TOGGLE, { name: layerName })}
          onChange={(changeEvent: CheckboxChangeEvent) => onToggle(changeEvent.target.checked)}
        />
      </Tooltip>
      <Button
        ref={openButtonRef}
        className={styles.openButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-expanded={isOpen}
        onClick={onOpen}
      >
        <span className={styles.swatch}>
          <LayerSwatch colour={layer.colour} isShading={layer.isShading} />
        </span>
        <span className={styles.name} title={layerName}>{layerName}</span>
        <span className={styles.modeIcon} aria-hidden><LayerModeIcon mode={settings.mode} /></span>
        <LayerValueCells className={styles.summary} settings={settings} />
        {hasNoPaletteEntry && <span className={styles.note}>{t(DEFAULT.LAYERS_NOT_IN_PALETTE)}</span>}
      </Button>
      <div className={styles.moveButtons}>
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<ArrowUpOutlined />}
          disabled={isFirst}
          aria-label={t(DEFAULT.LAYERS_MOVE_UP, { name: layerName })}
          onClick={onMoveUp}
        />
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<ArrowDownOutlined />}
          disabled={isLast}
          aria-label={t(DEFAULT.LAYERS_MOVE_DOWN, { name: layerName })}
          onClick={onMoveDown}
        />
      </div>
    </li>
  );
};
