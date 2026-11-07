/**
 * Access to the app-wide choice whether a double-click on empty bed moves the laser there, kept as JSON in one app
 * state row. A stored value that is not a boolean reads as nothing, so the caller falls back to the default. Storage
 * errors are not caught here; the caller decides how to report them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isBoolean } from '../type.guards/is.boolean';
import { getStoredAppStateJson } from './get.stored.app.state.json';
import { APP_STATE_KEY } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

export const BED_DOUBLE_CLICK_MOVE_PREFERENCE_REPOSITORY = {
  async getBedDoubleClickMovesLaser(): Promise<boolean | undefined> {
    const storedValue: unknown = await getStoredAppStateJson(APP_STATE_KEY.BED_DOUBLE_CLICK_MOVES_LASER);

    return isBoolean(storedValue) ? storedValue : undefined;
  },

  async setBedDoubleClickMovesLaser(isMovingLaser: boolean): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({
      key: APP_STATE_KEY.BED_DOUBLE_CLICK_MOVES_LASER,
      value: JSON.stringify(isMovingLaser),
    });
  },
};
