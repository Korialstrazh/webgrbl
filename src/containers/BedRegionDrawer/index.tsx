/**
 * An antd Drawer rendered into the bed region, with a clear mask over the bed only, so the machine panel and STOP stay
 * visible and clickable and the bed stays in view; a click on the bed still closes the drawer. It registers as an open
 * overlay while shown, so Escape closes it instead of stopping the machine. While a left drawer is open it sets its
 * width on the host, so on a wide window the bed moves aside instead of being covered, and tells the bed view so it
 * fits the whole bed into the strip left. Features open drawers only through this wrapper, never through a raw antd
 * Drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Drawer } from 'antd';
import { useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BED_REGION_DRAWER_INSET_PROPERTY } from '../../utils/bed/bed.region.drawer.constants';
import { BED_REGION_DRAWER_STORE } from '../../utils/bed/bed.region.drawer.store';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { getBedRegionDrawerInset } from '../../utils/bed/get.bed.region.drawer.inset';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { OVERLAY_KIND } from '../../utils/states/overlay.kind.constants';
import type { BedRegionDrawerProps } from './interfaces/BedRegionDrawerProps';
import styles from './styles.module.scss';

export const BedRegionDrawer = (props: BedRegionDrawerProps): ReactNode => {
  const { isOpen, overlayIdPrefix, onClose, ...drawerProps } = props;
  const bedRegionHost: HTMLElement | null = useContext(BedRegionHostContext);
  // Without the bed region the drawer would fall back to the whole window, over STOP, so it waits for the region.
  const isShown: boolean = isOpen && Boolean(bedRegionHost);

  const insetValue: string | undefined = getBedRegionDrawerInset(drawerProps.placement, drawerProps.size);

  useOverlayRegistration(overlayIdPrefix, isShown, OVERLAY_KIND.DIALOG);

  useEffect(() => {
    if (!bedRegionHost || !isShown || !insetValue) {
      return undefined;
    }

    const closeStoredDrawer: () => void = BED_REGION_DRAWER_STORE.openBedRegionDrawer();

    bedRegionHost.style.setProperty(BED_REGION_DRAWER_INSET_PROPERTY, insetValue);

    return (): void => {
      bedRegionHost.style.removeProperty(BED_REGION_DRAWER_INSET_PROPERTY);
      closeStoredDrawer();
    };
  }, [bedRegionHost, isShown, insetValue]);

  if (!bedRegionHost) {
    return null;
  }

  return (
    <Drawer
      {...drawerProps}
      open={isShown}
      // A drawer opened from inside another one must not push that one aside: it would leave the region, over the
      // design panel, and come back when the inner drawer closes.
      push={false}
      getContainer={bedRegionHost}
      rootClassName={styles.bedRegionDrawer}
      classNames={{ mask: styles.transparentMask, section: styles.drawerSection }}
      onClose={onClose}
    />
  );
};
