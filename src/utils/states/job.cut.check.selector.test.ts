import { describe, expect, it } from 'vitest';
import { getLayerSettings } from '../layers/get.layer.settings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { DEFAULT_CUT_ENTRY, DEFAULT_FILL_ENTRY, DEFAULT_SCORE_ENTRY } from '../palette/palette.constants';
import { newProjectObject } from '../project/new.project.object';
import type { JobCutCheckLayer } from './interfaces/JobCutCheckLayer';
import { selectJobCutCheckLayers } from './job.cut.check.selector';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import { JobCutCheckDismissed, JobCutCheckLayersCaptured, JobRunStarted } from './job.run.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { LayerToggled, ProjectObjectsAdded } from './project.document.state';

const PRESET_ID = 'preset';
const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<line x1="0" y1="0" x2="5" y2="0" stroke="#ff0000"/><line x1="0" y1="2" x2="5" y2="2" stroke="#0000ff"/>'
  + '<rect x="0" y="4" width="5" height="5" fill="#00a000"/></svg>';

const newLayer = (entry: PaletteEntry, order: number, presetId?: string): ProjectLayer => ({
  colour: entry.colour,
  enabled: true,
  order,
  settings: getLayerSettings(entry),
  paletteEntryId: entry.id,
  presetId,
  isShading: false,
});

const newCapturedStore = (): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectObjectsAdded({
    objects: [newProjectObject({ svgText: SVG_TEXT })],
    layers: [
      newLayer(DEFAULT_CUT_ENTRY, 0, PRESET_ID),
      newLayer(DEFAULT_SCORE_ENTRY, 1),
      newLayer(DEFAULT_FILL_ENTRY, 2),
    ],
  }));
  store.dispatch(new JobCutCheckLayersCaptured({
    layerKeys: [DEFAULT_CUT_ENTRY.colour, DEFAULT_SCORE_ENTRY.colour, DEFAULT_FILL_ENTRY.colour],
  }));

  return store;
};

describe(selectJobCutCheckLayers.name, () => {
  it('lists the line layers of the finished job, the Cut one ticked, fill layers left out', () => {
    const layers: JobCutCheckLayer[] = selectJobCutCheckLayers(newCapturedStore().getState());

    expect(layers).toEqual([
      {
        layerKey: DEFAULT_CUT_ENTRY.colour,
        name: DEFAULT_CUT_ENTRY.name,
        isTickedByDefault: true,
        presetId: PRESET_ID,
      },
      {
        layerKey: DEFAULT_SCORE_ENTRY.colour,
        name: DEFAULT_SCORE_ENTRY.name,
        isTickedByDefault: false,
        presetId: undefined,
      },
    ]);
  });

  it('lists nothing before a job finished', () => {
    expect(selectJobCutCheckLayers(newStore().getState())).toEqual([]);
  });

  it('lists nothing once the check is closed, a new run starts or the project changes', () => {
    const dismissedStore: AppStore = newCapturedStore();
    const startedStore: AppStore = newCapturedStore();
    const changedStore: AppStore = newCapturedStore();

    dismissedStore.dispatch(new JobCutCheckDismissed());
    startedStore.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.JOB }));
    changedStore.dispatch(new LayerToggled({ layerKey: DEFAULT_SCORE_ENTRY.colour, enabled: false }));

    expect(selectJobCutCheckLayers(dismissedStore.getState())).toEqual([]);
    expect(selectJobCutCheckLayers(startedStore.getState())).toEqual([]);
    expect(selectJobCutCheckLayers(changedStore.getState())).toEqual([]);
  });
});
