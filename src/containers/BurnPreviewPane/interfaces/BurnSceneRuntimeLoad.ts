/**
 * How far loading the 3D runtime module got; only a finished load carries the module.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneRuntime } from '../../../utils/burn.scene/interfaces/BurnSceneRuntime';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from '../burn.preview.pane.constants';

export type BurnSceneRuntimeLoad =
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING }
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.READY; runtime: BurnSceneRuntime }
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED };
