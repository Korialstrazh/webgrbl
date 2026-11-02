/**
 * The layer settings drawer: shows the settings of one layer. It stays closed while no layer is given.
 *
 * The layer rows that open it sit in the design panel on the left, so it slides in from the left edge of the bed
 * region, which is the right edge of the design panel: it never covers the layer list, and it follows that edge when
 * the user resizes the panels. In a narrow window the bed region is below the design panel, and the drawer is never
 * wider than it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_DRAWER_PLACEMENT_LEFT } from '../../utils/antd.constants';
import { getLayerDisplayName } from '../../utils/layers/get.layer.display.name';
import { getLayerPaletteEntry } from '../../utils/layers/get.layer.palette.entry';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { BedRegionDrawer } from '../BedRegionDrawer';
import type { LayerSettingsDrawerProps } from './interfaces/LayerSettingsDrawerProps';
import { LayerSettingsFields } from './LayerSettingsFields';
import { LAYER_SETTINGS_DRAWER_OVERLAY_ID, LAYER_SETTINGS_DRAWER_WIDTH } from './layer.settings.drawer.constants';

export const LayerSettingsDrawer = ({ layer, onClose, onEditPalette }: LayerSettingsDrawerProps): ReactNode => {
  const { t } = useTranslation();
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const title: string = layer
    ? t(DEFAULT.LAYER_SETTINGS_TITLE, { name: getLayerDisplayName(layer, getLayerPaletteEntry(layer, paletteEntries)) })
    : '';

  return (
    <BedRegionDrawer
      isOpen={Boolean(layer)}
      overlayIdPrefix={LAYER_SETTINGS_DRAWER_OVERLAY_ID}
      title={title}
      placement={ANTD_DRAWER_PLACEMENT_LEFT}
      size={LAYER_SETTINGS_DRAWER_WIDTH}
      onClose={onClose}
    >
      {layer && <LayerSettingsFields layer={layer} onEditPalette={onEditPalette} />}
    </BedRegionDrawer>
  );
};
