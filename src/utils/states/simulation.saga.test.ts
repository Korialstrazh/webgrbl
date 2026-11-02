import { describe, expect, it } from 'vitest';
import { newProjectObject } from '../project/new.project.object';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectDocumentLoaded } from './project.document.state';
import { watchSimulation } from './simulation.saga';
import { SimulationPlayToggled, selectIsSimulationPlaying } from './simulation.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from './toolpath.state';

const newReadyStore = (): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ moves: [newToolpathMove()] }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

describe(watchSimulation.name, () => {
  it('lets a ready toolpath play', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new SimulationPlayToggled());

    expect(selectIsSimulationPlaying(store.getState())).toBe(true);
  });

  it('pauses a playback toggled on while the toolpath is out of date', () => {
    const store: AppStore = newReadyStore();

    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    store.dispatch(new SimulationPlayToggled());

    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
  });

  it('pauses a playback toggled on before there is any toolpath', () => {
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

    store.dispatch(new SimulationPlayToggled());

    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
  });
});
