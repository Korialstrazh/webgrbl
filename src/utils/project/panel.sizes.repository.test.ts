import { describe, expect, it } from 'vitest';
import { APP_STATE_KEY } from './project.database.constants';
import { PANEL_SIZES_REPOSITORY } from './panel.sizes.repository';
import { WEBGRBL_DATABASE } from './webgrbl.database';

const STORED_PERCENTS: number[] = [22.5, 50, 27.5];
const CHANGED_PERCENTS: number[] = [30, 40, 30];

describe(PANEL_SIZES_REPOSITORY.getPanelSizePercents.name, () => {
  it('gives nothing while no sizes are stored', async () => {
    expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toBeUndefined();
  });

  it('gives back the sizes stored last', async () => {
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);
    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(CHANGED_PERCENTS);

    expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toEqual(CHANGED_PERCENTS);
  });

  it.each([
    ['text that is not JSON', '{not json'],
    ['JSON that is not a list', '{"design":20}'],
    ['the wrong number of panels', '[50,50]'],
    ['sizes that do not add up to 100', '[10,10,10]'],
  ])('gives nothing for a stored row with %s', async (_caseName: string, storedValue: string) => {
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.PANEL_SIZES, value: storedValue });

    expect(await PANEL_SIZES_REPOSITORY.getPanelSizePercents()).toBeUndefined();
  });
});

describe(PANEL_SIZES_REPOSITORY.setPanelSizePercents.name, () => {
  it('leaves the last opened project untouched', async () => {
    const projectId = 'project-id';
    await WEBGRBL_DATABASE.appState.put({ key: APP_STATE_KEY.LAST_OPENED_PROJECT_ID, value: projectId });

    await PANEL_SIZES_REPOSITORY.setPanelSizePercents(STORED_PERCENTS);

    expect((await WEBGRBL_DATABASE.appState.get(APP_STATE_KEY.LAST_OPENED_PROJECT_ID))?.value).toBe(projectId);
  });
});
