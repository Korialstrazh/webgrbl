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
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from '../../utils/profiles/machine.profile.constants';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { newProjectObject } from '../../utils/project/new.project.object';
import { BedViewModeChanged, selectBedViewMode } from '../../utils/states/bed.view.state';
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
import { selectSelectedObjectIds } from '../../utils/states/project.selection.state';
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
const NO_MACHINE_TEXT = 'Add a laser profile to set the bed size';
const WORK_POSITION: GrblAxisPosition = { x: 10, y: 20, z: 0 };
const WORK_COORDINATE_OFFSET: GrblAxisPosition = { x: 100, y: 30, z: 0 };
const EXPECTED_HEAD_TRANSFORM = 'translate(10 380) scale(1)';
const VIEW_MODE_LABEL = 'Bed view';
const DESIGN_VIEW_LABEL = 'Design';
const PROFILE_WIDTH_MM = 300;
const PROFILE_HEIGHT_MM = 200;
const PROFILE_BED_LABEL = 'Laser bed, 300 by 200 mm';
const OBJECT_NAME = 'Logo';
const EDIT_NODES_LABEL = /^Edit nodes/;
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
const REGENERATE_LABEL = 'Regenerate';
const OUT_OF_DATE_TEXT = 'Out of date';
const BED_ZOOM_LABEL = 'Bed zoom';
const MATERIAL_LABEL = 'Material';
const ADD_TEST_SAMPLE_LABEL = 'Add test sample';
const CANCEL_LABEL = 'Cancel';
const GENERATING_TEXT = `Generating${HORIZONTAL_ELLIPSIS} 40 %`;
const GENERATION_PROGRESS = 0.4;
const TOOLPATH_WARNINGS_CHIP_LABEL = 'Toolpath warnings (1): show them';
const TEXT_WARNING = 'Text is not converted to paths. In Inkscape use Path > Object to Path.';
const TEXT_WARNING_SHORT = 'Text not converted';
const WARNED_OBJECT_ID = 'warned-object';
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

// jsdom has no WebGL and three.js is not what these tests are about.
vi.mock('../../utils/burn.scene/burn.scene.runtime', () => ({
  newBurnSceneRenderer: () => ({ dispose: (): void => undefined }),
}));

const newPhotoFile = (): File => new File(['png'], PHOTO_FILE_NAME, { type: 'image/png' });

const getNotSvgToasts = (store: AppStore): AppToast[] => selectToasts(store.getState()).filter(
  (toast: AppToast): boolean => toast.messageKey === DEFAULT.TOAST_SVG_IMPORT_FAILED_NOT_SVG,
);

const newHeldToolpathStore = (): AppStore => newStore(undefined, new FakeToolpathWorkerClient(true));

const putReadyToolpath = (store: AppStore, toolpath: Toolpath): void => {
  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({ toolpath, documentVersion: selectToolpathDocumentVersion(store.getState()) }));
};

const openThreeDView = (): void => {
  fireEvent.click(screen.getByRole('radio', { name: THREE_D_VIEW_LABEL }));
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

    expect(screen.getByRole('img', { name: NO_MACHINE_TEXT })).toBeInTheDocument();
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
    expect(screen.queryByRole('img', { name: NO_MACHINE_TEXT })).not.toBeInTheDocument();
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

  it('moves the head from work zero when the machine was turned on somewhere else on the bed', () => {
    const store: AppStore = newStore();
    const offset = { x: -100, y: -80, z: 0 };

    renderPanel(store);
    act(() => {
      store.dispatch(new MachineStatusReceived({
        status: { ...newPositionOnlyReport(), workCoordinateOffset: offset, workPosition: { x: 20, y: 10, z: 0 } },
      }));
    });

    const headTransform: string | null = screen.getByTestId(BED_HEAD_TEST_ID).getAttribute('transform');

    expect(headTransform).toContain('translate(20');
  });

  it('names the view mode selector and shows Design as selected', () => {
    renderPanel(newStore());

    expect(screen.getByRole('radiogroup', { name: VIEW_MODE_LABEL, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL, hidden: true })).toBeChecked();
  });

  it('moves the checked state of the view mode selector to the chosen view', () => {
    renderPanel(newStore());

    openToolpathView();

    expect(screen.getByRole('radio', { name: TOOLPATH_VIEW_LABEL, hidden: true })).toBeChecked();
    expect(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL, hidden: true })).not.toBeChecked();
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

  it('shows the views as an icon over one word, and Fit as an icon with an accessible name', () => {
    renderPanel(newStore());

    for (const label of [DESIGN_VIEW_LABEL, TOOLPATH_VIEW_LABEL, '3D']) {
      const radio: HTMLElement = screen.getByRole('radio', { name: label });
      const option: HTMLElement | null = radio.closest('label');

      expect(option?.querySelector('.anticon')).not.toBeNull();
      expect(option).toHaveTextContent(label);
    }

    const fitButton: HTMLElement = screen.getByRole('button', { name: /^Fit the bed/ });

    expect(fitButton.querySelector('.anticon')).not.toBeNull();
    expect(fitButton).not.toHaveTextContent('Fit');
  });

  it('keeps the view switch in one fixed slot at the end of the header in all three views', () => {
    renderPanel(newHeldToolpathStore());

    const getSwitchSlot = (): HTMLElement | null =>
      screen.getByRole('radiogroup', { name: VIEW_MODE_LABEL }).parentElement;
    const designSlot: HTMLElement | null = getSwitchSlot();
    const headerElement: HTMLElement | null | undefined = designSlot?.parentElement;

    expect(headerElement?.lastElementChild).toBe(designSlot);
    expect(designSlot?.childElementCount).toBe(1);

    openToolpathView();

    expect(getSwitchSlot()).toBe(designSlot);

    openThreeDView();

    expect(getSwitchSlot()).toBe(designSlot);
    expect(designSlot?.childElementCount).toBe(1);
  });

  it('has no tool switch: a drag on an object moves it', () => {
    const store: AppStore = newStore();
    const projectObject: ProjectObject = newProjectObject({ name: OBJECT_NAME });

    Object.defineProperty(Element.prototype, 'setPointerCapture', { configurable: true, value: vi.fn() });
    mockSvgScreenMatrix(IDENTITY_SVG_MATRIX, IDENTITY_SVG_MATRIX);
    renderPanel(store);
    act(() => {
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [projectObject], layers: [] } }));
    });

    expect(screen.queryByRole('radiogroup', { name: 'Bed tool' })).not.toBeInTheDocument();

    const objectElement: HTMLElement = screen.getByRole('img', { name: OBJECT_NAME });

    fireEvent.pointerDown(objectElement, { pointerId: POINTER_ID, clientX: DRAG_START_X, clientY: DRAG_START_Y });
    fireEvent.pointerMove(objectElement, {
      pointerId: POINTER_ID,
      clientX: DRAG_START_X + DRAG_RIGHT_MM,
      clientY: DRAG_START_Y,
    });
    fireEvent.pointerUp(objectElement, {
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

  it('offers Design, Toolpath and 3D in the view switch', () => {
    renderPanel(newStore());

    expect(screen.getByRole('radio', { name: DESIGN_VIEW_LABEL })).toBeEnabled();
    expect(screen.getByRole('radio', { name: TOOLPATH_VIEW_LABEL })).toBeEnabled();
    expect(screen.getByRole('radio', { name: THREE_D_VIEW_LABEL })).toBeEnabled();
  });

  it('choosing 3D stores the view mode and requests a toolpath when there is none', () => {
    const store: AppStore = newHeldToolpathStore();
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    openThreeDView();

    expect(dispatchSpy).toHaveBeenCalledWith(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ToolpathRequested));
    expect(selectBedViewMode(store.getState())).toBe(BED_VIEW_MODE.THREE_D);
    expect(screen.getByRole('radio', { name: THREE_D_VIEW_LABEL })).toBeChecked();
  });

  it('choosing 3D requests a new toolpath when the last one is out of date', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
      store.dispatch(new ProjectDocumentLoaded({ document: { objects: [newProjectObject()], layers: [] } }));
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    openThreeDView();

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(ToolpathRequested));
  });

  it('choosing 3D keeps a ready toolpath', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });
    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');

    renderPanel(store);
    openThreeDView();

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(ToolpathRequested));
  });

  it('shows the toolpath progress over the 3D view', () => {
    renderPanel(newHeldToolpathStore());
    openThreeDView();

    expect(screen.getByText(/^Generating/)).toBeInTheDocument();
  });

  it('leaves the bed, its zoom and colour controls and the editing tools out of 3D', () => {
    renderPanel(newHeldToolpathStore());
    openThreeDView();

    expect(screen.queryByRole('group', { name: BED_ZOOM_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByTestId(BED_OBJECTS_SURFACE_TEST_ID)).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: PLAYBACK_BAR_LABEL })).not.toBeInTheDocument();
  });

  it('offers the test sample on the card of an empty bed, not in the 3D view', () => {
    renderPanel(newHeldToolpathStore());

    expect(screen.getByRole('button', { name: ADD_TEST_SAMPLE_LABEL })).toBeInTheDocument();

    openThreeDView();

    expect(screen.queryByRole('button', { name: ADD_TEST_SAMPLE_LABEL })).not.toBeInTheDocument();
  });

  it('leaves the material select to the design panel; 3D shows the material as text', () => {
    renderPanel(newHeldToolpathStore());

    expect(screen.queryByRole('combobox', { name: MATERIAL_LABEL })).not.toBeInTheDocument();

    openThreeDView();

    expect(screen.getByText('Material: none')).toBeInTheDocument();
  });

  it('takes no SVG drop in 3D, where there is no bed to drop on, and keeps the browser from opening the file', () => {
    const store: AppStore = newHeldToolpathStore();

    renderPanel(store);
    openThreeDView();

    const dispatchSpy: MockInstance<AppDispatch> = vi.spyOn(store, 'dispatch');
    const dropArea: HTMLElement = screen.getByTestId(BED_DROP_AREA_TEST_ID);
    const isDragOverNotCancelled: boolean = fireEvent.dragOver(dropArea, FILE_DRAG);

    expect(isDragOverNotCancelled).toBe(false);
    expect(dropArea).toHaveAttribute(DROP_TARGET_ATTRIBUTE, FALSE_TEXT);

    const isDropNotCancelled: boolean = fireEvent.drop(dropArea, {
      dataTransfer: { files: [new File([SVG_TEXT], 'logo.svg')] },
    });

    expect(isDropNotCancelled).toBe(false);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('leaves the job size out of the playback bar in Toolpath view, as the status strip shows it', () => {
    const store: AppStore = newHeldToolpathStore();

    act(() => {
      putReadyToolpath(store, SIXTY_SIX_SECOND_TOOLPATH);
    });
    renderPanel(store);
    openToolpathView();

    expect(within(screen.getByRole('group', { name: PLAYBACK_BAR_LABEL })).queryByText(JOB_SIZE_TEXT))
      .not.toBeInTheDocument();
  });

  it('hides the editing tools in Toolpath view, where they do nothing', () => {
    renderPanel(newStore());

    openToolpathView();

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

  it('lists the text warning of an object behind the Toolpath view warnings chip', async () => {
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ name: OBJECT_NAME, svgText: TEXT_SVG_TEXT })],
    });

    renderPanel(store);
    openToolpathView();
    fireEvent.click(await screen.findByRole('button', { name: TOOLPATH_WARNINGS_CHIP_LABEL }));

    expect(await screen.findByText(TEXT_WARNING)).toBeInTheDocument();
    expect(screen.getByText(OBJECT_NAME)).toBeInTheDocument();
    expect(screen.getByText(TEXT_WARNING_SHORT)).toBeInTheDocument();
  });

  it('selects the object of a warning from its Show button in the warnings list', async () => {
    const store: AppStore = await newGcodeExportTestStore({
      objects: [newProjectObject({ id: WARNED_OBJECT_ID, name: OBJECT_NAME, svgText: TEXT_SVG_TEXT })],
    });

    renderPanel(store);
    openToolpathView();
    fireEvent.click(await screen.findByRole('button', { name: TOOLPATH_WARNINGS_CHIP_LABEL }));
    fireEvent.click(await screen.findByRole('button', { name: `Show ${OBJECT_NAME} on the bed` }));

    expect(selectSelectedObjectIds(store.getState())).toEqual([WARNED_OBJECT_ID]);
  });
});
