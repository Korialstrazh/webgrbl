/**
 * The inline style of the legend bar: the scene's clean and burnt colours as the custom properties its gradient reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CSSProperties } from 'react';

export interface BurnShadingLegendBarStyle extends CSSProperties {
  '--legend-clean-colour': string;
  '--legend-burnt-colour': string;
}
