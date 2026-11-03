/**
 * What the 3D view needs from a WebGL renderer. It names no three.js type, so the app needs nothing from three.js.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnModel } from '../../burn.model/interfaces/BurnModel';
import type { BurnPartLiftsMm } from '../../burn.model/interfaces/BurnPartLiftsMm';
import type { ElementSizePx } from '../../hooks/interfaces/ElementSizePx';
import type { BurnScenePointer } from './BurnScenePointer';

export interface BurnSceneRenderer {
  /** Replaces what the scene shows and frames the camera to it; undefined leaves the scene empty. */
  showBurnModel: (model: BurnModel | undefined) => void;
  /** Moves each part mesh to the height of its lift above its place, in mm. */
  applyBurnPartLifts: (liftsMm: BurnPartLiftsMm) => void;
  /** Sets the drawing size to the size of the view on screen. */
  resizeBurnScene: (size: ElementSizePx) => void;
  /** The part under a place in the view; undefined over the sheet or the background. */
  getBurnPartIdAtPointer: (pointer: BurnScenePointer) => number | undefined;
  /** Frees the objects and the controls and gives the WebGL context back; its canvas cannot be drawn on again. */
  dispose: () => void;
}
