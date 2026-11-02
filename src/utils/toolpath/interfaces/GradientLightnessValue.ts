/**
 * The colour lightness and opacity at one place along a gradient.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GradientLightnessStop } from './GradientLightnessStop';

export type GradientLightnessValue = Omit<GradientLightnessStop, 'offset'>;
