/**
 * An antd Drawer rendered into the bed region, with a clear mask over the bed only, so the machine panel and STOP stay
 * visible and clickable and the bed stays in view; a click on the bed still closes the drawer. It registers as an open
 * overlay while shown, so Escape closes it instead of stopping the machine. Features open drawers only through this
 * wrapper, never through a raw antd Drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Drawer } from 'antd';
import { useContext } from 'react';
import type { ReactNode } from 'react';
import { BedRegionHostContext } from '../../utils/bed/bed.region.host.context';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import type { BedRegionDrawerProps } from './interfaces/BedRegionDrawerProps';
import styles from './styles.module.scss';

export const BedRegionDrawer = (props: BedRegionDrawerProps): ReactNode => {
  const { isOpen, overlayIdPrefix, onClose, ...drawerProps } = props;
  const bedRegionHost: HTMLElement | null = useContext(BedRegionHostContext);
  // Without the bed region the drawer would fall back to the whole window, over STOP, so it waits for the region.
  const isShown: boolean = isOpen && Boolean(bedRegionHost);

  useOverlayRegistration(overlayIdPrefix, isShown);

  if (!bedRegionHost) {
    return null;
  }

  return (
    <Drawer
      {...drawerProps}
      open={isShown}
      getContainer={bedRegionHost}
      rootClassName={styles.bedRegionDrawer}
      classNames={{ mask: styles.transparentMask, section: styles.drawerSection }}
      onClose={onClose}
    />
  );
};
