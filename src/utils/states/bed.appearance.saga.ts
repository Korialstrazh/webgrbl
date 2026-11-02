/**
 * Keeps the bed colour in step with storage: reads it at start and stores it after the user changes it, once the
 * changes pause. A read that fails, finds no valid colour, or neither finishes nor fails within the panel sizes read
 * timeout keeps the default colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, debounce, delay, put, race } from 'redux-saga/effects';
import { BED_COLOUR_STORE_DEBOUNCE_MS, DEFAULT_BED_COLOUR } from '../bed/bed.colour.constants';
import { logBedColourStorageError } from '../bed/log.bed.colour.storage.error';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { BED_COLOUR_REPOSITORY } from '../project/bed.colour.repository';
import { BedColourChanged, BedColourLoaded } from './bed.appearance.state';
import type { BedColourReadRace } from './interfaces/BedColourReadRace';

function* loadBedColour(): Generator {
  try {
    const readRace: BedColourReadRace = yield race({
      storedBedColour: call([BED_COLOUR_REPOSITORY, BED_COLOUR_REPOSITORY.getBedColour]),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
    });

    yield put(new BedColourLoaded({ bedColour: readRace.storedBedColour ?? DEFAULT_BED_COLOUR }));
  } catch (error: unknown) {
    logBedColourStorageError(error);
    yield put(new BedColourLoaded({ bedColour: DEFAULT_BED_COLOUR }));
  }
}

function* storeBedColour(action: BedColourChanged): Generator {
  try {
    yield call([BED_COLOUR_REPOSITORY, BED_COLOUR_REPOSITORY.setBedColour], action.payload.bedColour);
  } catch (error: unknown) {
    logBedColourStorageError(error);
  }
}

export function* watchBedAppearance(): Generator {
  yield call(loadBedColour);
  yield debounce(BED_COLOUR_STORE_DEBOUNCE_MS, BedColourChanged.type, storeBedColour);
}
