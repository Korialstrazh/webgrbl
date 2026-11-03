/**
 * What the bed can show.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
