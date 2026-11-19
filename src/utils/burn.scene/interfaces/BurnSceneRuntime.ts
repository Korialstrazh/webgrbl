/**
 * What the lazily loaded 3D runtime module offers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnSceneRenderer } from './BurnSceneRenderer';

export interface BurnSceneRuntime {
  /** Starts a renderer on the canvas; undefined when the browser cannot run WebGL. */
  newBurnSceneRenderer: (canvas: HTMLCanvasElement) => BurnSceneRenderer | undefined;
}
