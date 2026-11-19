/**
 * The inline style of the legend bar: the scene's clean and burnt colours as the custom properties its gradient reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CSSProperties } from 'react';

export interface BurnShadingLegendBarStyle extends CSSProperties {
  '--legend-clean-colour': string;
  '--legend-burnt-colour': string;
}
