/**
 * A gradient paint with its stops. The name says what the shading layer uses it for; stops may also have colours,
 * and then the layer comes from the first stop.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgLinearGradient } from './SvgLinearGradient';
import type { SvgRadialGradient } from './SvgRadialGradient';

export type SvgGreyGradient = SvgLinearGradient | SvgRadialGradient;
