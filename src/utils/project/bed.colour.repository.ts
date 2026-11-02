/**
 * Access to the bed colour the user chose, kept app-wide (not per project) as JSON in one app state row. A stored value
 * that is not a valid colour reads as nothing, so the caller falls back to the default. Storage errors are not caught
 * here; the caller decides how to report them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getValidBedColour } from '../bed/get.valid.bed.colour';
import { getStoredAppStateJson } from './get.stored.app.state.json';
import { APP_STATE_KEY } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

export const BED_COLOUR_REPOSITORY = {
  async getBedColour(): Promise<string | undefined> {
    return getValidBedColour(await getStoredAppStateJson(APP_STATE_KEY.BED_COLOUR));
  },

  async setBedColour(bedColour: string): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.BED_COLOUR, value: JSON.stringify(bedColour) });
  },
};
