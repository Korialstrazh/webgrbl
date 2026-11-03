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
import type { BurnScenePointPx } from './BurnScenePointPx';
import type { BurnScenePointer } from './BurnScenePointer';

export interface BurnSceneRenderer {
  /** Replaces what the scene shows; undefined leaves it empty. The view only resets when the sheet changes. */
  showBurnModel: (model: BurnModel | undefined) => void;
  /** Moves each part mesh to the height of its lift above its place, in mm. */
  applyBurnPartLifts: (liftsMm: BurnPartLiftsMm) => void;
  /** Makes the mesh of a part glow and puts the lift axis on it, for no other; undefined does so for none. */
  highlightBurnPart: (partId: number | undefined) => void;
  /** Makes the mesh of a part glow softly; undefined does so for none. Draws only when that changes anything. */
  hoverBurnPart: (partId: number | undefined) => void;
  /** Sets the drawing size to the size of the view on screen. */
  resizeBurnScene: (size: ElementSizePx) => void;
  /** The part under a place in the view; undefined over the sheet or the background. */
  getBurnPartIdAtPointer: (pointer: BurnScenePointer) => number | undefined;
  /** Whether a place in the view is on the lift axis, so that pressing there grabs it. */
  isBurnLiftAxisAtPoint: (point: BurnScenePointPx) => boolean;
  /** How many mm a pointer move along the lift axis lifts a part. */
  getBurnLiftChangeMm: (move: BurnScenePointPx) => number;
  /** Brings back the first view of the whole sheet, undoing orbit, zoom and pan. */
  fitBurnSceneView: () => void;
  /** Looks straight down at the whole sheet, undoing orbit, zoom and pan. */
  showBurnSceneFromTop: () => void;
  /** Frees the objects and the controls and gives the WebGL context back; its canvas cannot be drawn on again. */
  dispose: () => void;
}
