/**
 * The flattened shapes of one project object in its SVG user units, before the object is placed on the bed, with
 * the kinds of its content that cannot be drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgDrawable } from '../../svg/geometry/interfaces/SvgDrawable';
import type { SvgUnsupportedKind } from '../../svg/geometry/svg.shape.constants';

export interface ObjectArtworkDrawableSet {
  /** The painted shapes in user units, with paint orders counted from 0. */
  svgDrawables: SvgDrawable[];
  /** Each kind of content left out, listed once. */
  warningKinds: SvgUnsupportedKind[];
}
