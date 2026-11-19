/**
 * Whether a left drawer that pushes the bed aside is open in the bed region; the bed view re-renders when one opens or
 * the last one closes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useSyncExternalStore } from 'react';
import { BED_REGION_DRAWER_STORE } from '../bed/bed.region.drawer.store';

export const useIsBedRegionDrawerOpen = (): boolean =>
  useSyncExternalStore(
    BED_REGION_DRAWER_STORE.subscribeToBedRegionDrawers,
    BED_REGION_DRAWER_STORE.isBedRegionDrawerOpen,
  );
