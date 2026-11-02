/**
 * Test helper: the closed outline of a box, counter-clockwise from its bottom-left corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgSubpath } from '../../svg/geometry/interfaces/SvgSubpath';
import type { ToolpathBounds } from '../interfaces/ToolpathBounds';

export const getBoxSubpath = (box: ToolpathBounds): SvgSubpath => ({
  points: [
    { x: box.minX, y: box.minY },
    { x: box.maxX, y: box.minY },
    { x: box.maxX, y: box.maxY },
    { x: box.minX, y: box.maxY },
  ],
  isClosed: true,
});
