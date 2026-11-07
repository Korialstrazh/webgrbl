import { afterEach, describe, expect, it, vi } from 'vitest';
import { BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY } from '../project/bed.double.click.move.preference.repository';
import { ESC_STOP_PREFERENCE_REPOSITORY } from '../project/esc.stop.preference.repository';
import { APP_STATE_KEY } from '../project/project.database.constants';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { watchAppPreferences } from './app.preferences.saga';
import {
  BedDoubleClickMovePreferenceChanged,
  EscStopPreferenceChanged,
  selectIsBedDoubleClickMovingLaser,
  selectIsEscStoppingWithOverlayOpen,
} from './app.preferences.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

const INVALID_STORED_TEXT = JSON.stringify('yes');

describe(watchAppPreferences.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await WEBGRBL_DATABASE.appState.delete(APP_STATE_KEY.ESC_STOPS_WITH_OVERLAY_OPEN);
    await WEBGRBL_DATABASE.appState.delete(APP_STATE_KEY.BED_DOUBLE_CLICK_MOVES_LASER);
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

  it('starts with the bed double-click move off', () => {
    expect(selectIsBedDoubleClickMovingLaser(newStore().getState())).toBe(false);
  });

  it('restores the stored bed double-click move choice at start', async () => {
    await BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY.setBedDoubleClickMovesLaser(true);
    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectIsBedDoubleClickMovingLaser(store.getState())).toBe(true);
    });
  });

  it('reads a stored bed double-click move value that is not a boolean as nothing', async () => {
    await WEBGRBL_DATABASE.appState.put({
      key: APP_STATE_KEY.BED_DOUBLE_CLICK_MOVES_LASER,
      value: INVALID_STORED_TEXT,
    });

    expect(await BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY.getBedDoubleClickMovesLaser()).toBeUndefined();
  });

  it('stores the bed double-click move choice when the user changes it', async () => {
    vi.spyOn(BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY, 'getBedDoubleClickMovesLaser').mockResolvedValue(undefined);
    const writeSpy = vi.spyOn(BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY, 'setBedDoubleClickMovesLaser');
    const store: AppStore = newStore();

    store.dispatch(new BedDoubleClickMovePreferenceChanged({ isBedDoubleClickMovingLaser: true }));

    await vi.waitFor((): void => {
      expect(writeSpy).toHaveBeenCalledWith(true);
    });
    expect(selectIsBedDoubleClickMovingLaser(store.getState())).toBe(true);
  });
});
