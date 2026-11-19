/**
 * The flattened shapes of one project object in its SVG user units, before the object is placed on the bed, with
 * the kinds of its content that cannot be drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgDrawable } from '../../svg/geometry/interfaces/SvgDrawable';
import type { SvgUnsupportedKind } from '../../svg/geometry/svg.shape.constants';

export interface ObjectArtworkDrawableSet {
  /** The painted shapes in user units, with paint orders counted from 0. */
  svgDrawables: SvgDrawable[];
  /** Each kind of content left out, listed once. */
  warningKinds: SvgUnsupportedKind[];
}
