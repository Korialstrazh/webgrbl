/**
 * The object fields an artwork frame depends on: the SVG and its imported size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export type ObjectArtworkFrameSource = Pick<ProjectObject, 'svgText' | 'intrinsicWidthMm' | 'intrinsicHeightMm'>;
