/**
 * What the scene hook gives the 3D pane.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnSceneRenderer } from '../../../utils/burn.scene/interfaces/BurnSceneRenderer';

export interface BurnSceneUse {
  /** Whether WebGL failed, so the scene is gone for this visit to the view. */
  isSceneFailed: boolean;
  /** The running renderer; undefined until it has started and after it failed. */
  renderer: BurnSceneRenderer | undefined;
}
