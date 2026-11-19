/**
 * Props of BedRegionDrawer: the antd Drawer props it passes on, without the ones that place it, plus its open
 * state, its overlay registry prefix and its close callback.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DrawerProps } from 'antd';

/** The Drawer props that place the drawer and its mask; BedRegionDrawer sets them so the drawer stays in the bed. */
type BedRegionDrawerPlacementPropName = 'getContainer' | 'rootClassName' | 'open' | 'onClose' | 'zIndex';

export interface BedRegionDrawerProps extends Omit<DrawerProps, BedRegionDrawerPlacementPropName> {
  /** Whether the drawer is shown. */
  isOpen: boolean;
  /** Prefix of the id the drawer registers in the overlay registry while open. */
  overlayIdPrefix: string;
  /** Called on Escape, the close button and a click on the mask. */
  onClose: () => void;
}
