/**
 * A row of the layer list: a drag handle, an on/off checkbox drawn as an eye (the row dims while off) and a button
 * that opens the layer settings, showing the swatch, the name, a summary and an info icon when the colour is not in the
 * palette (the layer is then named after the plain colour it looks like). The handle is a button too: focused, the up
 * and down arrow keys move the layer one place, so the order changes without a pointer, and touch or pen can drag
 * it, as native drag and drop only works with a mouse.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  HolderOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { DragEvent, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_TOOLTIP_TRIGGER_HOVER_AND_LONG_PRESS,
} from '../../../utils/antd.constants';
import { ARROW_DOWN_KEY, ARROW_UP_KEY } from '../../../utils/browser/browser.events.constants';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { LAYER_MODE_LABEL_KEY } from '../../../utils/layers/layer.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { LayerModeIcon } from '../../../views/LayerModeIcon';
import { LayerSwatch } from '../../../views/LayerSwatch';
import { LayerValueCells } from '../../../views/LayerValueCells';
import type { LayerHandlePointerDragHandlers } from '../interfaces/LayerHandlePointerDragHandlers';
import type { LayerRowProps } from '../interfaces/LayerRowProps';
import { LAYER_ROW_KEY_ATTRIBUTE } from '../layers.section.constants';
import styles from './styles.module.scss';
import { useLayerHandlePointerDrag } from './use.layer.handle.pointer.drag';

const allowDropOnRow = (dragEvent: DragEvent<HTMLLIElement>): void => {
  dragEvent.preventDefault();
};

export const LayerRow = ({
  layer,
  layerKey,
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
  onPointerDragOver,
}: LayerRowProps): ReactNode => {
  const { t } = useTranslation();
  const hasNoPaletteEntry: boolean = !layerEntry;
  const layerName: string = getLayerDisplayName(layer, layerEntry);
  // A colour with no palette entry also shows its hex code on hover.
  const layerNameTitle: string = hasNoPaletteEntry ? `${layerName} ${layer.colour}` : layerName;
  const { settings } = layer;
  const handleLabelText: string = t(DEFAULT.LAYERS_REORDER_HANDLE, { name: layerName });
  const handlePointerDrag: LayerHandlePointerDragHandlers = useLayerHandlePointerDrag(layerKey, onPointerDragOver);

  // The handle is the keyboard path of the drag: the up and down arrow keys move the layer one place.
  const handleHandleKeyDown = (keyEvent: KeyboardEvent<HTMLButtonElement>): void => {
    if (keyEvent.key === ARROW_UP_KEY && !isFirst) {
      keyEvent.preventDefault();
      onMoveUp();
    } else if (keyEvent.key === ARROW_DOWN_KEY && !isLast) {
      keyEvent.preventDefault();
      onMoveDown();
    }
  };

  return (
    <li
      className={isOpen ? [styles.row, styles.openRow].join(' ') : styles.row}
      {...{ [LAYER_ROW_KEY_ATTRIBUTE]: layerKey }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={allowDropOnRow}
      onDrop={onDrop}
    >
      <Tooltip title={t(DEFAULT.LAYERS_DRAG_HINT)}>
        <Button
          className={styles.handle}
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<HolderOutlined />}
          aria-label={handleLabelText}
          onKeyDown={handleHandleKeyDown}
          {...handlePointerDrag}
        />
      </Tooltip>
      <Tooltip title={t(DEFAULT.LAYERS_TOGGLE, { name: layerName })}>
        {/* Still a real checkbox for the keyboard and for screen readers; only its look is an eye, open while sent. */}
        <Checkbox
          className={styles.sendToggle}
          checked={layer.enabled}
          aria-label={t(DEFAULT.LAYERS_TOGGLE, { name: layerName })}
          onChange={(changeEvent: CheckboxChangeEvent) => onToggle(changeEvent.target.checked)}
        >
          <span className={styles.sendToggleFace} aria-hidden>
            {layer.enabled ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </span>
        </Checkbox>
      </Tooltip>
      <Button
        ref={openButtonRef}
        className={styles.openButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-expanded={isOpen}
        onClick={onOpen}
      >
        <Tooltip title={t(DEFAULT.LAYERS_COLOUR_HINT)}>
          <span className={styles.swatch}>
            <LayerSwatch colour={layer.colour} isShading={layer.isShading} />
          </span>
        </Tooltip>
        {/* The row button's name already says the mode through the value summary; a long press shows it on touch. */}
        <Tooltip title={t(LAYER_MODE_LABEL_KEY[settings.mode])} trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_LONG_PRESS}>
          <span className={styles.modeIcon} aria-hidden>
            <LayerModeIcon mode={settings.mode} />
          </span>
        </Tooltip>
        <span className={styles.name} title={layerNameTitle}>{layerName}</span>
        {hasNoPaletteEntry && (
          <Tooltip title={t(DEFAULT.LAYERS_NOT_IN_PALETTE)}>
            <InfoCircleOutlined className={styles.note} aria-label={t(DEFAULT.LAYERS_NOT_IN_PALETTE)} />
          </Tooltip>
        )}
        <LayerValueCells className={styles.summary} settings={settings} />
      </Button>
    </li>
  );
};
