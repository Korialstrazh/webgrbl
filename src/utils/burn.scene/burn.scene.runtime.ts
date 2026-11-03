/**
 * The 3D runtime: the renderer of the preview, reached by the app only through a dynamic import of this module, so
 * that three.js stays in a chunk loaded on demand. It draws on demand only, never in a loop.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  AmbientLight,
  DirectionalLight,
  Scene,
  WebGLRenderer,
} from 'three';
import type { OrthographicCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import type { ElementSizePx } from '../hooks/interfaces/ElementSizePx';
import { getBurnPartMaxLiftMm } from '../burn.model/get.burn.part.max.lift.mm';
import { applyBurnPartHighlight } from './apply.burn.part.highlight';
import { applyBurnPartLifts } from './apply.burn.part.lifts';
import {
  BURN_SCENE_AMBIENT_LIGHT_COLOUR,
  BURN_SCENE_AMBIENT_LIGHT_INTENSITY,
  BURN_SCENE_BACKGROUND_COLOUR,
  BURN_SCENE_CONTROLS_CHANGE_EVENT,
  BURN_SCENE_KEY_LIGHT_COLOUR,
  BURN_SCENE_KEY_LIGHT_DIRECTION,
  BURN_SCENE_KEY_LIGHT_INTENSITY,
  BURN_SCENE_MAX_PIXEL_RATIO,
  BURN_SCENE_MAX_POLAR_ANGLE_RADIANS,
} from './burn.scene.constants';
import { getBurnPartAtPointer } from './get.burn.part.at.pointer';
import { getBurnSceneFrameCentre } from './get.burn.scene.frame.centre';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';
import type { BurnSceneModelFraming } from './interfaces/BurnSceneModelFraming';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import type { BurnScenePointer } from './interfaces/BurnScenePointer';
import type { BurnSceneRenderer } from './interfaces/BurnSceneRenderer';
import { newBurnSceneCamera } from './new.burn.scene.camera';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { setBurnSceneCameraFrustum } from './set.burn.scene.camera.frustum';

const BURN_SCENE_RENDERER_ERROR_LOG_MESSAGE = 'Starting the 3D renderer failed';

const isSameBurnSheet = (first: BurnSceneModelFraming, second: BurnSceneModelFraming): boolean =>
  first.thicknessMm === second.thicknessMm
  && first.sheetBounds.minX === second.sheetBounds.minX
  && first.sheetBounds.minY === second.sheetBounds.minY
  && first.sheetBounds.maxX === second.sheetBounds.maxX
  && first.sheetBounds.maxY === second.sheetBounds.maxY;

class WebGlBurnSceneRenderer implements BurnSceneRenderer {
  // Draws on the canvas.
  private readonly webGlRenderer: WebGLRenderer;

  // Holds the lights, and the objects of the model while there is one.
  private readonly scene: Scene = new Scene();

  // The objects of the model on show, the camera and the orbit controls of that camera.
  private objects: BurnSceneObjects | undefined;

  private camera: OrthographicCamera | undefined;

  private controls: OrbitControls | undefined;

  // What the camera is framed to, kept while the scene is empty so that a rebuild can keep the view.
  private modelFraming: BurnSceneModelFraming | undefined;

  // Width of the view divided by its height, known before the first model arrives.
  private aspectRatio = 1;

  constructor(webGlRenderer: WebGLRenderer) {
    const [lightX, lightY, lightZ] = BURN_SCENE_KEY_LIGHT_DIRECTION;
    const keyLight: DirectionalLight = new DirectionalLight(
      BURN_SCENE_KEY_LIGHT_COLOUR,
      BURN_SCENE_KEY_LIGHT_INTENSITY,
    );

    keyLight.position.set(lightX, lightY, lightZ);
    this.scene.add(new AmbientLight(BURN_SCENE_AMBIENT_LIGHT_COLOUR, BURN_SCENE_AMBIENT_LIGHT_INTENSITY), keyLight);
    this.webGlRenderer = webGlRenderer;
    this.webGlRenderer.setPixelRatio(Math.min(window.devicePixelRatio, BURN_SCENE_MAX_PIXEL_RATIO));
    this.webGlRenderer.setClearColor(BURN_SCENE_BACKGROUND_COLOUR);
  }

  public showBurnModel(model: BurnModel | undefined): void {
    this.removeModelObjects();

    if (model) {
      this.objects = newBurnSceneObjects(model);
      this.scene.add(this.objects.group);
      this.updateCameraForBurnModel(model);
    }

    this.drawScene();
  }

  public applyBurnPartLifts(liftsMm: BurnPartLiftsMm): void {
    if (this.objects) {
      applyBurnPartLifts(this.objects, liftsMm);
      this.drawScene();
    }
  }

  public highlightBurnPart(partId: number | undefined): void {
    if (this.objects) {
      applyBurnPartHighlight(this.objects, partId);
      this.drawScene();
    }
  }

  public resizeBurnScene({ widthPx, heightPx }: ElementSizePx): void {
    this.aspectRatio = widthPx / heightPx;
    this.webGlRenderer.setSize(widthPx, heightPx, false);

    if (this.camera && this.modelFraming) {
      setBurnSceneCameraFrustum(this.camera, { ...this.modelFraming, aspectRatio: this.aspectRatio });
    }

    this.drawScene();
  }

  public getBurnPartIdAtPointer(pointer: BurnScenePointer): number | undefined {
    return this.objects && this.camera ? getBurnPartAtPointer(this.objects, this.camera, pointer) : undefined;
  }

  public dispose(): void {
    this.removeModelObjects();
    this.removeCameraAndControls();
    // dispose() alone leaves the context alive until garbage collection, and browsers cap live WebGL contexts, so
    // switching the 3D view on and off again would soon push out the oldest one.
    this.webGlRenderer.forceContextLoss();
    this.webGlRenderer.dispose();
  }

  /** A rebuild of the same sheet keeps the orbit, zoom and pan of the user. */
  private updateCameraForBurnModel({ parts, sheetBounds, thicknessMm }: BurnModel): void {
    const modelFraming: BurnSceneModelFraming = {
      sheetBounds,
      thicknessMm,
      maxLiftMm: getBurnPartMaxLiftMm(parts, thicknessMm),
    };
    const framing: BurnSceneCameraFraming = { ...modelFraming, aspectRatio: this.aspectRatio };

    if (this.camera && this.modelFraming && isSameBurnSheet(this.modelFraming, modelFraming)) {
      setBurnSceneCameraFrustum(this.camera, framing);
    } else {
      this.removeCameraAndControls();
      this.addCameraAndControls(framing);
    }

    this.modelFraming = modelFraming;
  }

  private addCameraAndControls(framing: BurnSceneCameraFraming): void {
    const camera: OrthographicCamera = newBurnSceneCamera(framing);
    const controls: OrbitControls = new OrbitControls(camera, this.webGlRenderer.domElement);

    this.camera = camera;
    this.controls = controls;
    controls.target.copy(getBurnSceneFrameCentre(framing));
    controls.maxPolarAngle = BURN_SCENE_MAX_POLAR_ANGLE_RADIANS;
    controls.update();
    controls.addEventListener(BURN_SCENE_CONTROLS_CHANGE_EVENT, this.drawScene);
  }

  private removeCameraAndControls(): void {
    this.controls?.removeEventListener(BURN_SCENE_CONTROLS_CHANGE_EVENT, this.drawScene);
    this.controls?.dispose();
    this.camera = undefined;
    this.controls = undefined;
    this.modelFraming = undefined;
  }

  private removeModelObjects(): void {
    if (this.objects) {
      this.scene.remove(this.objects.group);
      this.objects.material.dispose();
      this.objects.highlightMaterial.dispose();

      for (const { mesh } of this.objects.meshes) {
        mesh.geometry.dispose();
      }
    }

    this.objects = undefined;
  }

  // An arrow function because the controls call it without an object.
  private readonly drawScene = (): void => {
    if (this.objects && this.camera) {
      this.webGlRenderer.render(this.scene, this.camera);
    } else {
      this.webGlRenderer.clear();
    }
  };
}

export const newBurnSceneRenderer = (canvas: HTMLCanvasElement): BurnSceneRenderer | undefined => {
  try {
    return new WebGlBurnSceneRenderer(new WebGLRenderer({ canvas, antialias: true }));
  } catch (error: unknown) {
    // eslint-disable-next-line no-console -- the user sees a fixed message, so the log is the only place for the cause
    console.error(BURN_SCENE_RENDERER_ERROR_LOG_MESSAGE, error);

    return undefined;
  }
};
