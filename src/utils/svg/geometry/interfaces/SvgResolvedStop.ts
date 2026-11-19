/**
 * The stop colour and stop opacity that one SVG element resolves to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgResolvedStyle } from './SvgResolvedStyle';

export type SvgResolvedStop = Pick<SvgResolvedStyle, 'stopColour' | 'stopOpacity'>;
