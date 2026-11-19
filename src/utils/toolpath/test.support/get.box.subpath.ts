/**
 * Test helper: the closed outline of a box, counter-clockwise from its bottom-left corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
