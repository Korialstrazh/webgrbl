/**
 * The inline style of the bed area: the work surface colour the user chose, as the custom property the bed drawing
 * reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CSSProperties } from 'react';

export interface BedSurfaceStyle extends CSSProperties {
  /** The bed work surface colour, a six-digit hex colour; must match the token in tokens.scss. */
  '--color-bed-surface': string;
}
