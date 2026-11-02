/**
 * Keeps the workbench panel sizes in step with storage: reads them at start, so the workbench can open with them,
 * and stores the sizes after every resize. A failed read opens the workbench with the default sizes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, takeLatest } from 'redux-saga/effects';
import { logPanelSizesStorageError } from '../layout/log.panel.sizes.storage.error';
import { PANEL_SIZES_REPOSITORY } from '../project/panel.sizes.repository';
import { PanelSizesLoaded, PanelSizesResized } from './panel.layout.state';

function* loadPanelSizes(): Generator {
  try {
    const storedPanelSizePercents: number[] | undefined = (yield call(
      [PANEL_SIZES_REPOSITORY, PANEL_SIZES_REPOSITORY.getPanelSizePercents],
    )) as number[] | undefined;

    yield put(new PanelSizesLoaded({ panelSizePercents: storedPanelSizePercents }));
  } catch (error: unknown) {
    logPanelSizesStorageError(error);
    yield put(new PanelSizesLoaded({ panelSizePercents: undefined }));
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

export function* watchPanelLayout(): Generator {
  yield call(loadPanelSizes);
  yield takeLatest(PanelSizesResized.type, storePanelSizes);
}
