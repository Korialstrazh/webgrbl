/**
 * An axis-aligned box in bed millimetres (Y up).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
