/**
 * The states of loading the 3D runtime module.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const BURN_SCENE_RUNTIME_LOAD_STATUS = {
  /** The chunk is on its way. */
  LOADING: 'loading',
  /** The module is there to use. */
  READY: 'ready',
  /** The chunk could not be loaded. */
  FAILED: 'failed',
} as const;
