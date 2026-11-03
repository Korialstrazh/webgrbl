/**
 * What the scene hook gives the 3D pane.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneRenderer } from '../../../utils/burn.scene/interfaces/BurnSceneRenderer';

export interface BurnSceneUse {
  /** Whether WebGL failed, so the scene is gone for this visit to the view. */
  isSceneFailed: boolean;
  /** The running renderer; undefined until it has started and after it failed. */
  renderer: BurnSceneRenderer | undefined;
}
