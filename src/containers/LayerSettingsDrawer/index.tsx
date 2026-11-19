/**
 * The layer settings drawer: shows the settings of one layer. It stays closed while no layer is given.
 *
 * The layer rows that open it sit in the design panel on the left, so it slides in from the left edge of the bed
 * region, which is the right edge of the design panel: it never covers the layer list, and it follows that edge when
 * the user resizes the panels. In a narrow window the bed region is below the design panel, and the drawer is never
 * wider than it. When it closes the focus goes back to the layer row that opened it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import type { DrawerProps } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_DRAWER_PLACEMENT_LEFT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../utils/antd.constants';
import { getLayerDisplayName } from '../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../utils/layers/get.layer.palette.entry';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { DismissibleTooltip } from '../../views/DismissibleTooltip';
import { LayerSwatch } from '../../views/LayerSwatch';
import { BedRegionDrawer } from '../BedRegionDrawer';
import type { LayerSettingsDrawerProps } from './interfaces/LayerSettingsDrawerProps';
import { LayerSettingsFields } from './LayerSettingsFields';
import { LAYER_SETTINGS_DRAWER_OVERLAY_ID, LAYER_SETTINGS_DRAWER_WIDTH } from './layer.settings.drawer.constants';
import styles from './styles.module.scss';

// The layer row takes the focus back itself once the drawer has closed, so antd does not move it as well.
const LAYER_SETTINGS_DRAWER_FOCUS: DrawerProps['focusable'] = { focusTriggerAfterClose: false };

export const LayerSettingsDrawer = (props: LayerSettingsDrawerProps): ReactNode => {
  const { layer, onClose, onEditPalette } = props;
  const { t } = useTranslation();
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const layerName: string = layer ? getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries)) : '';
  // The layer's colour chip and name, like the other drawers' plain titles; "Layer settings" stays for screen readers.
  // A long name keeps one line and is cut short instead of wrapping.
  const titleComponent: ReactNode = layer && (
    <span className={styles.title}>
      <span className={styles.swatch}><LayerSwatch colour={layer.colour} isShading={layer.isShading} /></span>
      <span className={styles.overline}>{t(DEFAULT.LAYER_SETTINGS_OVERLINE)}</span>
      <span className={styles.layerName} title={layerName}>{layerName}</span>
    </span>
  );

  return (
    <BedRegionDrawer
      isOpen={Boolean(layer)}
      overlayIdPrefix={LAYER_SETTINGS_DRAWER_OVERLAY_ID}
      title={titleComponent}
      placement={ANTD_DRAWER_PLACEMENT_LEFT}
      size={LAYER_SETTINGS_DRAWER_WIDTH}
      focusable={LAYER_SETTINGS_DRAWER_FOCUS}
      extra={(
        <DismissibleTooltip title={t(DEFAULT.LAYER_SETTINGS_HELP_LABEL)}>
          <Popover
            trigger={ANTD_POPOVER_TRIGGER_CLICK}
            content={<p className={styles.help}>{t(DEFAULT.LAYER_SETTINGS_HELP)}</p>}
          >
            <Button
              type={ANTD_BUTTON_TYPE_TEXT}
              icon={<QuestionCircleOutlined />}
              aria-label={t(DEFAULT.LAYER_SETTINGS_HELP_LABEL)}
            />
          </Popover>
        </DismissibleTooltip>
      )}
      onClose={onClose}
    >
      {layer && <LayerSettingsFields key={getLayerKey(layer)} layer={layer} onEditPalette={onEditPalette} />}
    </BedRegionDrawer>
  );
};
