/**
 * The inline style of the bed area: the work surface colour the user chose, as the custom property the bed drawing
 * reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CSSProperties } from 'react';

export interface BedSurfaceStyle extends CSSProperties {
  /** The bed work surface colour, a six-digit hex colour; must match the token in tokens.scss. */
  '--color-bed-surface': string;
}
