/**
 * A gradient paint placed in the artwork box of the Design view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgGreyGradient } from '../../svg/geometry/interfaces/SvgGreyGradient';
import type { SvgMatrix } from '../../svg/geometry/interfaces/SvgMatrix';

export interface ObjectDesignGradient {
  /** The stops and geometry as the SVG states them. */
  definition: SvgGreyGradient;
  /** Maps the geometry numbers of the definition to artwork millimetres. */
  artworkMatrix: SvgMatrix;
}
