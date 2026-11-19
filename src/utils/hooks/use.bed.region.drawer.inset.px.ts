/**
 * Gives the width in CSS pixels of the left drawer open in the bed region, 0 while none is open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useSyncExternalStore } from 'react';
import { BED_REGION_DRAWER_STORE } from '../bed/bed.region.drawer.store';

export const useBedRegionDrawerInsetPx = (): number =>
  useSyncExternalStore(
    BED_REGION_DRAWER_STORE.subscribeToBedRegionDrawers,
    BED_REGION_DRAWER_STORE.getBedRegionDrawerInsetPx,
  );
