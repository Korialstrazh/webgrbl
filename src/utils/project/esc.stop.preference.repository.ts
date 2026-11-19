/**
 * Access to the app-wide choice whether Escape also stops the laser while a panel is open, kept as JSON in one app
 * state row. A stored value that is not a boolean reads as nothing, so the caller falls back to the default. Storage
 * errors are not caught here; the caller decides how to report them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isBoolean } from '../type.guards/is.boolean';
import { getStoredAppStateJson } from './get.stored.app.state.json';
import { APP_STATE_KEY } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

export const ESC_STOP_PREFERENCE_REPOSITORY = {
  async getEscStopsWithOverlayOpen(): Promise<boolean | undefined> {
    const storedValue: unknown = await getStoredAppStateJson(APP_STATE_KEY.ESC_STOPS_WITH_OVERLAY_OPEN);

    return isBoolean(storedValue) ? storedValue : undefined;
  },

  async setEscStopsWithOverlayOpen(isEscStopping: boolean): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({
      key: APP_STATE_KEY.ESC_STOPS_WITH_OVERLAY_OPEN,
      value: JSON.stringify(isEscStopping),
    });
  },
};
