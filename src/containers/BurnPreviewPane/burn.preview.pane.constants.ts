/**
 * The states of loading the 3D runtime module.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BURN_SCENE_RUNTIME_LOAD_STATUS = {
  /** The chunk is on its way. */
  LOADING: 'loading',
  /** The module is there to use. */
  READY: 'ready',
  /** The chunk could not be loaded. */
  FAILED: 'failed',
} as const;
