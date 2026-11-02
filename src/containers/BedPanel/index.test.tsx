import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { BedPanel } from '.';
import { DATA_TRANSFER_FILES_TYPE } from '../../utils/browser/browser.events.constants';
import { HORIZONTAL_ELLIPSIS, MULTIPLICATION_SIGN } from '../../utils/characters.constants';
import { GRBL_MACHINE_STATE } from '../../utils/grbl/grbl.constants';
import { getResolvedGrblPositions } from '../../utils/grbl/grbl.position.resolver';
import type { GrblAxisPosition } from '../../utils/grbl/interfaces/GrblAxisPosition';
import type { GrblResolvedPositions } from '../../utils/grbl/interfaces/GrblResolvedPositions';
import type { GrblStatusReport } from '../../utils/grbl/interfaces/GrblStatusReport';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from '../../utils/profiles/machine.profile.constants';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import { MachineProfilesLoaded } from '../../utils/states/machine.profile.state';
import { MachineStatusReceived } from '../../utils/states/machine.status.state';
import { newStore } from '../../utils/states/new.store';
import type { AppDispatch, AppStore } from '../../utils/states/new.store';
import {
  ProjectDocumentLoaded,
  selectProjectObjects,
  SvgFilesImportRequested,
} from '../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../utils/states/project.selection.state';
import { SimulationPlayToggled, selectIsSimulationPlaying } from '../../utils/states/simulation.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { selectToasts, ToastShown } from '../../utils/states/toast.state';
import {
  ToolpathCancelled,
  ToolpathProgress,
  ToolpathReady,
  ToolpathRequested,
  selectToolpathDocumentVersion,
} from '../../utils/states/toolpath.state';
import { selectIsSimulationPlayable } from '../../utils/states/toolpath.timeline.selectors';
import { SVG_MIME_TYPE } from '../../utils/svg/svg.constants';
import { newGcodeExportTestStore } from '../../utils/test.support/new.gcode.export.test.store';
import { IDENTITY_SVG_MATRIX, mockSvgScreenMatrix } from '../../utils/test.support/svg.screen.matrix.mock';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';
import { BED_HEAD_TEST_ID } from '../../views/BedView/bed.view.constants';
import { BED_OBJECTS_SURFACE_TEST_ID } from '../BedObjects/bed.objects.constants';
import { TOOLPATH_BURN_PATH_TEST_ID } from '../ToolpathLayer/toolpath.layer.constants';
import { BED_DROP_AREA_TEST_ID } from './bed.panel.constants';

const NOT_RESPONDING_TEXT = 'The controller is not responding.';
const NO_MACHINE_TEXT = 'Connect a machine to see its bed';
const WORK_POSITION: GrblAxisPosition = { x: 10, y: 20, z: 0 };
const WORK_COORDINATE_OFFSET: GrblAxisPosition = { x: 100, y: 30, z: 0 };
const EXPECTED_HEAD_TRANSFORM = 'translate(110 350) scale(1)';
const VIEW_MODE_LABEL = 'Bed view';
const DESIGN_VIEW_LABEL = 'Design';
const PROFILE_WIDTH_MM = 300;
const PROFILE_HEIGHT_MM = 200;
const PROFILE_BED_LABEL = 'Machine bed, 300 by 200 mm';
const OBJECT_NAME = 'Logo';
const TOOL_LABEL = 'Bed tool';
const SELECT_TOOL_LABEL = 'Select';
const MOVE_TOOL_LABEL = 'Move';
const EDIT_NODES_LABEL = /^Edit nodes/;
const ALIGN_LABEL = /^Align/;
const SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
const DROP_TARGET_ATTRIBUTE = 'data-drop-target';
const TRUE_TEXT = 'true';
const FALSE_TEXT = 'false';
const POINTER_ID = 1;
const DRAG_START_X = 100;
const DRAG_START_Y = 100;
const DRAG_RIGHT_MM = 20;

const FILE_DRAG = { dataTransfer: { types: [DATA_TRANSFER_FILES_TYPE] } };
const TEXT_DRAG = { dataTransfer: { types: ['text/plain'] } };

const PHOTO_FILE_NAME = 'photo.png';
const TOOLPATH_VIEW_LABEL = 'Toolpath';
// The name of each More entry starts with its tool name and also carries its Soon tag and description.
const THREE_D_VIEW_LABEL = /^3D/;
const MORE_TOOLS_LABEL = /^More bed tools/;
const ARIA_DISABLED_ATTRIBUTE = 'aria-disabled';
const SOON_TAG_TEXT = 'Soon';
const REGENERATE_LABEL = 'Regenerate';
const OUT_OF_DATE_TEXT = 'Out of date';
const CANCEL_LABEL = 'Cancel';
const GENERATING_TEXT = `Generating${HORIZONTAL_ELLIPSIS} 40 %`;
const GENERATION_PROGRESS = 0.4;
const TEXT_WARNING = 'Text is not converted to paths. In Inkscape use Path > Object to Path.';
const TEXT_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><text x="1" y="5">Hi</text></svg>';
// One burn at 6000 mm/min from rest to rest with the default 1000 mm/s2: 65.9 s cruising plus 0.1 s of ramps.
const SIXTY_SIX_SECOND_TOOLPATH: Toolpath = newToolpath({
  moves: [newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 6590, y: 0 } })],
  layers: [{ layerKey: '#ff0000', firstMoveIndex: 0, lastMoveIndex: 0 }],
  bounds: { minX: 10, minY: 20, maxX: 60, maxY: 50 },
});
const JOB_SIZE_TEXT = `Job 50.0 ${MULTIPLICATION_SIGN} 30.0 mm`;
const PLAYBACK_BAR_LABEL = 'Simulation playback';

const newPhotoFile = (): File => new File(['png'], PHOTO_FILE_NAME, { type: 'image/png' });

const getNotSvgToasts = (store: AppStore): AppToast[] => selectToasts(store.getState()).filter(
  (toast: AppToast): boolean => toast.messageKey === DEFAULT.TOAST_SVG_IMPORT_FAILED_NOT_SVG,
);

const newHeldToolpathStore = (): AppStore => newStore(undefined, new FakeToolpathWorkerClient(true));

const putReadyToolpath = (store: AppStore, toolpath: Toolpath): void => {
  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({ toolpath, documentVersion: selectToolpathDocumentVersion(store.getState()) }));
};

const openToolpathView = (): void => {
  fireEvent.click(screen.getByRole('radio', { name: TOOLPATH_VIEW_LABEL }));
};

const renderPanel = (store: AppStore): void => {
  render(
    <Provider store={store}>
      <BedPanel hostRef={null} isWide />
    </Provider>,
  );
};

const newPositionOnlyReport = (): GrblStatusReport => ({
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: WORK_POSITION,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
});

describe(BedPanel.name, () => {
  it('shows toasts inside the bed region', () => {
    const store: AppStore = newStore();

    renderPanel(store);
    act(() => {
      store.dispatch(new ToastShown({
        severity: TOAST_SEVERITY.WARNING,
        messageKey: DEFAULT.TOAST_NOT_RESPONDING,
        messageParameters: NO_TOAST_PARAMETERS,
      }));
    });

    expect(within(screen.getByRole('main')).getByText(NOT_RESPONDING_TEXT)).toBeInTheDocument();
  });

  it('asks for a machine while disconnected', () => {
    renderPanel(newStore());

    expect(screen.getByText(NO_MACHINE_TEXT)).toBeInTheDocument();
  });

  it('draws the bed from the active profile without the placeholder while disconnected', () => {
    const store: AppStore = newStore();
    const profile: MachineProfile = newMachineProfile({
      workAreaXMm: PROFILE_WIDTH_MM,
      workAreaYMm: PROFILE_HEIGHT_MM,
    });

    renderPanel(store);
    act(() => {
      store.dispatch(new MachineProfilesLoaded({
        document: { version: MACHINE_PROFILES_DOCUMENT_VERSION, activeProfileId: profile.id, profiles: [profile] },
      }));
    });

    expect(screen.getByLabelText(PROFILE_BED_LABEL, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(NO_MACHINE_TEXT)).not.toBeInTheDocument();
  });

  it('status with only WPos and a cached WCO still places the crosshair', () => {
    const store: AppStore = newStore();
    const positions: GrblResolvedPositions = getResolvedGrblPositions(newPositionOnlyReport(), WORK_COORDINATE_OFFSET);

    renderPanel(store);
    act(() => {
      store.dispatch(new MachineStatusReceived({ status: { ...newPositionOnlyReport(), ...positions } }));
    });

    expect(screen.getByTestId(BED_HEAD_TEST_ID)).toHaveAttribute('transform', EXPECTED_HEAD_TRANSFORM);
  });

  it('names the view mode selector and shows Design as selected', () => {
    renderPanel(newStore());

    expect(screen.getByRole('radiogroup', { name: VIEW_MODE_LABEL, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL, hidden: true })).toBeChecked();
  });

  it('lists Edit nodes, Align and 3D under More as disabled entries, each with a Soon tag', async () => {
    renderPanel(newStore());
    fireEvent.click(screen.getByRole('button', { name: MORE_TOOLS_LABEL }));

    for (const soonLabel of [EDIT_NODES_LABEL, ALIGN_LABEL, THREE_D_VIEW_LABEL]) {
      const soonEntry: HTMLElement = await screen.findByRole('menuitem', { name: soonLabel });

      expect(soonEntry).toHaveAttribute(ARIA_DISABLED_ATTRIBUTE, 'true');
      expect(soonEntry).toHaveTextContent(SOON_TAG_TEXT);
    }
  });

  it('dispatches nothing from the coming-soon entries under More', async () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    fireEvent.click(screen.getByRole('button', { name: MORE_TOOLS_LABEL }));
    fireEvent.click(await screen.findByRole('menuitem', { name: EDIT_NODES_LABEL }));
    fireEvent.click(screen.getByRole('menuitem', { name: THREE_D_VIEW_LABEL }));

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('shows the zoom, Fit and bed colour controls in the header, never over the bed drawing', () => {
    renderPanel(newStore());

    const zoomGroup: HTMLElement = screen.getByRole('group', { name: 'Bed zoom' });

    expect(screen.getByTestId(BED_DROP_AREA_TEST_ID)).not.toContainElement(zoomGroup);
    expect(within(zoomGroup).getByRole('button', { name: 'Bed colour' })).toBeInTheDocument();
    expect(within(zoomGroup).getByRole('button', { name: /^Fit the bed/ })).toBeInTheDocument();
  });

  it('hands the drawer region below the header, so a drawer never covers the bed toolbar', () => {
    let regionElement: HTMLDivElement | null = null;

    render(
      <Provider store={newStore()}>
        <BedPanel hostRef={(element: HTMLDivElement | null) => {
          regionElement = element;
        }} isWide />
      </Provider>,
    );

    expect(regionElement).toContainElement(screen.getByTestId(BED_DROP_AREA_TEST_ID));
    expect(regionElement).not.toContainElement(screen.getByRole('radiogroup', { name: 'Bed view' }));
  });

  it('offers Select and Move as an active tool switch with Select chosen', () => {
    renderPanel(newStore());

    const toolGroup: HTMLElement = screen.getByRole('radiogroup', { name: TOOL_LABEL });

    expect(toolGroup.closest('[inert]')).toBeNull();
    expect(within(toolGroup).getByRole('radio', { name: SELECT_TOOL_LABEL })).toBeChecked();
    expect(within(toolGroup).getByRole('radio', { name: MOVE_TOOL_LABEL })).not.toBeChecked();
  });

  it('hands the Move tool to the bed, so a drag on empty bed moves the selection', () => {
    const store: AppStore = newStore();
    const projectObject: ProjectObject = newProjectObject({ name: OBJECT_NAME });

    Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
    mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
    renderPanel(store);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [projectObject], layers: [] } }));
      store.dispatch(new ProjectSelectionChanged({ objectIds: [projectObject.id] }));
    });
    fireEvent.click(screen.getByRole('radio', { name: MOVE_TOOL_LABEL }));

    const surface: HTMLElement = screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID);

    fireEvent.pointerDown(surface, { pointerId: POINTER_ID, clientX: DRAG_START_X, clientY: DRAG_START_Y });
    fireEvent.pointerUp(surface, {
      pointerId: POINTER_ID,
      clientX: DRAG_START_X + DRAG_RIGHT_MM,
      clientY: DRAG_START_Y,
    });

    expect(selectProjectObjects(store.getState())[0]).toMatchObject({ xMm: projectObject.xMm + DRAG_RIGHT_MM });
  });

  it('sends every dropped file to the import, in the order dropped', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const firstSvgFile: File = new File([SVG_TEXT], 'logo.svg');
    const secondSvgFile: File = new File([SVG_TEXT], 'badge', { type: SVG_MIME_TYPE });
    const photoFile: File = newPhotoFile();

    renderPanel(store);
    fireEvent.drop(screen.getByTestId(BED_DROP_AREA_TEST_ID), {
      dataTransfer: { files: [firstSvgFile, photoFile, secondSvgFile] },
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0]?.[0]).toBeInstanceOf(SvgFilesImportRequested);
    expect(dispatchSpy.mock.calls[0]?.[0]).toMatchObject({
      payload: { files: [firstSvgFile, photoFile, secondSvgFile] },
    });
  });

  it('names a dropped file that is not an SVG in an error toast and adds no object', async () => {
    const store: AppStore = newStore();

    renderPanel(store);
    fireEvent.drop(screen.getByTestId(BED_DROP_AREA_TEST_ID), {
      dataTransfer: { files: [newPhotoFile()] },
    });

    await vi.waitFor((): void => {
      expect(getNotSvgToasts(store)).toHaveLength(1);
    });
    expect(getNotSvgToasts(store)[0]).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: { fileName: PHOTO_FILE_NAME },
    });
    expect(selectProjectObjects(store.getState())).toEqual([]);
  });

  it('dispatches nothing when the drop holds no file', () => {
    const store: AppStore = newStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    fireEvent.drop(screen.getByTestId(BED_DROP_AREA_TEST_ID), { dataTransfer: { files: [] } });

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('highlights the bed while files are dragged over it', () => {
    renderPanel(newStore());

    const dropArea: HTMLElement = screen.getByTestId(BED_DROP_AREA_TEST_ID);

    expect(fireEvent.dragOver(dropArea, FILE_DRAG)).toBe(false);
    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, TRUE_TEXT);

    fireEvent.dragLeave(dropArea);

    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, FALSE_TEXT);

    fireEvent.dragOver(dropArea, FILE_DRAG);
    fireEvent.drop(dropArea, { dataTransfer: { files: [] } });

    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, FALSE_TEXT);
  });

  it('shows no highlight and does not accept a drag of text', () => {
    renderPanel(newStore());

    const dropArea: HTMLElement = screen.getByTestId(BED_DROP_AREA_TEST_ID);

    expect(fireEvent.dragOver(dropArea, TEXT_DRAG)).toBe(true);
    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, FALSE_TEXT);
  });

  it('keeps the highlight while the drag moves onto the bed drawing inside the area', () => {
    renderPanel(newStore());

    const dropArea: HTMLElement = screen.getByTestId(BED_DROP_AREA_TEST_ID);

    fireEvent.dragOver(dropArea, FILE_DRAG);
    // jsdom has no DragEvent, so the leave is sent as the mouse event it is based on, which carries relatedTarget.
    fireEvent(dropArea, new MouseEvent('dragleave', {
      bubbles: true,
      relatedTarget: screen.getByTestId(BED_OBJECTS_SURFACE_TEST_ID),
    }));

    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, TRUE_TEXT);
  });

  it('draws the project objects on the bed', () => {
    const store: AppStore = newStore();

    renderPanel(store);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: { objects: [newProjectObject({ name: OBJECT_NAME })], layers: [] },
      }));
    });

    expect(screen.getByRole('img', { name: OBJECT_NAME })).toBeInTheDocument();
  });
  it('switching to Toolpath requests a toolpath and hides the editing objects', () => {
    const store: AppStore = newHeldToolpathStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({
        document: { objects: [newProjectObject({ name: OBJECT_NAME })], layers: [] },
      }));
    });
    openToolpathView();

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ToolpathRequested));
    expect(screen.queryByTestId(BED_OBJECTS_SURFACE_TEST_ID)).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: OBJECT_NAME })).not.toBeInTheDocument();
  });

  it('shows the simulation playback bar in Toolpath view only', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });
    renderPanel(store);

    expect(screen.queryByRole('group', { name: PLAYBACK_BAR_LABEL })).not.toBeInTheDocument();

    openToolpathView();

    expect(screen.getByRole('group', { name: PLAYBACK_BAR_LABEL })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL }));

    expect(screen.queryByRole('group', { name: PLAYBACK_BAR_LABEL })).not.toBeInTheDocument();
  });

  it('offers only Design and Toolpath in the view switch', () => {
    renderPanel(newStore());

    expect(screen.queryByRole('radio', { name: THREE_D_VIEW_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: TOOLPATH_VIEW_LABEL })).toBeEnabled();
  });

  it('shows the job size in the playback bar in Toolpath view', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });
    renderPanel(store);
    openToolpathView();

    expect(within(screen.getByRole('group', { name: PLAYBACK_BAR_LABEL })).getByText(JOB_SIZE_TEXT))
      .toBeInTheDocument();
  });

  it('hides the editing tools in Toolpath view, where they do nothing', () => {
    renderPanel(newStore());

    openToolpathView();

    expect(screen.queryByRole('radiogroup', { name: TOOL_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: EDIT_NODES_LABEL, hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: VIEW_MODE_LABEL })).toBeInTheDocument();
  });

  it('editing the document in Toolpath view shows the Regenerate banner, hides the toolpath and disables play', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });
    renderPanel(store);
    openToolpathView();
    act(() => {
      store.dispatch(new SimulationPlayToggled());
    });

    expect(screen.getAllByTestId(TOOLPATH_BURN_PATH_TEST_ID)).not.toEqual([]);

    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    });

    expect(screen.getByText(OUT_OF_DATE_TEXT)).toBeInTheDocument();
    expect(screen.queryAllByTestId(TOOLPATH_BURN_PATH_TEST_ID)).toEqual([]);
    expect(screen.queryByText(JOB_SIZE_TEXT)).not.toBeInTheDocument();
    expect(selectIsSimulationPlaying(store.getState())).toBe(false);
    expect(selectIsSimulationPlayable(store.getState())).toBe(false);
  });

  it('regenerates the toolpath from the out-of-date banner', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });

    // Spied before the render: the panel keeps the dispatch it got when it first rendered.
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    openToolpathView();
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    });

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(ToolpathRequested));

    fireEvent.click(screen.getByRole('button', { name: REGENERATE_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ToolpathRequested));
  });

  it('shows the generation progress with a Cancel button that cancels it', () => {
    const store: AppStore = newHeldToolpathStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    openToolpathView();
    act(() => {
      store.dispatch(new ToolpathProgress({ progress: GENERATION_PROGRESS }));
    });

    expect(screen.getByText(GENERATING_TEXT)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ToolpathCancelled));
  });

  it('lists the text warning of an object in the Toolpath view', async () => {
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ name: OBJECT_NAME, svgText: TEXT_SVG_TEXT })],
    });

    renderPanel(store);
    openToolpathView();

    expect(await screen.findByText(TEXT_WARNING)).toBeInTheDocument();
    expect(screen.getByText(OBJECT_NAME)).toBeInTheDocument();
  });
});
