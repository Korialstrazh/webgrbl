/**
 * What the bed can show.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const BED_VIEW_MODE = {
  /** The editable design. */
  DESIGN: 'design',
  /** The toolpath simulation. */
  TOOLPATH: 'toolpath',
  /** The 3D preview of the finished job. */
  THREE_D: '3d',
} as const;

export type BedViewMode = (typeof BED_VIEW_MODE)[keyof typeof BED_VIEW_MODE];
