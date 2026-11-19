/**
 * Counts the left drawers that are open in the bed region and push the bed aside, so the bed view can fit the whole
 * bed into the strip that is left and go back to its previous zoom once the last one closes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
class BedRegionDrawerStore {
  // How many pushing drawers are open now.
  private openDrawerCount = 0;

  // The width in CSS pixels of the drawer opened last.
  private insetPx = 0;

  // The readers to tell when a drawer opens or closes.
  private readonly listeners: Set<() => void> = new Set<() => void>();

  public subscribeToBedRegionDrawers = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public isBedRegionDrawerOpen = (): boolean => this.openDrawerCount > 0;

  /** The width of the open drawer in CSS pixels, 0 while none is open. */
  public getBedRegionDrawerInsetPx = (): number => (this.openDrawerCount > 0 ? this.insetPx : 0);

  /** Marks one pushing drawer of the given width as open and gives the step that marks it closed again. */
  public openBedRegionDrawer(insetPx = 0): () => void {
    this.insetPx = insetPx;
    this.openDrawerCount++;
    this.notifyListeners();

    return () => {
      this.openDrawerCount--;
      this.notifyListeners();
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const BED_REGION_DRAWER_STORE: BedRegionDrawerStore = new BedRegionDrawerStore();
