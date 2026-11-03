import { BufferGeometry, OrthographicCamera, Vector3 } from 'three';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import { BURN_SCENE_MAX_POLAR_ANGLE_RADIANS } from './burn.scene.constants';
import { newBurnSceneRenderer } from './burn.scene.runtime';
import type { BurnSceneRenderer } from './interfaces/BurnSceneRenderer';
import { newBurnSceneTestModel } from './test.support/new.burn.scene.test.model';

const HIGH_DEVICE_PIXEL_RATIO = 3;
const CAPPED_PIXEL_RATIO = 2;
const VIEW_WIDTH_PX = 400;
const VIEW_HEIGHT_PX = 200;

const fakeWebGlRenderer = vi.hoisted(() => ({
  domElement: document.createElement('canvas'),
  setPixelRatio: vi.fn(),
  setClearColor: vi.fn(),
  setSize: vi.fn(),
  render: vi.fn(),
  clear: vi.fn(),
  dispose: vi.fn(),
  forceContextLoss: vi.fn(),
}));

vi.mock('three', async (importOriginal: () => Promise<object>) => ({
  ...(await importOriginal()),
  WebGLRenderer: vi.fn(function fakeRendererConstructor() {
    return fakeWebGlRenderer;
  }),
}));

const newRenderer = (): BurnSceneRenderer => {
  const renderer: BurnSceneRenderer | undefined = newBurnSceneRenderer(document.createElement('canvas'));

  if (!renderer) {
    throw new Error('expected a renderer');
  }

  return renderer;
};

describe('the burn scene renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('devicePixelRatio', HIGH_DEVICE_PIXEL_RATIO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('caps the device pixel ratio', () => {
    newRenderer();

    expect(fakeWebGlRenderer.setPixelRatio).toHaveBeenCalledWith(CAPPED_PIXEL_RATIO);
  });

  it('renders only on demand: for a model, a lift and a resize, and never by itself', () => {
    const renderer: BurnSceneRenderer = newRenderer();
    const model: BurnModel = newBurnSceneTestModel();

    expect(fakeWebGlRenderer.render).not.toHaveBeenCalled();

    renderer.showBurnModel(model);
    expect(fakeWebGlRenderer.render).toHaveBeenCalledTimes(1);

    renderer.applyBurnPartLifts({ 1: 1 });
    expect(fakeWebGlRenderer.render).toHaveBeenCalledTimes(2);

    renderer.resizeBurnScene({ widthPx: VIEW_WIDTH_PX, heightPx: VIEW_HEIGHT_PX });
    expect(fakeWebGlRenderer.setSize).toHaveBeenCalledWith(VIEW_WIDTH_PX, VIEW_HEIGHT_PX, false);
    expect(fakeWebGlRenderer.render).toHaveBeenCalledTimes(3);
  });

  it('draws nothing and picks nothing once the model is taken away', () => {
    const renderer: BurnSceneRenderer = newRenderer();

    renderer.showBurnModel(newBurnSceneTestModel());
    fakeWebGlRenderer.render.mockClear();
    renderer.showBurnModel(undefined);

    expect(fakeWebGlRenderer.render).not.toHaveBeenCalled();
    expect(fakeWebGlRenderer.clear).toHaveBeenCalledTimes(1);
    expect(renderer.getBurnPartIdAtPointer({ xNdc: 0, yNdc: 0 })).toBeUndefined();
  });

  it('gives the WebGL context back on dispose, because browsers cap live contexts', () => {
    const renderer: BurnSceneRenderer = newRenderer();

    renderer.showBurnModel(newBurnSceneTestModel());
    renderer.dispose();

    expect(fakeWebGlRenderer.forceContextLoss).toHaveBeenCalledTimes(1);
    expect(fakeWebGlRenderer.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('the burn scene camera across models', () => {
  const getLastDrawnCamera = (): unknown => fakeWebGlRenderer.render.mock.lastCall?.[1];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the camera, with the orbit and zoom of the user, through a rebuild of the same sheet', () => {
    const renderer: BurnSceneRenderer = newRenderer();

    renderer.showBurnModel(newBurnSceneTestModel());
    const firstCamera: unknown = getLastDrawnCamera();

    renderer.showBurnModel(undefined);
    renderer.showBurnModel(newBurnSceneTestModel());

    expect(getLastDrawnCamera()).toBe(firstCamera);
  });

  it('frames again for a sheet of another size or thickness', () => {
    const renderer: BurnSceneRenderer = newRenderer();
    const model: BurnModel = newBurnSceneTestModel();

    renderer.showBurnModel(model);
    const firstCamera: unknown = getLastDrawnCamera();

    renderer.showBurnModel({ ...model, thicknessMm: model.thicknessMm + 1 });
    const thickerSheetCamera: unknown = getLastDrawnCamera();

    renderer.showBurnModel({
      ...model,
      thicknessMm: model.thicknessMm + 1,
      sheetBounds: { ...model.sheetBounds, maxX: model.sheetBounds.maxX + 1 },
    });

    expect(thickerSheetCamera).not.toBe(firstCamera);
    expect(getLastDrawnCamera()).not.toBe(thickerSheetCamera);
  });

  describe('the view buttons', () => {
    const getDrawnCamera = (): OrthographicCamera => {
      const camera: unknown = getLastDrawnCamera();

      if (!(camera instanceof OrthographicCamera)) {
        throw new Error('expected an orthographic camera');
      }

      return camera;
    };
    const getAngleFromVerticalDegrees = (camera: OrthographicCamera): number => {
      const viewDirection: Vector3 = camera.getWorldDirection(new Vector3()).negate();

      return (viewDirection.angleTo(new Vector3(0, 0, 1)) * 180) / Math.PI;
    };

    it('looks straight down from Top, with +Y up on screen, and draws on demand', () => {
      const renderer: BurnSceneRenderer = newRenderer();

      renderer.showBurnModel(newBurnSceneTestModel());
      fakeWebGlRenderer.render.mockClear();
      renderer.showBurnSceneFromTop();

      const camera: OrthographicCamera = getDrawnCamera();

      expect(fakeWebGlRenderer.render).toHaveBeenCalled();
      expect(getAngleFromVerticalDegrees(camera)).toBeLessThan(1);
      expect(new Vector3(0, 1, 0).transformDirection(camera.matrixWorld).y).toBeGreaterThan(0);
    });

    it('brings back the first view and the first zoom from Fit', () => {
      const renderer: BurnSceneRenderer = newRenderer();

      renderer.showBurnModel(newBurnSceneTestModel());

      const camera: OrthographicCamera = getDrawnCamera();
      const firstPosition: Vector3 = camera.position.clone();

      renderer.showBurnSceneFromTop();
      camera.zoom = 3;
      renderer.fitBurnSceneView();

      expect(camera.position.distanceTo(firstPosition)).toBeCloseTo(0);
      expect(camera.zoom).toBe(1);
    });

    it('does nothing with no model', () => {
      const renderer: BurnSceneRenderer = newRenderer();

      renderer.fitBurnSceneView();
      renderer.showBurnSceneFromTop();

      expect(fakeWebGlRenderer.render).not.toHaveBeenCalled();
    });
  });

  it('stops the orbit above edge-on', () => {
    expect((BURN_SCENE_MAX_POLAR_ANGLE_RADIANS * 180) / Math.PI).toBeCloseTo(80);
  });

  it('draws again when the highlight changes', () => {
    const renderer: BurnSceneRenderer = newRenderer();

    renderer.showBurnModel(newBurnSceneTestModel());
    fakeWebGlRenderer.render.mockClear();
    renderer.highlightBurnPart(1);

    expect(fakeWebGlRenderer.render).toHaveBeenCalledTimes(1);
  });
});

describe('the burn scene renderer memory', () => {
  it('frees the geometry of each mesh and its outline when the model changes', () => {
    const disposeSpy = vi.spyOn(BufferGeometry.prototype, 'dispose');
    const renderer: BurnSceneRenderer = newRenderer();
    const model: BurnModel = newBurnSceneTestModel();

    renderer.showBurnModel(model);
    disposeSpy.mockClear();

    renderer.showBurnModel(undefined);

    expect(disposeSpy).toHaveBeenCalledTimes(model.meshes.length * 2);
    disposeSpy.mockRestore();
  });
});
