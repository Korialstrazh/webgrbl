/**
 * Keeps the palette in step with storage: loads it at start, stores every change, and downloads it as an Inkscape
 * palette on request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { downloadTextFile } from '../browser/download.text.file';
import { getInkscapePaletteText } from '../palette/get.inkscape.palette.text';
import type { Palette } from '../palette/interfaces/Palette';
import { PALETTE_EXPORT_FILE_NAME, PALETTE_EXPORT_MIME_TYPE } from '../palette/palette.constants';
import { PALETTE_STORAGE } from '../palette/palette.storage';
import {
  PaletteEntriesReordered,
  PaletteEntryDeleted,
  PaletteEntrySaved,
  PaletteExportRequested,
  PaletteLoaded,
  PaletteResetRequested,
  selectPalette,
} from './palette.state';

/** Actions after which the palette differs from the stored one. */
const PALETTE_CHANGE_ACTION_TYPES: string[] = [
  PaletteEntrySaved.type,
  PaletteEntryDeleted.type,
  PaletteEntriesReordered.type,
  PaletteResetRequested.type,
];

function* storePalette(): Generator {
  const palette: Palette = (yield select(selectPalette)) as Palette;

  yield call([PALETTE_STORAGE, PALETTE_STORAGE.storePalette], palette);
}

function* exportPalette(): Generator {
  const palette: Palette = (yield select(selectPalette)) as Palette;

  yield call(downloadTextFile, {
    text: getInkscapePaletteText(palette),
    fileName: PALETTE_EXPORT_FILE_NAME,
    mimeType: PALETTE_EXPORT_MIME_TYPE,
  });
}

export function* watchPalette(): Generator {
  const storedPalette: Palette = (yield call([PALETTE_STORAGE, PALETTE_STORAGE.getStoredPalette])) as Palette;

  yield put(new PaletteLoaded({ palette: storedPalette }));
  yield takeEvery(PALETTE_CHANGE_ACTION_TYPES, storePalette);
  yield takeEvery(PaletteExportRequested.type, exportPalette);
}
