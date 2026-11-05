import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BurnPreviewPane } from '.';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { BURN_PART_STATUS } from '../../utils/burn.model/burn.model.constants';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import { newBurnSceneRenderer } from '../../utils/burn.scene/burn.scene.runtime';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import { FakeBurnModelWorkerClient } from '../../utils/burn.model/test.support/fake.burn.model.worker.client';
import type { Material } from '../../utils/materials/interfaces/Material';
import { DEFAULT_MATERIAL_THICKNESS_MM } from '../../utils/materials/material.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { BedViewModeChanged } from '../../utils/states/bed.view.state';
import { BURN_MODEL_STATUS } from '../../utils/states/burn.model.status.constants';
import {
  BurnModelFailed,
  BurnModelReady,
  BurnModelRequested,
  BurnPartLifted,
  BurnPartSelected,
  selectBurnPartLiftMm,
  selectBurnModelStatus,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved } from '../../utils/states/material.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import {
  LayerToggled,
  ProjectMaterialSelected,
  ProjectUndoRequested,
} from '../../utils/states/project.document.state';
import { selectProjectId } from '../../utils/states/project.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from '../../utils/states/toolpath.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { FakeToolpathWorkerClient } from '../../utils/toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../../utils/toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../../utils/toolpath/test.support/new.toolpath.move';

const FIT_LABEL = /^Fit/;
const TOP_LABEL = /^Top/;
const NO_WEBGL_TEXT = 'The 3D view could not start in this browser. The Cut check still works.';
const LOADING_TEXT = 'Loading the 3D view';
const SCENE_CANVAS_SELECTOR = 'canvas';
const WEBGL_CONTEXT_LOST_EVENT = 'webglcontextlost';
const PART_ID = 1;
const LIFT_MM = 2;
const VIEW_WIDTH_PX = 200;
const VIEW_HEIGHT_PX = 100;
const CLICK_X_PX = 150;
const CLICK_Y_PX = 25;
const DRAG_DISTANCE_PX = 40;
const LAYER_KEY = '#ff0000';
const OUT_OF_DATE_TEXT = /^Out of date: the design changed/;
const NO_MATERIAL_TEXT = /^Add a material to see/;
const BUILDING_TEXT = 'Building the 3D view';
const FAILED_TEXT = /^The 3D view could not be built/;
const ADD_MATERIAL_LABEL = 'Add material\u2026';
const SAVE_LABEL = 'Save';
const TEST_MATERIAL: Material = newMaterial();

vi.mock('../../utils/burn.scene/burn.scene.runtime', () => ({
  newBurnSceneRenderer: vi.fn(),
}));

interface PickablePane {
  canvas: HTMLElement;
  store: ReturnType<typeof newStore>;
  renderer: BurnSceneRenderer;
}

const newFakeRenderer = (): BurnSceneRenderer => ({
  showBurnModel: vi.fn(),
  applyBurnPartLifts: vi.fn(),
  highlightBurnPart: vi.fn(),
  hoverBurnPart: vi.fn(),
  resizeBurnScene: vi.fn(),
  getBurnPartIdAtPointer: vi.fn(() => PART_ID),
  isBurnLiftAxisAtPoint: vi.fn(() => false),
  getBurnLiftChangeMm: vi.fn(({ yPx }: { yPx: number }) => -yPx),
  fitBurnSceneView: vi.fn(),
  showBurnSceneFromTop: vi.fn(),
  dispose: vi.fn(),
});

const newModel = (): BurnModel => ({
  parts: [{
    id: PART_ID,
    parentId: undefined,
    status: BURN_PART_STATUS.FREE,
    boundsMm: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    weakestLayerKey: undefined,
    weakestDepthMm: undefined,
  }],
  cutCheck: { freePartCount: 1, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: false },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  thicknessMm: 3,
});

const renderPane = (store: ReturnType<typeof newStore> = newStore()): ReturnType<typeof render> => render(
  <Provider store={store}>
    <BurnPreviewPane />
  </Provider>,
);

const getSceneCanvas = async (container: HTMLElement): Promise<HTMLElement> => vi.waitFor(() => {
  const canvas: HTMLElement | null = container.querySelector(SCENE_CANVAS_SELECTOR);

  if (!canvas) {
    throw new Error('expected the scene canvas');
  }

  return canvas;
});

describe(BurnPreviewPane.name, () => {
  beforeEach(() => {
    vi.mocked(newBurnSceneRenderer).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loading state until the runtime arrives, then gives the renderer its canvas', async () => {
    vi.mocked(newBurnSceneRenderer).mockReturnValue(newFakeRenderer());
    const { container } = renderPane();

    expect(screen.getByRole('status')).toHaveTextContent(LOADING_TEXT);

    await vi.waitFor(() => {
      expect(newBurnSceneRenderer).toHaveBeenCalledWith(container.querySelector(SCENE_CANVAS_SELECTOR));
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(NO_WEBGL_TEXT)).not.toBeInTheDocument();
  });

  it('shows the fixed message and no canvas when the renderer cannot start', async () => {
    vi.mocked(newBurnSceneRenderer).mockReturnValue(undefined);
    const { container } = renderPane();

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(container.querySelector(SCENE_CANVAS_SELECTOR)).not.toBeInTheDocument();
  });

  it('shows only the no-material message besides the fixed one when the scene is unavailable', async () => {
    vi.mocked(newBurnSceneRenderer).mockReturnValue(undefined);
    const store: ReturnType<typeof newStore> = newStore();

    store.dispatch(new MaterialSaved({ material: TEST_MATERIAL }));
    store.dispatch(new BurnModelRequested({ materialId: TEST_MATERIAL.id }));
    renderPane(store);

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(BUILDING_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(OUT_OF_DATE_TEXT)).not.toBeInTheDocument();
  });

  it('releases the renderer when the pane closes', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    const { container, unmount } = renderPane();
    const canvas: HTMLElement = await getSceneCanvas(container);

    unmount();

    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(canvas.isConnected).toBe(false);
  });

  it('shows the message and releases the renderer when the WebGL context is lost', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    const { container } = renderPane();
    const canvas: HTMLElement = await getSceneCanvas(container);

    await vi.waitFor(() => {
      expect(renderer.showBurnModel).toHaveBeenCalled();
    });
    fireEvent(canvas, new Event(WEBGL_CONTEXT_LOST_EVENT));

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(container.querySelector(SCENE_CANVAS_SELECTOR)).not.toBeInTheDocument();
  });

  it('draws a ready model with its lifts', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();
    const store: ReturnType<typeof newStore> = newStore();
    const model: BurnModel = newModel();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    store.dispatch(new BurnModelReady({ model }));
    renderPane(store);

    await vi.waitFor(() => {
      expect(renderer.showBurnModel).toHaveBeenLastCalledWith(model);
    });

    act(() => {
      store.dispatch(new BurnPartLifted({ partId: PART_ID, liftMm: LIFT_MM }));
    });

    expect(renderer.applyBurnPartLifts).toHaveBeenLastCalledWith({ [PART_ID]: LIFT_MM });
  });

  it('never draws a model that is out of date, so the scene is empty', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();
    const store: ReturnType<typeof newStore> = newStore();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    store.dispatch(new BurnModelReady({ model: newModel() }));
    renderPane(store);

    await vi.waitFor(() => {
      expect(renderer.showBurnModel).toHaveBeenCalled();
    });

    act(() => {
      store.dispatch(new ProjectUndoRequested());
    });

    expect(renderer.showBurnModel).toHaveBeenLastCalledWith(undefined);
  });

  it('explains that a model is out of date after a layer edit, and no longer once it is ready again', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();
    const store: AppStore = newStore();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    store.dispatch(new MaterialSaved({ material: TEST_MATERIAL }));
    store.dispatch(new ProjectMaterialSelected({ materialId: TEST_MATERIAL.id }));
    store.dispatch(new BurnModelReady({ model: newModel() }));
    renderPane(store);

    await vi.waitFor(() => {
      expect(renderer.showBurnModel).toHaveBeenCalledWith(expect.objectContaining({ thicknessMm: 3 }));
    });
    expect(screen.queryByText(OUT_OF_DATE_TEXT)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new LayerToggled({ layerKey: LAYER_KEY, enabled: false }));
    });

    expect(screen.getByText(OUT_OF_DATE_TEXT)).toBeInTheDocument();
    expect(renderer.showBurnModel).toHaveBeenLastCalledWith(undefined);

    act(() => {
      store.dispatch(new BurnModelReady({ model: newModel() }));
    });

    expect(screen.queryByText(OUT_OF_DATE_TEXT)).not.toBeInTheDocument();
  });

  it('asks for a material, builds nothing, and adding one selects it and builds', async () => {
    const burnModelClient: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true), burnModelClient);

    vi.mocked(newBurnSceneRenderer).mockReturnValue(newFakeRenderer());
    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).toBeDefined();
    });
    act(() => {
      store.dispatch(new ToolpathReady({
        toolpath: newToolpath({ moves: [newToolpathMove()], bounds: { minX: 0, minY: 0, maxX: 10, maxY: 0 } }),
        documentVersion: selectToolpathDocumentVersion(store.getState()),
      }));
      store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    });
    render(
      <Provider store={store}>
        <AntdTestProvider>
          <BedRegionTestHost>
            <BurnPreviewPane />
          </BedRegionTestHost>
        </AntdTestProvider>
      </Provider>,
    );

    expect(screen.getByText(NO_MATERIAL_TEXT)).toBeInTheDocument();
    expect(burnModelClient.generationInputs).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: ADD_MATERIAL_LABEL }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Oak' } });
    fireEvent.click(screen.getByRole('button', { name: SAVE_LABEL }));

    await vi.waitFor((): void => {
      expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
    });

    expect(selectActiveMaterial(store.getState())?.thicknessMm).toBe(DEFAULT_MATERIAL_THICKNESS_MM);
    expect(burnModelClient.generationInputs).toHaveLength(1);
    expect(screen.queryByText(NO_MATERIAL_TEXT)).not.toBeInTheDocument();
  });

  it('explains a running and a failed build', async () => {
    const store: AppStore = newStore();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(newFakeRenderer());
    store.dispatch(new MaterialSaved({ material: TEST_MATERIAL }));
    store.dispatch(new ProjectMaterialSelected({ materialId: TEST_MATERIAL.id }));
    store.dispatch(new ToolpathRequested());
    store.dispatch(new ToolpathReady({
      toolpath: newToolpath(),
      documentVersion: selectToolpathDocumentVersion(store.getState()),
    }));
    store.dispatch(new BurnModelRequested({ materialId: TEST_MATERIAL.id }));
    renderPane(store);

    expect(screen.getByText(BUILDING_TEXT)).toBeInTheDocument();

    act(() => {
      store.dispatch(new BurnModelFailed());
    });

    expect(screen.getByText(FAILED_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(BUILDING_TEXT)).not.toBeInTheDocument();
  });

  it('still asks for a material when the scene cannot start', async () => {
    vi.mocked(newBurnSceneRenderer).mockReturnValue(undefined);
    renderPane();

    expect(await screen.findByText(NO_WEBGL_TEXT)).toBeInTheDocument();
    expect(screen.getByText(NO_MATERIAL_TEXT)).toBeInTheDocument();
  });

  it('offers Fit and Top once a model is on show, and they move the view', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();
    const store: AppStore = newStore();

    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    const { container } = renderPane(store);

    await getSceneCanvas(container);
    expect(screen.queryByRole('button', { name: FIT_LABEL })).not.toBeInTheDocument();

    act(() => {
      store.dispatch(new BurnModelReady({ model: newModel() }));
    });
    fireEvent.click(await screen.findByRole('button', { name: TOP_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: FIT_LABEL }));

    expect(screen.getByRole('button', { name: FIT_LABEL }).querySelector('.anticon')).not.toBeNull();
    expect(screen.getByRole('button', { name: TOP_LABEL }).querySelector('.anticon')).not.toBeNull();
    expect(screen.getByRole('button', { name: FIT_LABEL })).not.toHaveTextContent('Fit');
    expect(renderer.showBurnSceneFromTop).toHaveBeenCalledTimes(1);
    expect(renderer.fitBurnSceneView).toHaveBeenCalledTimes(1);
  });

  it('tells the renderer the size of the view', async () => {
    const renderer: BurnSceneRenderer = newFakeRenderer();

    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(VIEW_WIDTH_PX);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(VIEW_HEIGHT_PX);
    vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
    renderPane();

    await vi.waitFor(() => {
      expect(renderer.resizeBurnScene).toHaveBeenCalledWith({ widthPx: VIEW_WIDTH_PX, heightPx: VIEW_HEIGHT_PX });
    });
  });

  describe('picking', () => {
    const renderPickablePane = async (): Promise<PickablePane> => {
      const renderer: BurnSceneRenderer = newFakeRenderer();
      const store: ReturnType<typeof newStore> = newStore();

      vi.mocked(newBurnSceneRenderer).mockReturnValue(renderer);
      store.dispatch(new BurnModelReady({ model: newModel() }));
      const { container } = renderPane(store);
      const canvas: HTMLElement = await getSceneCanvas(container);

      await vi.waitFor(() => {
        expect(renderer.showBurnModel).toHaveBeenCalled();
      });
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, VIEW_WIDTH_PX, VIEW_HEIGHT_PX));

      return { canvas, store, renderer };
    };

    it('selects the part under a click, with the pointer in normalized device coordinates', async () => {
      const { canvas, store, renderer } = await renderPickablePane();

      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });

      expect(renderer.getBurnPartIdAtPointer).toHaveBeenCalledWith({ xNdc: 0.5, yNdc: 0.5 });
      expect(selectSelectedBurnPartId(store.getState())).toBe(PART_ID);
    });

    it('does not select when the pointer dragged the scene, even if it came back', async () => {
      const { canvas, store, renderer } = await renderPickablePane();

      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerMove(canvas, { clientX: CLICK_X_PX + DRAG_DISTANCE_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });

      expect(renderer.getBurnPartIdAtPointer).not.toHaveBeenCalled();
      expect(selectSelectedBurnPartId(store.getState())).toBeUndefined();
    });

    it('does not select when a second finger touches the scene, as in a pinch', async () => {
      const { canvas, renderer } = await renderPickablePane();

      fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 2, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, pointerId: 2, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, pointerId: 1, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });

      expect(renderer.getBurnPartIdAtPointer).not.toHaveBeenCalled();
    });

    it('highlights the part a click selects', async () => {
      const { canvas, renderer } = await renderPickablePane();

      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });

      expect(renderer.highlightBurnPart).toHaveBeenLastCalledWith(PART_ID);
    });

    it('lifts the selected part by dragging its axis, without selecting or reaching the orbit controls', async () => {
      const { canvas, store, renderer } = await renderPickablePane();
      const reachedOrbitControls = vi.fn();

      canvas.setPointerCapture = vi.fn();
      canvas.addEventListener('pointerdown', reachedOrbitControls);
      store.dispatch(new BurnPartSelected({ partId: PART_ID }));
      vi.mocked(renderer.isBurnLiftAxisAtPoint).mockReturnValue(true);

      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerMove(canvas, { clientX: CLICK_X_PX, clientY: CLICK_Y_PX - 500 });
      expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(500);

      fireEvent.pointerMove(canvas, { clientX: CLICK_X_PX, clientY: CLICK_Y_PX + 50 });
      expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(0);

      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX + 50 });

      expect(reachedOrbitControls).not.toHaveBeenCalled();
      expect(renderer.getBurnPartIdAtPointer).not.toHaveBeenCalled();
      expect(selectSelectedBurnPartId(store.getState())).toBe(PART_ID);
    });

    describe('hover', () => {
      const HOVER_WAIT_MS = 100;

      it('highlights the part under a resting mouse with a pointer cursor, reading many moves as one', async () => {
        const { canvas, renderer } = await renderPickablePane();

        fireEvent.pointerMove(canvas, { clientX: 10, clientY: 10, buttons: 0 });
        fireEvent.pointerMove(canvas, { clientX: 12, clientY: 10, buttons: 0 });

        await vi.waitFor(() => {
          expect(renderer.hoverBurnPart).toHaveBeenLastCalledWith(PART_ID);
        });
        expect(renderer.getBurnPartIdAtPointer).toHaveBeenCalledTimes(1);
        expect(canvas.style.cursor).toBe('pointer');

        fireEvent.pointerLeave(canvas);

        await vi.waitFor(() => {
          expect(renderer.hoverBurnPart).toHaveBeenLastCalledWith(undefined);
        });
        expect(canvas.style.cursor).toBe('');
      });

      it('reads nothing during a drag', async () => {
        const { canvas, renderer } = await renderPickablePane();

        fireEvent.pointerMove(canvas, { clientX: 10, clientY: 10, buttons: 1 });
        await act(async () => {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, HOVER_WAIT_MS);
          });
        });

        expect(renderer.getBurnPartIdAtPointer).not.toHaveBeenCalled();
      });
    });

    it('clears the selection on a click that hits no part', async () => {
      const { canvas, store, renderer } = await renderPickablePane();

      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      vi.mocked(renderer.getBurnPartIdAtPointer).mockReturnValue(undefined);
      fireEvent.pointerDown(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });
      fireEvent.pointerUp(canvas, { button: 0, clientX: CLICK_X_PX, clientY: CLICK_Y_PX });

      expect(selectSelectedBurnPartId(store.getState())).toBeUndefined();
    });
  });
});
