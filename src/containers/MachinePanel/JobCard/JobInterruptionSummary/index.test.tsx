import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { JobInterruptionSummary } from '.';
import { getLayerSettings } from '../../../../utils/layers/get.layer.settings';
import { getLayerKey } from '../../../../utils/layers/get.layer.key';
import type { ProjectLayer } from '../../../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY } from '../../../../utils/palette/palette.constants';
import { newProjectObject } from '../../../../utils/project/new.project.object';
import type { GcodeLine } from '../../../../utils/toolpath/interfaces/GcodeLine';
import { newToolpath } from '../../../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../../../utils/toolpath/test.support/new.toolpath.move';
import { JobResumePointRecorded } from '../../../../utils/states/job.resume.state';
import { JOB_RUN_KIND } from '../../../../utils/states/job.run.kind.constants';
import type { JobRunKind } from '../../../../utils/states/job.run.kind.constants';
import { JobRunStarted, JobRunStatusChanged } from '../../../../utils/states/job.run.state';
import { JOB_RUN_STATUS } from '../../../../utils/states/job.run.status.constants';
import type { JobRunStatus } from '../../../../utils/states/job.run.status.constants';
import { newStore } from '../../../../utils/states/new.store';
import type { AppStore } from '../../../../utils/states/new.store';
import { ProjectObjectsAdded } from '../../../../utils/states/project.document.state';

const CUT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<line x1="0" y1="0" x2="5" y2="0" stroke="#ff0000"/></svg>';
const STOPPED_TEXT = 'Stopped in layer Cut at about 63 %';
const LAST_POINT_TEXT = 'Last confirmed point: X 24.0 mm, Y 4.0 mm';
const MOVE_COUNT = 28;
const ANSWERED_LINE_COUNT = 19;
const MOVE_STEP_MM = 1.5;
const MOVE_Y_MM = 4;
const LINES: GcodeLine[] = [
  { text: 'G21', moveIndex: undefined },
  { text: 'M4', moveIndex: undefined },
  ...Array.from({ length: MOVE_COUNT }, (_: unknown, moveIndex: number): GcodeLine => ({
    text: `G1 X${moveIndex * MOVE_STEP_MM} Y${MOVE_Y_MM}`,
    moveIndex,
  })),
];

const newInterruptedStore = (status: JobRunStatus, kind: JobRunKind): AppStore => {
  const store: AppStore = newStore();
  const layer: ProjectLayer = {
    colour: DEFAULT_CUT_ENTRY.colour,
    enabled: true,
    order: 0,
    settings: getLayerSettings(DEFAULT_CUT_ENTRY),
    paletteEntryId: DEFAULT_CUT_ENTRY.id,
    isShading: false,
  };

  store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject({ svgText: CUT_SVG_TEXT })], layers: [layer] }));

  const layerKey: string = getLayerKey(layer);

  store.dispatch(new JobResumePointRecorded({
    lines: LINES,
    answeredLineCount: ANSWERED_LINE_COUNT,
    toolpathDocumentVersion: 1,
    profileId: 'profile',
    toolpath: newToolpath({
      moves: Array.from({ length: MOVE_COUNT }, (_: unknown, moveIndex: number) =>
        newToolpathMove({ to: { x: moveIndex * MOVE_STEP_MM, y: MOVE_Y_MM }, layerKey })),
    }),
  }));
  store.dispatch(new JobRunStarted({ startedAtMs: 0, kind }));
  store.dispatch(new JobRunStatusChanged({ status }));

  return store;
};

const renderSummary = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <JobInterruptionSummary />
    </Provider>,
  );
};

describe('JobInterruptionSummary', () => {
  it('tells the layer, the percent and the last confirmed point of an interrupted job', () => {
    renderSummary(newInterruptedStore(JOB_RUN_STATUS.INTERRUPTED, JOB_RUN_KIND.JOB));

    expect(screen.getByText(STOPPED_TEXT)).toBeInTheDocument();
    expect(screen.getByText(LAST_POINT_TEXT)).toBeInTheDocument();
  });

  it('shows nothing for a job that is still running', () => {
    renderSummary(newInterruptedStore(JOB_RUN_STATUS.SENDING, JOB_RUN_KIND.JOB));

    expect(screen.queryByText(/Stopped in layer/)).not.toBeInTheDocument();
  });

  it('shows nothing for an interrupted frame run', () => {
    renderSummary(newInterruptedStore(JOB_RUN_STATUS.INTERRUPTED, JOB_RUN_KIND.FRAME));

    expect(screen.queryByText(/Stopped in layer/)).not.toBeInTheDocument();
  });
});
