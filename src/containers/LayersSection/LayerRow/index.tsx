/**
 * A row of the layer list: a drag handle, an on/off checkbox and a button that opens the layer settings, showing the
 * swatch, the name, a one-line summary and a note when the colour is not in the palette. Move buttons reorder it
 * without a pointer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { DragEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { ARROW_DOWN, ARROW_UP, DRAG_HANDLE_GRIP } from '../../../utils/characters.constants';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { LAYER_MODE_LABEL_KEY } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LayerSwatch } from '../../../views/LayerSwatch';
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
  onOpen,
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
  const summaryText: string = t(DEFAULT.LAYERS_SUMMARY, {
    mode: t(LAYER_MODE_LABEL_KEY[settings.mode]),
    power: settings.maxPowerPercent,
    speed: settings.speedMmPerMin,
    passes: settings.passes,
  });

  return (
    <li
      className={styles.row}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={allowDropOnRow}
      onDrop={onDrop}
    >
      <span className={styles.handle} aria-hidden="true">{DRAG_HANDLE_GRIP}</span>
      <Checkbox
        checked={layer.enabled}
        aria-label={t(DEFAULT.LAYERS_TOGGLE, { name: layerName })}
        onChange={(changeEvent: CheckboxChangeEvent) => onToggle(changeEvent.target.checked)}
      />
      <Button className={styles.openButton} type={ANTD_BUTTON_TYPE_TEXT} onClick={onOpen}>
        <span className={styles.swatch}>
          <LayerSwatch colour={layer.colour} isShading={layer.isShading} />
        </span>
        <span className={styles.name} title={layerName}>{layerName}</span>
        <span className={styles.summary} title={summaryText}>{summaryText}</span>
        {hasNoPaletteEntry && <span className={styles.note}>{t(DEFAULT.LAYERS_NOT_IN_PALETTE)}</span>}
      </Button>
      <div className={styles.moveButtons}>
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={ARROW_UP}
          disabled={isFirst}
          aria-label={t(DEFAULT.LAYERS_MOVE_UP, { name: layerName })}
          onClick={onMoveUp}
        />
        <Button
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={ARROW_DOWN}
          disabled={isLast}
          aria-label={t(DEFAULT.LAYERS_MOVE_DOWN, { name: layerName })}
          onClick={onMoveDown}
        />
      </div>
    </li>
  );
};
