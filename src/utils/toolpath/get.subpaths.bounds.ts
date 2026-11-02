/**
 * Gets the box around a set of subpaths, or undefined when they have no points.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

export const getSubpathsBounds = (subpaths: SvgSubpath[]): ToolpathBounds | undefined => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const subpath of subpaths) {
    for (const { x, y } of subpath.points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return minX <= maxX ? { minX, minY, maxX, maxY } : undefined;
};
