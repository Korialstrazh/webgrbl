/**
 * What the lazily loaded 3D runtime module offers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneRenderer } from './BurnSceneRenderer';

export interface BurnSceneRuntime {
  /** Starts a renderer on the canvas; undefined when the browser cannot run WebGL. */
  newBurnSceneRenderer: (canvas: HTMLCanvasElement) => BurnSceneRenderer | undefined;
}
