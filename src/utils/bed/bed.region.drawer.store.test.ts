import { BED_REGION_DRAWER_STORE } from './bed.region.drawer.store';

describe('BED_REGION_DRAWER_STORE', () => {
  it('stays open until the last pushing drawer closes and tells its readers each time', () => {
    const listener = vi.fn();
    const unsubscribe: () => void = BED_REGION_DRAWER_STORE.subscribeToBedRegionDrawers(listener);
    const closeFirst: () => void = BED_REGION_DRAWER_STORE.openBedRegionDrawer();
    const closeSecond: () => void = BED_REGION_DRAWER_STORE.openBedRegionDrawer();

    closeFirst();

    expect(BED_REGION_DRAWER_STORE.isBedRegionDrawerOpen()).toBe(true);

    closeSecond();

    expect(BED_REGION_DRAWER_STORE.isBedRegionDrawerOpen()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(4);
    unsubscribe();
  });

  it('gives the width of the open drawer, and 0 once it closes', () => {
    const closeDrawer: () => void = BED_REGION_DRAWER_STORE.openBedRegionDrawer(336);

    expect(BED_REGION_DRAWER_STORE.getBedRegionDrawerInsetPx()).toBe(336);

    closeDrawer();

    expect(BED_REGION_DRAWER_STORE.getBedRegionDrawerInsetPx()).toBe(0);
  });
});
