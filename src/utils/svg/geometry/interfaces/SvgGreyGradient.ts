/**
 * A gradient paint with its stops. The name says what the shading layer uses it for; stops may also have colours,
 * and then the layer comes from the first stop.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgLinearGradient } from './SvgLinearGradient';
import type { SvgRadialGradient } from './SvgRadialGradient';

export type SvgGreyGradient = SvgLinearGradient | SvgRadialGradient;
