/**
 * The icon buttons of one element tree node: skip or burn again, pick a palette colour, delete.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BgColorsOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../../../utils/antd.constants';
import { useOverlayRegistration } from '../../../../utils/hooks/use.overlay.registration';
import { usePopoverFocusReturn } from '../../../../utils/hooks/use.popover.focus.return';
import { DEFAULT } from '../../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';
import type { Palette } from '../../../../utils/palette/interfaces/Palette';
import { selectPalette } from '../../../../utils/states/palette.state';
import { IconActionButton } from '../../../../views/IconActionButton';
import { LayerSwatch } from '../../../../views/LayerSwatch';
import type { ElementNodeActionsProps } from '../interfaces/ElementNodeActionsProps';
import styles from '../styles.module.scss';

const RECOLOUR_POPOVER_OVERLAY_ID = 'element-recolour';

// The buttons sit inside a tree row: a press must not also select the row.
const stopRowSelect = (mouseEvent: MouseEvent): void => {
  mouseEvent.stopPropagation();
};

export const ElementNodeActions = (props: ElementNodeActionsProps): ReactNode => {
  const { node, onDisabledChange, onDelete, onRecolour } = props;
  const { t } = useTranslation();
  const palette: Palette = useSelector(selectPalette);
  const isSkipped: boolean = node.isDisabled;
  const [isRecolourOpen, setIsRecolourOpen] = useState<boolean>(false);

  usePopoverFocusReturn(isRecolourOpen);

  // Escape must only close the colour list, not also stop the machine.
  useOverlayRegistration(RECOLOUR_POPOVER_OVERLAY_ID, isRecolourOpen);

  const colourListComponent: ReactNode = (
    <div className={styles.colourList}>
      {palette.entries.map((entry: PaletteEntry) => (
        <Button
          key={entry.id}
          type={ANTD_BUTTON_TYPE_TEXT}
          className={styles.colourButton}
          aria-label={t(DEFAULT.OBJECTS_TREE_RECOLOUR_TO, { entry: entry.name })}
          title={entry.name}
          onClick={() => onRecolour(node.path, entry.colour)}
        >
          <span className={styles.colourSwatch}><LayerSwatch colour={entry.colour} isShading={false} /></span>
        </Button>
      ))}
    </div>
  );

  return (
    <span className={styles.actions} onClick={stopRowSelect}>
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={t(isSkipped ? DEFAULT.OBJECTS_TREE_TURN_ON : DEFAULT.OBJECTS_TREE_TURN_OFF, { name: node.name })}
        iconComponent={isSkipped ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        aria-pressed={isSkipped}
        onClick={() => onDisabledChange(node.path, !isSkipped)}
      />
      <Popover
        content={colourListComponent}
        trigger={ANTD_POPOVER_TRIGGER_CLICK}
        placement={ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT}
        open={isRecolourOpen}
        onOpenChange={setIsRecolourOpen}
      >
        <IconActionButton
          type={ANTD_BUTTON_TYPE_TEXT}
          size={ANTD_BUTTON_SIZE_SMALL}
          labelText={t(DEFAULT.OBJECTS_TREE_RECOLOUR, { name: node.name })}
          iconComponent={<BgColorsOutlined />}
        />
      </Popover>
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={t(DEFAULT.OBJECTS_TREE_DELETE, { name: node.name })}
        iconComponent={<DeleteOutlined />}
        onClick={() => onDelete(node.path)}
      />
    </span>
  );
};
