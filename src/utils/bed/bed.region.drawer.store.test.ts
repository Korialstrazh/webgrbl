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
});
