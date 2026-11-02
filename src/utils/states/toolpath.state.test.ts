import { describe, expect, it } from 'vitest';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { Action } from './action';
import { ProjectObjectsDeleted } from './project.document.state';
import {
  GcodeExportConfirmationClosed,
  GcodeExportConfirmationRequested,
  ToolpathCancelled,
  ToolpathFailed,
  ToolpathProgress,
  ToolpathReady,
  ToolpathRequested,
  toolpathReducer,
} from './toolpath.state';
import type { ToolpathState } from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';

const HALF_PROGRESS = 0.5;
const EMPTY_TOOLPATH: Toolpath = { moves: [], layers: [], warnings: [], bounds: undefined };
const FIRST_DOCUMENT_VERSION = 0;

class UnknownAction extends Action {
  public static readonly type: string = 'unknown action';
}

const getInitialState = (): ToolpathState => toolpathReducer(undefined, new UnknownAction());

const getGeneratingState = (): ToolpathState => toolpathReducer(getInitialState(), new ToolpathRequested());

const getReadyState = (): ToolpathState => toolpathReducer(
  getGeneratingState(),
  new ToolpathReady({ toolpath: EMPTY_TOOLPATH, documentVersion: FIRST_DOCUMENT_VERSION }),
);

const getStateAfterDocumentChange = (state: ToolpathState): ToolpathState =>
  toolpathReducer(state, new ProjectObjectsDeleted({ objectIds: [] }));

describe(toolpathReducer.name, () => {
  it('starts idle with no toolpath', () => {
    expect(getInitialState()).toEqual({
      status: TOOLPATH_STATUS.IDLE,
      progress: 0,
      toolpath: undefined,
      documentVersion: FIRST_DOCUMENT_VERSION,
      isGcodeExportConfirmationOpen: false,
    });
  });

  it('takes progress while generating and ignores it otherwise', () => {
    const progressAction: ToolpathProgress = new ToolpathProgress({ progress: HALF_PROGRESS });

    expect(toolpathReducer(getGeneratingState(), progressAction).progress).toBe(HALF_PROGRESS);
    expect(toolpathReducer(getReadyState(), progressAction)).toEqual(getReadyState());
  });

  it('bumps the document version on every document change and marks only a ready toolpath stale', () => {
    const changedIdleState: ToolpathState = getStateAfterDocumentChange(getInitialState());
    const changedReadyState: ToolpathState = getStateAfterDocumentChange(getReadyState());

    expect(changedIdleState.documentVersion).toBe(FIRST_DOCUMENT_VERSION + 1);
    expect(changedIdleState.status).toBe(TOOLPATH_STATUS.IDLE);
    expect(changedReadyState.status).toBe(TOOLPATH_STATUS.STALE);
    expect(getStateAfterDocumentChange(getGeneratingState()).status).toBe(TOOLPATH_STATUS.GENERATING);
  });

  it('drops a result made for an older document version', () => {
    const changedGeneratingState: ToolpathState = getStateAfterDocumentChange(getGeneratingState());
    const readyAction: ToolpathReady = new ToolpathReady({
      toolpath: EMPTY_TOOLPATH,
      documentVersion: FIRST_DOCUMENT_VERSION,
    });

    expect(toolpathReducer(changedGeneratingState, readyAction)).toEqual(changedGeneratingState);
  });

  it('goes back to idle on cancel, or to stale when an older toolpath is kept', () => {
    const regeneratingState: ToolpathState = toolpathReducer(
      getStateAfterDocumentChange(getReadyState()),
      new ToolpathRequested(),
    );

    expect(toolpathReducer(getGeneratingState(), new ToolpathCancelled()).status).toBe(TOOLPATH_STATUS.IDLE);
    expect(toolpathReducer(regeneratingState, new ToolpathCancelled()).status).toBe(TOOLPATH_STATUS.STALE);
    expect(toolpathReducer(getReadyState(), new ToolpathCancelled()).status).toBe(TOOLPATH_STATUS.READY);
  });

  it('sets failed when the generation fails', () => {
    expect(toolpathReducer(getGeneratingState(), new ToolpathFailed()).status).toBe(TOOLPATH_STATUS.FAILED);
  });

  it('opens the export confirmation and closes it on cancel or on a document change', () => {
    const confirmingState: ToolpathState = toolpathReducer(getReadyState(), new GcodeExportConfirmationRequested());

    expect(confirmingState.isGcodeExportConfirmationOpen).toBe(true);
    expect(toolpathReducer(confirmingState, new GcodeExportConfirmationClosed()).isGcodeExportConfirmationOpen)
      .toBe(false);
    expect(getStateAfterDocumentChange(confirmingState).isGcodeExportConfirmationOpen).toBe(false);
  });
});
