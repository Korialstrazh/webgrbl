/**
 * Reads one app state row as parsed JSON. The value is unknown, because the row comes from storage and is checked by
 * the caller, not trusted; a missing row or text that is not JSON reads as undefined.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isString } from '../type.guards/is.string';
import type { AppStateEntry } from './interfaces/AppStateEntry';
import type { AppStateKey } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const getParsedStoredValue = (storedText: string): unknown => {
  try {
    return JSON.parse(storedText);
  } catch {
    return undefined;
  }
};

export const getStoredAppStateJson = async (appStateKey: AppStateKey): Promise<unknown> => {
  const appStateEntry: AppStateEntry | undefined = await WEBGRBL_DATABASE.appState.get(appStateKey);
  const storedText: unknown = appStateEntry?.value;

  return isString(storedText) ? getParsedStoredValue(storedText) : undefined;
};
