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
  Group,
  Mesh,
  Scene,
  WebGLRenderer,
} from 'three';
import type { Material, Object3D, OrthographicCamera } from 'three';
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
  BURN_SCENE_LIFT_AXIS_LENGTH_PX,
  BURN_SCENE_MAX_PIXEL_RATIO,
  BURN_SCENE_MAX_POLAR_ANGLE_RADIANS,
} from './burn.scene.constants';
import { getBurnLiftChangeMm } from './get.burn.lift.change.mm';
import { getBurnPartAtPointer } from './get.burn.part.at.pointer';
import { getBurnSceneFrameCentre } from './get.burn.scene.frame.centre';
import { getBurnSceneMmPerPx } from './get.burn.scene.mm.per.px';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneModelFraming } from './interfaces/BurnSceneModelFraming';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import type { BurnScenePointPx } from './interfaces/BurnScenePointPx';
import type { BurnScenePointer } from './interfaces/BurnScenePointer';
import type { BurnSceneRenderer } from './interfaces/BurnSceneRenderer';
import { isBurnLiftAxisAtPoint } from './is.burn.lift.axis.at.point';
import { newBurnLiftAxis } from './new.burn.lift.axis';
import { newBurnSceneCamera } from './new.burn.scene.camera';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { placeBurnLiftAxis } from './place.burn.lift.axis';
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

  // The size of the view on screen.
  private sizePx: ElementSizePx = { widthPx: 0, heightPx: 0 };

  // The arrow to drag, shown on the selected part while that part has a mesh.
  private readonly liftAxis: Group = newBurnLiftAxis();

  // The part the lift axis stands on.
  private selectedPartId: number | undefined;

  // How far each part stands above its place, kept so that a new camera starts right.
  private liftsMm: BurnPartLiftsMm = {};

  constructor(webGlRenderer: WebGLRenderer) {
    const [lightX, lightY, lightZ] = BURN_SCENE_KEY_LIGHT_DIRECTION;
    const keyLight: DirectionalLight = new DirectionalLight(
      BURN_SCENE_KEY_LIGHT_COLOUR,
      BURN_SCENE_KEY_LIGHT_INTENSITY,
    );

    keyLight.position.set(lightX, lightY, lightZ);
    this.scene.add(
      new AmbientLight(BURN_SCENE_AMBIENT_LIGHT_COLOUR, BURN_SCENE_AMBIENT_LIGHT_INTENSITY),
      keyLight,
      this.liftAxis,
    );
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

    this.placeLiftAxis();
    this.drawScene();
  }

  public applyBurnPartLifts(liftsMm: BurnPartLiftsMm): void {
    if (this.objects) {
      applyBurnPartLifts(this.objects, liftsMm);
      this.liftsMm = liftsMm;
      this.updateCameraNearPlane();
      this.placeLiftAxis();
      this.drawScene();
    }
  }

  public highlightBurnPart(partId: number | undefined): void {
    if (this.objects) {
      applyBurnPartHighlight(this.objects, partId);
      this.selectedPartId = partId;
      this.placeLiftAxis();
      this.drawScene();
    }
  }

  public resizeBurnScene({ widthPx, heightPx }: ElementSizePx): void {
    this.aspectRatio = widthPx / heightPx;
    this.sizePx = { widthPx, heightPx };
    this.webGlRenderer.setSize(widthPx, heightPx, false);

    if (this.camera && this.modelFraming) {
      setBurnSceneCameraFrustum(this.camera, { ...this.modelFraming, aspectRatio: this.aspectRatio });
    }

    this.drawScene();
  }

  public getBurnPartIdAtPointer(pointer: BurnScenePointer): number | undefined {
    return this.objects && this.camera ? getBurnPartAtPointer(this.objects, this.camera, pointer) : undefined;
  }

  public isBurnLiftAxisAtPoint(point: BurnScenePointPx): boolean {
    return this.liftAxis.visible && !!this.camera
      && isBurnLiftAxisAtPoint(this.liftAxis.position, this.getLiftAxisLengthMm(), this.camera, this.sizePx, point);
  }

  public getBurnLiftChangeMm(move: BurnScenePointPx): number {
    return this.camera ? getBurnLiftChangeMm(this.camera, this.sizePx, move) : 0;
  }

  public dispose(): void {
    this.removeModelObjects();
    this.disposeLiftAxis();
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

  /** Lifts have no upper limit, so the near plane moves behind the camera to keep a high part in view. */
  private updateCameraNearPlane(): void {
    if (this.camera) {
      this.camera.near = -Math.max(0, ...Object.values(this.liftsMm));
      this.camera.updateProjectionMatrix();
    }
  }

  private getLiftAxisLengthMm(): number {
    return this.camera ? BURN_SCENE_LIFT_AXIS_LENGTH_PX * getBurnSceneMmPerPx(this.camera, this.sizePx.heightPx) : 0;
  }

  /** On top of the middle of the selected part, wherever its lift has taken it. */
  private placeLiftAxis(): void {
    const mesh: Mesh | undefined = this.objects?.meshes.find(
      ({ partId }: BurnSceneMesh): boolean => !!partId && partId === this.selectedPartId,
    )?.mesh;

    placeBurnLiftAxis(this.liftAxis, mesh);
  }

  private disposeLiftAxis(): void {
    const axisMaterials: Set<Material> = new Set<Material>();

    this.liftAxis.traverse((axisObject: Object3D): void => {
      if (axisObject instanceof Mesh) {
        axisObject.geometry.dispose();
        axisMaterials.add(axisObject.material as Material);
      }
    });

    for (const axisMaterial of axisMaterials) {
      axisMaterial.dispose();
    }
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
      this.objects.toonBands.dispose();
      this.objects.outlineMaterial.dispose();

      for (const outline of this.objects.outlines) {
        outline.geometry.dispose();
      }

      for (const { mesh } of this.objects.meshes) {
        mesh.geometry.dispose();
      }
    }

    this.objects = undefined;
  }

  // An arrow function because the controls call it without an object.
  private readonly drawScene = (): void => {
    if (this.objects && this.camera) {
      // Keeps the arrow the same size on screen at any zoom.
      this.liftAxis.scale.setScalar(getBurnSceneMmPerPx(this.camera, this.sizePx.heightPx) || 1);
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
