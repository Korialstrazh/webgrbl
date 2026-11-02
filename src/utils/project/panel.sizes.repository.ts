/**
 * Access to the workbench panel sizes in the webgrbl database: the percentages the user set with the splitter, kept in
 * one app state row as a JSON list. A stored row that is not valid JSON or not valid sizes reads as nothing, so the
 * caller falls back to the default sizes. Storage errors are not caught here; the caller decides how to report them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getValidPanelSizePercents } from '../layout/get.valid.panel.size.percents';
import { isString } from '../type.guards/is.string';
import type { AppStateEntry } from './interfaces/AppStateEntry';
import { APP_STATE_KEY } from './project.database.constants';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const getParsedStoredValue = (storedText: string): unknown => {
  try {
    return JSON.parse(storedText);
  } catch {
    return undefined;
  }
};

export const PANEL_SIZES_REPOSITORY = {
  async getPanelSizePercents(): Promise<number[] | undefined> {
    const panelSizesEntry: AppStateEntry | undefined = await WEBGRBL_DATABASE.appState.get(APP_STATE_KEY.PANEL_SIZES);
    // The row comes from storage, so its value is checked rather than trusted.
    const storedText: unknown = panelSizesEntry?.value;

    return isString(storedText) ? getValidPanelSizePercents(getParsedStoredValue(storedText)) : undefined;
  },

  async setPanelSizePercents(panelSizePercents: number[]): Promise<void> {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.PANEL_SIZES, value: JSON.stringify(panelSizePercents) });
  },
};
