import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { JobCutCheckHint } from '.';
import { getLayerSettings } from '../../utils/layers/get.layer.settings';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import { DEFAULT_CUT_ENTRY, DEFAULT_FILL_ENTRY, DEFAULT_SCORE_ENTRY } from '../../utils/palette/palette.constants';
import { newProjectObject } from '../../utils/project/new.project.object';
import { JobCutCheckDismissed, JobCutCheckLayersCaptured, JobRunStarted } from '../../utils/states/job.run.state';
import { JOB_RUN_KIND } from '../../utils/states/job.run.kind.constants';
import { JobSafetyChecklistOpened } from '../../utils/states/job.safety.checklist.state';
import { JOB_START_REQUEST_KIND } from '../../utils/states/job.start.request.constants';
import { MaterialPresetCutThroughNoteAdded } from '../../utils/states/material.preset.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import { ProjectObjectsAdded } from '../../utils/states/project.document.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';

const PRESET_ID = 'preset-cut';
const SCORE_PRESET_ID = 'preset-score';
const TITLE_TEXT = /Don't move the sheet yet/;
const QUESTION_TEXT = 'Did the parts come out cleanly?';
const YES_LABEL = 'Yes';
const STUCK_LABEL = 'Some are stuck';
const CLOSE_LABEL = 'Close the cut check';
const EXTRA_PASS_LABEL = 'Add one extra pass';
const RECUT_LABEL = 'Run cut layers again';
const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<line x1="0" y1="0" x2="5" y2="0" stroke="#ff0000"/><line x1="0" y1="2" x2="5" y2="2" stroke="#0000ff"/>'
  + '<rect x="0" y="4" width="5" height="5" fill="#00a000"/></svg>';
const FILL_ONLY_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
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

const newFinishedJobStore = (svgText: string = SVG_TEXT): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ProjectObjectsAdded({
    objects: [newProjectObject({ svgText })],
    layers: [
      newLayer(DEFAULT_CUT_ENTRY, 0, PRESET_ID),
      newLayer(DEFAULT_SCORE_ENTRY, 1, SCORE_PRESET_ID),
      newLayer(DEFAULT_FILL_ENTRY, 2),
    ],
  }));
  store.dispatch(new JobCutCheckLayersCaptured({ layerKeys: [DEFAULT_CUT_ENTRY.colour, DEFAULT_SCORE_ENTRY.colour] }));

  return store;
};

const renderHint = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <JobCutCheckHint />
      </AntdTestProvider>
    </Provider>,
  );
};

describe(JobCutCheckHint.name, () => {
  it('asks about the parts after a finished job, without locking anything', () => {
    renderHint(newFinishedJobStore());

    expect(screen.getByText(TITLE_TEXT)).toBeInTheDocument();
    expect(screen.getByText(QUESTION_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: YES_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STUCK_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: CLOSE_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows nothing when the job had no line layer', () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectObjectsAdded({
      objects: [newProjectObject({ svgText: FILL_ONLY_SVG_TEXT })],
      layers: [newLayer(DEFAULT_FILL_ENTRY, 0)],
    }));
    store.dispatch(new JobCutCheckLayersCaptured({ layerKeys: [] }));
    renderHint(store);

    expect(screen.queryByText(QUESTION_TEXT)).not.toBeInTheDocument();
  });

  it.each([YES_LABEL, CLOSE_LABEL])('goes away on %s', (buttonLabel: string) => {
    renderHint(newFinishedJobStore());
    fireEvent.click(screen.getByRole('button', { name: buttonLabel }));

    expect(screen.queryByText(QUESTION_TEXT)).not.toBeInTheDocument();
  });

  it('lists the line layers on Some are stuck, Cut ticked and Score not, and adds no note yet', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));

    expect(screen.getByRole('checkbox', { name: DEFAULT_CUT_ENTRY.name })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name })).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: DEFAULT_FILL_ENTRY.name })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: EXTRA_PASS_LABEL })).not.toBeChecked();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('notes the preset of the layers ticked when running again, not of the ones ticked at first', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('checkbox', { name: DEFAULT_CUT_ENTRY.name }));
    fireEvent.click(screen.getByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name }));
    fireEvent.click(screen.getByRole('button', { name: RECUT_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new MaterialPresetCutThroughNoteAdded({ presetId: SCORE_PRESET_ID }));
    expect(dispatchSpy).not.toHaveBeenCalledWith(new MaterialPresetCutThroughNoteAdded({ presetId: PRESET_ID }));
  });

  it('notes the preset of the ticked layer when closed after Some are stuck', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new MaterialPresetCutThroughNoteAdded({ presetId: PRESET_ID }));
  });

  it('adds the note only once when closed after running again', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const isNoteAction = (action: unknown): boolean => action instanceof MaterialPresetCutThroughNoteAdded;

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: RECUT_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));

    expect(dispatchSpy.mock.calls.filter(([action]: unknown[]) => isNoteAction(action))).toHaveLength(1);
  });

  it('adds no note on Yes', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: YES_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(new JobCutCheckDismissed());
  });

  it('opens the Start checklist for the ticked layers, with the extra pass when asked', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name }));
    fireEvent.click(screen.getByRole('checkbox', { name: EXTRA_PASS_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: RECUT_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(new JobSafetyChecklistOpened({
      kind: JOB_START_REQUEST_KIND.RECUT,
      layerKeys: [DEFAULT_CUT_ENTRY.colour, DEFAULT_SCORE_ENTRY.colour],
      isExtraPassAdded: true,
    }));
  });

  it('keeps Run cut layers again off while no layer is ticked', () => {
    renderHint(newFinishedJobStore());
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('checkbox', { name: DEFAULT_CUT_ENTRY.name }));

    expect(screen.getByRole('button', { name: RECUT_LABEL })).toBeDisabled();
  });

  it('starts fresh after a re-cut finished, with default ticks and the note offered again', () => {
    const store: AppStore = newFinishedJobStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const isNoteAction = (action: unknown): boolean => action instanceof MaterialPresetCutThroughNoteAdded;

    renderHint(store);
    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));
    fireEvent.click(screen.getByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name }));
    fireEvent.click(screen.getByRole('button', { name: RECUT_LABEL }));
    act(() => {
      store.dispatch(new JobRunStarted({ startedAtMs: 0, kind: JOB_RUN_KIND.JOB }));
      store.dispatch(new JobCutCheckLayersCaptured({
        layerKeys: [DEFAULT_CUT_ENTRY.colour, DEFAULT_SCORE_ENTRY.colour],
      }));
    });

    expect(screen.getByText(QUESTION_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: STUCK_LABEL }));

    expect(screen.getByRole('checkbox', { name: DEFAULT_CUT_ENTRY.name })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: DEFAULT_SCORE_ENTRY.name })).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));

    expect(dispatchSpy.mock.calls.filter(([action]: unknown[]) => isNoteAction(action))).toHaveLength(3);
  });
});
