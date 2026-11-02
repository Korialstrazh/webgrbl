/**
 * The states the project's toolpath can be in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const TOOLPATH_STATUS = {
  /** No toolpath has been asked for yet, or the last generation was cancelled before any result. */
  IDLE: 'idle',
  /** A generation is running in the worker. */
  GENERATING: 'generating',
  /** The toolpath matches the current document. */
  READY: 'ready',
  /** The toolpath was made for an older document. */
  STALE: 'stale',
  /** The last generation failed. */
  FAILED: 'failed',
} as const;

export type ToolpathStatus = (typeof TOOLPATH_STATUS)[keyof typeof TOOLPATH_STATUS];
