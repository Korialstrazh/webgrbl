/**
 * Where the burn model stands.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BURN_MODEL_STATUS = {
  /** Nothing has been built, and nothing is being built. */
  IDLE: 'idle',
  /** A build is running. */
  BUILDING: 'building',
  /** The model matches the current job and material. */
  READY: 'ready',
  /** The model was made for an older job or material. */
  STALE: 'stale',
  /** The last build failed. */
  FAILED: 'failed',
} as const;

export type BurnModelStatus = (typeof BURN_MODEL_STATUS)[keyof typeof BURN_MODEL_STATUS];
