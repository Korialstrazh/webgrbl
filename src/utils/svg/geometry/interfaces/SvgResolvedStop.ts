/**
 * The stop colour and stop opacity that one SVG element resolves to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgResolvedStyle } from './SvgResolvedStyle';

export type SvgResolvedStop = Pick<SvgResolvedStyle, 'stopColour' | 'stopOpacity'>;
