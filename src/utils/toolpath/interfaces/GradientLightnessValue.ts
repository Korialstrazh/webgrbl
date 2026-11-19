/**
 * The colour lightness and opacity at one place along a gradient.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GradientLightnessStop } from './GradientLightnessStop';

export type GradientLightnessValue = Omit<GradientLightnessStop, 'offset'>;
