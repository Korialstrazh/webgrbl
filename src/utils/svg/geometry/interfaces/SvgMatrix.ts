/**
 * A 2D affine transform in the SVG matrix(a b c d e f) form: new x = a x + c y + e and new y = b x + d y + f.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgMatrix {
  /** How much the new x grows per unit of x. */
  a: number;
  /** How much the new y grows per unit of x. */
  b: number;
  /** How much the new x grows per unit of y. */
  c: number;
  /** How much the new y grows per unit of y. */
  d: number;
  /** Move along x. */
  e: number;
  /** Move along y. */
  f: number;
}
