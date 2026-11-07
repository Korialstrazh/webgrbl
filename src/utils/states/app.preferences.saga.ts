/**
 * Keeps the app preferences in step with storage: reads the Escape stop and the bed double-click move choices at start
 * and stores each whenever the user changes it. A read that fails, finds no valid value, or neither finishes nor fails
 * within the panel sizes read timeout keeps the default (off); a change the user makes before the read ends wins over
 * the stored value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { all, call, delay, put, race, take, takeLatest } from 'redux-saga/effects';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY } from '../project/bed.double.click.move.preference.repository';
import { ESC_STOP_PREFERENCE_REPOSITORY } from '../project/esc.stop.preference.repository';
import {
  BedDoubleClickMovePreferenceChanged,
  BedDoubleClickMovePreferenceLoaded,
  DEFAULT_BED_DOUBLE_CLICK_MOVES_LASER,
  DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN,
  EscStopPreferenceChanged,
  EscStopPreferenceLoaded,
} from './app.preferences.state';
import type { BedDoubleClickMovePreferenceReadRace } from './interfaces/BedDoubleClickMovePreferenceReadRace';
import type { EscStopPreferenceReadRace } from './interfaces/EscStopPreferenceReadRace';

const APP_PREFERENCES_STORAGE_ERROR_LOG_MESSAGE = 'Reading or storing the app preferences failed';

const logAppPreferencesStorageError = (error: unknown): void => {
  // eslint-disable-next-line no-console -- no toast is shown for this, so the log is the only place to see it
  console.error(APP_PREFERENCES_STORAGE_ERROR_LOG_MESSAGE, error);
};

function* loadEscStopPreference(): Generator {
  try {
    const readRace: EscStopPreferenceReadRace = yield race({
      storedPreference: call([
        ESC_STOP_PREFERENCE_REPOSITORY,
        ESC_STOP_PREFERENCE_REPOSITORY.getEscStopsWithOverlayOpen,
      ]),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
      changedByUser: take(EscStopPreferenceChanged.type),
    });

    // A choice the user made while the read was running is newer than the stored one.
    if (readRace.changedByUser) {
      return;
    }

    yield put(new EscStopPreferenceLoaded({
      isEscStoppingWithOverlayOpen: readRace.storedPreference ?? DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN,
    }));
  } catch (error: unknown) {
    logAppPreferencesStorageError(error);
  }
}

function* storeEscStopPreference(action: EscStopPreferenceChanged): Generator {
  try {
    yield call(
      [ESC_STOP_PREFERENCE_REPOSITORY, ESC_STOP_PREFERENCE_REPOSITORY.setEscStopsWithOverlayOpen],
      action.payload.isEscStoppingWithOverlayOpen,
    );
  } catch (error: unknown) {
    logAppPreferencesStorageError(error);
  }
}

function* loadBedDoubleClickMovePreference(): Generator {
  try {
    const readRace: BedDoubleClickMovePreferenceReadRace = yield race({
      storedPreference: call([
        BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY,
        BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY.getBedDoubleClickMovesLaser,
      ]),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
      changedByUser: take(BedDoubleClickMovePreferenceChanged.type),
    });

    if (readRace.changedByUser) {
      return;
    }

    yield put(new BedDoubleClickMovePreferenceLoaded({
      isBedDoubleClickMovingLaser: readRace.storedPreference ?? DEFAULT_BED_DOUBLE_CLICK_MOVES_LASER,
    }));
  } catch (error: unknown) {
    logAppPreferencesStorageError(error);
  }
}

function* storeBedDoubleClickMovePreference(action: BedDoubleClickMovePreferenceChanged): Generator {
  try {
    yield call(
      [
        BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY,
        BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY.setBedDoubleClickMovesLaser,
      ],
      action.payload.isBedDoubleClickMovingLaser,
    );
  } catch (error: unknown) {
    logAppPreferencesStorageError(error);
  }
}

export function* watchAppPreferences(): Generator {
  yield takeLatest(EscStopPreferenceChanged.type, storeEscStopPreference);
  yield takeLatest(BedDoubleClickMovePreferenceChanged.type, storeBedDoubleClickMovePreference);
  yield all([call(loadEscStopPreference), call(loadBedDoubleClickMovePreference)]);
}
