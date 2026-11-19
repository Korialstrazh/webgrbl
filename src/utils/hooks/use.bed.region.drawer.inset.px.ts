/**
 * Gives the width in CSS pixels of the left drawer open in the bed region, 0 while none is open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useSyncExternalStore } from 'react';
import { BED_REGION_DRAWER_STORE } from '../bed/bed.region.drawer.store';

export const useBedRegionDrawerInsetPx = (): number =>
  useSyncExternalStore(
    BED_REGION_DRAWER_STORE.subscribeToBedRegionDrawers,
    BED_REGION_DRAWER_STORE.getBedRegionDrawerInsetPx,
  );
