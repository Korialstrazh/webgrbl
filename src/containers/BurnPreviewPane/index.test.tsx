import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BurnPreviewPane } from '.';
import { BURN_PART_STATUS } from '../../utils/burn.model/burn.model.constants';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import { newBurnSceneRenderer } from '../../utils/burn.scene/burn.scene.runtime';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import {
  BurnModelReady,
  BurnPartLifted,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { newStore } from '../../utils/states/new.store';
import { ProjectUndoRequested } from '../../utils/states/project.document.state';

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
  resizeBurnScene: vi.fn(),
  getBurnPartIdAtPointer: vi.fn(() => PART_ID),
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
