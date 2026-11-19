/**
 * What is needed to place the gradient of one paint of a drawn element.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './SvgMatrix';
import type { SvgPaint } from './SvgPaint';
import type { SvgSubpath } from './SvgSubpath';

export interface SvgGradientMatrixInput {
  /** The paint, which may or may not be a gradient. */
  paint: SvgPaint | undefined;
  /** The resolved paint value, a url(#id) reference for a gradient. */
  paintValue: string;
  /** The matrix of the element, from its own user space to the root user space. */
  elementMatrix: SvgMatrix;
  /** The outline of the element in root user units, for the box of an object-box gradient. */
  subpaths: SvgSubpath[];
  /** Elements of the document by their id. */
  elementsById: Map<string, Element>;
}
