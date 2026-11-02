/**
 * Keeps the workbench panel sizes in step with storage: reads the column widths and the console height at start, so
 * the workbench can open with them, and stores them after every resize. A read that fails, or neither finishes nor
 * fails within PANEL_SIZES_READ_TIMEOUT_MS, opens the workbench with the default sizes, so the panels always appear.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, delay, put, race, select, takeLatest } from 'redux-saga/effects';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { logPanelSizesStorageError } from '../layout/log.panel.sizes.storage.error';
import { PANEL_SIZES_REPOSITORY } from '../project/panel.sizes.repository';
import type { PanelSizesReadRace } from './interfaces/PanelSizesReadRace';
import type { StoredPanelSizesPayload } from './interfaces/StoredPanelSizesPayload';
import {
  ConsoleSizeResized,
  PanelSizesLoaded,
  PanelSizesResized,
  selectConsoleSizePercent,
  selectPanelSizePercents,
} from './panel.layout.state';

const DEFAULT_STORED_PANEL_SIZES: StoredPanelSizesPayload = {
  panelSizePercents: undefined,
  consoleSizePercent: undefined,
};

const readStoredPanelSizes = async (): Promise<StoredPanelSizesPayload> => {
  const [panelSizePercents, consoleSizePercent] = await Promise.all([
    PANEL_SIZES_REPOSITORY.getPanelSizePercents(),
    PANEL_SIZES_REPOSITORY.getConsoleSizePercent(),
  ]);

  return { panelSizePercents, consoleSizePercent };
};

/**
 * The loaded sizes, except a size the user already set while the read was running: a resize before the read ends wins
 * over the stored value, so a late read never undoes it. Nothing is set before the load, so a defined size is a resize.
 */
function* putLoadedPanelSizes(storedPanelSizes: StoredPanelSizesPayload): Generator {
  const resizedPanelPercents: number[] | undefined = (yield select(selectPanelSizePercents)) as number[] | undefined;
  const resizedConsolePercent: number | undefined = (yield select(selectConsoleSizePercent)) as number | undefined;

  yield put(new PanelSizesLoaded({
    panelSizePercents: resizedPanelPercents ?? storedPanelSizes.panelSizePercents,
    consoleSizePercent: resizedConsolePercent ?? storedPanelSizes.consoleSizePercent,
  }));
}

function* loadPanelSizes(): Generator {
  try {
    const readRace: PanelSizesReadRace = yield race({
      storedPanelSizes: call(readStoredPanelSizes),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
    });

    yield call(putLoadedPanelSizes, readRace.storedPanelSizes ?? DEFAULT_STORED_PANEL_SIZES);
  } catch (error: unknown) {
    logPanelSizesStorageError(error);
    yield call(putLoadedPanelSizes, DEFAULT_STORED_PANEL_SIZES);
  }
}

function* storePanelSizes(action: PanelSizesResized): Generator {
  try {
    yield call(
      [PANEL_SIZES_REPOSITORY, PANEL_SIZES_REPOSITORY.setPanelSizePercents],
      action.payload.panelSizePercents,
    );
  } catch (error: unknown) {
    logPanelSizesStorageError(error);
  }
}

function* storeConsoleSize(action: ConsoleSizeResized): Generator {
  try {
    yield call(
      [PANEL_SIZES_REPOSITORY, PANEL_SIZES_REPOSITORY.setConsoleSizePercent],
      action.payload.consoleSizePercent,
    );
  } catch (error: unknown) {
    logPanelSizesStorageError(error);
  }
}

/** The store watchers start first, so a resize made while the stored sizes load is stored too. */
export function* watchPanelLayout(): Generator {
  yield takeLatest(PanelSizesResized.type, storePanelSizes);
  yield takeLatest(ConsoleSizeResized.type, storeConsoleSize);
  yield call(loadPanelSizes);
}
