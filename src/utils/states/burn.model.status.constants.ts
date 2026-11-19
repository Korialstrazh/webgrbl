/**
 * Where the burn model stands.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
