/**
 * Access to the workbench panel sizes in the webgrbl database: the percentages the user set with the splitters, kept
 * as JSON in two app state rows, the column widths as a list and the console height as one number. A stored row that
 * is not valid JSON or not valid sizes reads as nothing, so the caller falls back to the default sizes. Storage errors
 * are not caught here; the caller decides how to report them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getValidConsoleSizePercent } from '../layout/get.valid.console.size.percent';
import { getValidPanelSizePercents } from '../layout/get.valid.panel.size.percents';
import { getStoredAppStateJson } from './get.stored.app.state.json';
import { APP_STATE_KEY } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

export const PANEL_SIZES_REPOSITORY = {
  async getPanelSizePercents(): Promise<number[] | undefined> {
    return getValidPanelSizePercents(await getStoredAppStateJson(APP_STATE_KEY.PANEL_SIZES));
  },

  async getConsoleSizePercent(): Promise<number | undefined> {
    return getValidConsoleSizePercent(await getStoredAppStateJson(APP_STATE_KEY.CONSOLE_PANEL_SIZE));
  },

  async setConsoleSizePercent(consoleSizePercent: number): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({
      key: APP_STATE_KEY.CONSOLE_PANEL_SIZE,
      value: JSON.stringify(consoleSizePercent),
    });
  },

  async setPanelSizePercents(panelSizePercents: number[]): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.PANEL_SIZES, value: JSON.stringify(panelSizePercents) });
  },
};
