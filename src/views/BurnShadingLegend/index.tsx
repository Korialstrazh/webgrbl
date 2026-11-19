/**
 * A small chip in a corner of the 3D view that says what its shading means: a bar from the clean sheet colour to the
 * burnt colour, with one word at each end. Screen readers get one sentence instead of the bar.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { ARIA_ROLE_IMG } from '../../utils/aria.constants';
import { BURN_SCENE_BURNT_COLOUR, BURN_SCENE_CLEAN_COLOUR } from '../../utils/burn.scene/burn.scene.constants';
import type { BurnShadingLegendBarStyle } from './interfaces/BurnShadingLegendBarStyle';
import type { BurnShadingLegendProps } from './interfaces/BurnShadingLegendProps';
import styles from './styles.module.scss';

// The bar takes the scene's own colours, so the legend always matches what the 3D view draws.
const LEGEND_BAR_STYLE: BurnShadingLegendBarStyle = {
  '--legend-clean-colour': BURN_SCENE_CLEAN_COLOUR,
  '--legend-burnt-colour': BURN_SCENE_BURNT_COLOUR,
};

export const BurnShadingLegend = ({ labelText, cleanText, burntText }: BurnShadingLegendProps): ReactNode => (
  <div className={styles.burnShadingLegend} role={ARIA_ROLE_IMG} aria-label={labelText}>
    <span aria-hidden>{cleanText}</span>
    {/* eslint-disable-next-line no-restricted-syntax -- the colours are the 3D scene's TS constants, not CSS tokens */}
    <span className={styles.bar} style={LEGEND_BAR_STYLE} aria-hidden />
    <span aria-hidden>{burntText}</span>
  </div>
);
