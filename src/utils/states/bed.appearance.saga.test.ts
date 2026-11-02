import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BED_COLOUR } from '../bed/bed.colour.constants';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { BED_COLOUR_REPOSITORY } from '../project/bed.colour.repository';
import { APP_STATE_KEY } from '../project/project.database.constants';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { BedColourChanged, selectBedColour } from './bed.appearance.state';
import { watchBedAppearance } from './bed.appearance.saga';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

const STORED_BED_COLOUR = '#c8a27a';
const CHANGED_BED_COLOUR = '#3a3e43';
const LAST_CHANGED_BED_COLOUR = '#ffffff';
const INVALID_STORED_TEXT = JSON.stringify('not a colour');

/** A storage read that neither resolves nor rejects, like IndexedDB blocked by another tab. */
const getHangingRead = <TValue>(): Promise<TValue> => new Promise<TValue>(() => undefined);

describe(watchBedAppearance.name, () => {
  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await WEBGRBL_DATABASE.appState.delete(APP_STATE_KEY.BED_COLOUR);
  });

  it('restores the stored bed colour at start', async () => {
    await BED_COLOUR_REPOSITORY.setBedColour(STORED_BED_COLOUR);
    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectBedColour(store.getState())).toBe(STORED_BED_COLOUR);
    });
  });

  it('keeps the default colour when the stored value is not a colour', async () => {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.BED_COLOUR, value: INVALID_STORED_TEXT });

    expect(await BED_COLOUR_REPOSITORY.getBedColour()).toBeUndefined();
    expect(selectBedColour(newStore().getState())).toBe(DEFAULT_BED_COLOUR);
  });

  it('keeps the default colour when the read hangs past the timeout', async () => {
    vi.useFakeTimers();
    const readSpy = vi.spyOn(BED_COLOUR_REPOSITORY, 'getBedColour').mockImplementation(getHangingRead);
    const store: AppStore = newStore();

    await vi.advanceTimersByTimeAsync(PANEL_SIZES_READ_TIMEOUT_MS);

    expect(readSpy).toHaveBeenCalledTimes(1);
    expect(selectBedColour(store.getState())).toBe(DEFAULT_BED_COLOUR);

    store.dispatch(new BedColourChanged({ bedColour: CHANGED_BED_COLOUR }));

    expect(selectBedColour(store.getState())).toBe(CHANGED_BED_COLOUR);
  });

  it('stores only the last of several quick changes', async () => {
    const readSpy = vi.spyOn(BED_COLOUR_REPOSITORY, 'getBedColour').mockResolvedValue(undefined);
    const writeSpy = vi.spyOn(BED_COLOUR_REPOSITORY, 'setBedColour');
    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(readSpy).toHaveBeenCalledTimes(1);
    });
    // The load puts its result one task later; changes made after it are the ones that get stored.
    await new Promise<void>((resolve: () => void) => {
      setTimeout(resolve, 0);
    });

    store.dispatch(new BedColourChanged({ bedColour: CHANGED_BED_COLOUR }));
    store.dispatch(new BedColourChanged({ bedColour: LAST_CHANGED_BED_COLOUR }));

    await vi.waitFor((): void => {
      expect(writeSpy).toHaveBeenCalledWith(LAST_CHANGED_BED_COLOUR);
    });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(selectBedColour(store.getState())).toBe(LAST_CHANGED_BED_COLOUR);
  });
});
