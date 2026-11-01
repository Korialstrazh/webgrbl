/**
 * The laser palette: the named colours with their laser settings, used to derive the project layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Palette } from '../palette/interfaces/Palette';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { DEFAULT_PALETTE, SHADING_ENTRY_ID } from '../palette/palette.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { PaletteEntryIdPayload } from './interfaces/PaletteEntryIdPayload';
import type { PaletteEntryIdsPayload } from './interfaces/PaletteEntryIdsPayload';
import type { PaletteEntrySavedPayload } from './interfaces/PaletteEntrySavedPayload';
import type { PalettePayload } from './interfaces/PalettePayload';

// #region State
export interface PaletteState {
  /** The current palette, in the shape it is stored in. */
  palette: Palette;
}
// #endregion

// #region State name
export const PALETTE_STATE_NAME = 'palette';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(PALETTE_STATE_NAME);
// #endregion

// #region Actions
export class PaletteLoaded extends Action<PalettePayload> {
  public static readonly type: string = actionType('palette loaded');
}

export class PaletteEntrySaved extends Action<PaletteEntrySavedPayload> {
  public static readonly type: string = actionType('palette entry saved');
}

export class PaletteEntryDeleted extends Action<PaletteEntryIdPayload> {
  public static readonly type: string = actionType('palette entry deleted');
}

export class PaletteEntriesReordered extends Action<PaletteEntryIdsPayload> {
  public static readonly type: string = actionType('palette entries reordered');
}

export class PaletteResetRequested extends Action<void> {
  public static readonly type: string = actionType('palette reset requested');
}

export class PaletteExportRequested extends Action<void> {
  public static readonly type: string = actionType('palette export requested');
}
// #endregion

// #region Initial state
const INITIAL_PALETTE_STATE: PaletteState = { palette: DEFAULT_PALETTE };
// #endregion

// #region Reducer
const hasEntryWithId = (palette: Palette, entryId: string): boolean =>
  palette.entries.some((entry: PaletteEntry): boolean => entry.id === entryId);

const getPaletteWithSavedEntry = (palette: Palette, savedEntry: PaletteEntry): Palette => ({
  ...palette,
  entries: hasEntryWithId(palette, savedEntry.id)
    ? palette.entries.map((entry: PaletteEntry): PaletteEntry => entry.id === savedEntry.id ? savedEntry : entry)
    : [...palette.entries, savedEntry],
});

const getPaletteWithoutEntry = (palette: Palette, entryId: string): Palette =>
  entryId === SHADING_ENTRY_ID
    ? palette
    : { ...palette, entries: palette.entries.filter((entry: PaletteEntry): boolean => entry.id !== entryId) };

const getPaletteInOrder = (palette: Palette, entryIds: string[]): Palette => {
  const orderedEntries: PaletteEntry[] = [];

  for (const entryId of entryIds) {
    const orderedEntry: PaletteEntry | undefined =
      palette.entries.find((entry: PaletteEntry): boolean => entry.id === entryId);

    if (orderedEntry && !orderedEntries.includes(orderedEntry)) {
      orderedEntries.push(orderedEntry);
    }
  }

  const unlistedEntries: PaletteEntry[] =
    palette.entries.filter((entry: PaletteEntry): boolean => !orderedEntries.includes(entry));

  return { ...palette, entries: [...orderedEntries, ...unlistedEntries] };
};

export const paletteReducer = (
  state: PaletteState = INITIAL_PALETTE_STATE,
  action: Action<unknown>,
): PaletteState => {
  switch (action.type) {
  case PaletteLoaded.type:
    return { ...state, palette: (action as PaletteLoaded).payload.palette };
  case PaletteEntrySaved.type:
    return { ...state, palette: getPaletteWithSavedEntry(state.palette, (action as PaletteEntrySaved).payload.entry) };
  case PaletteEntryDeleted.type:
    return {
      ...state,
      palette: getPaletteWithoutEntry(state.palette, (action as PaletteEntryDeleted).payload.entryId),
    };
  case PaletteEntriesReordered.type:
    return {
      ...state,
      palette: getPaletteInOrder(state.palette, (action as PaletteEntriesReordered).payload.entryIds),
    };
  case PaletteResetRequested.type:
    return { ...state, palette: DEFAULT_PALETTE };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [PALETTE_STATE_NAME]: PaletteState };

export const selectPalette = (state: RootState): Palette => state[PALETTE_STATE_NAME].palette;

export const selectPaletteEntries = (state: RootState): PaletteEntry[] => state[PALETTE_STATE_NAME].palette.entries;
// #endregion
