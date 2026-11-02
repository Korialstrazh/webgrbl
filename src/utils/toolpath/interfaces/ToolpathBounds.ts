/**
 * An axis-aligned box in bed millimetres (Y up).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathBounds {
  /** Left edge. */
  minX: number;
  /** Bottom edge. */
  minY: number;
  /** Right edge. */
  maxX: number;
  /** Top edge. */
  maxY: number;
}
