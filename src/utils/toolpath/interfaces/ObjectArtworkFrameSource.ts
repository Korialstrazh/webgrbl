/**
 * The object fields an artwork frame depends on: the SVG and its imported size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export type ObjectArtworkFrameSource = Pick<ProjectObject, 'svgText' | 'intrinsicWidthMm' | 'intrinsicHeightMm'>;
