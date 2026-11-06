import { afterEach, describe, expect, it, vi } from 'vitest';
import { ESC_STOP_PREFERENCE_REPOSITORY } from '../project/esc.stop.preference.repository';
import { APP_STATE_KEY } from '../project/project.database.constants';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { watchAppPreferences } from './app.preferences.saga';
import { EscStopPreferenceChanged, selectIsEscStoppingWithOverlayOpen } from './app.preferences.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

const INVALID_STORED_TEXT = JSON.stringify('yes');

describe(watchAppPreferences.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await WEBGRBL_DATABASE.appState.delete(APP_STATE_KEY.ESC_STOPS_WITH_OVERLAY_OPEN);
  });

  it('starts with Esc stopping only when nothing is open', () => {
    expect(selectIsEscStoppingWithOverlayOpen(newStore().getState())).toBe(false);
  });

  it('restores the stored choice at start', async () => {
    await ESC_STOP_PREFERENCE_REPOSITORY.setEscStopsWithOverlayOpen(true);
    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectIsEscStoppingWithOverlayOpen(store.getState())).toBe(true);
    });
  });

  it('reads a stored value that is not a boolean as nothing', async () => {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.ESC_STOPS_WITH_OVERLAY_OPEN, value: INVALID_STORED_TEXT });

    expect(await ESC_STOP_PREFERENCE_REPOSITORY.getEscStopsWithOverlayOpen()).toBeUndefined();
  });

  it('stores the choice when the user changes it', async () => {
    vi.spyOn(ESC_STOP_PREFERENCE_REPOSITORY, 'getEscStopsWithOverlayOpen').mockResolvedValue(undefined);
    const writeSpy = vi.spyOn(ESC_STOP_PREFERENCE_REPOSITORY, 'setEscStopsWithOverlayOpen');
    const store: AppStore = newStore();

    store.dispatch(new EscStopPreferenceChanged({ isEscStoppingWithOverlayOpen: true }));

    await vi.waitFor((): void => {
      expect(writeSpy).toHaveBeenCalledWith(true);
    });
    expect(selectIsEscStoppingWithOverlayOpen(store.getState())).toBe(true);
  });
});
