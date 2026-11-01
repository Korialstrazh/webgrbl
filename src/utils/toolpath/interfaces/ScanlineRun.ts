/**
 * A piece of one scanline where a paint area is the topmost paint.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathPaintArea } from './ToolpathPaintArea';

export interface ScanlineRun {
  /** Left end in bed mm. */
  x0: number;
  /** Right end in bed mm. */
  x1: number;
  /** The topmost paint area over this piece. */
  paintArea: ToolpathPaintArea;
}
