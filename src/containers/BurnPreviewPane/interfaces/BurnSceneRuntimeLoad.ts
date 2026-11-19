/**
 * How far loading the 3D runtime module got; only a finished load carries the module.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnSceneRuntime } from '../../../utils/burn.scene/interfaces/BurnSceneRuntime';
import { BURN_SCENE_RUNTIME_LOAD_STATUS } from '../burn.preview.pane.constants';

export type BurnSceneRuntimeLoad =
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.LOADING }
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.READY; runtime: BurnSceneRuntime }
  | { status: typeof BURN_SCENE_RUNTIME_LOAD_STATUS.FAILED };
