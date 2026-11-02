/**
 * The object fields an object's design drawing depends on: its artwork and the size it was imported at.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export type DesignDrawingSource = Pick<ProjectObject, 'svgText' | 'intrinsicWidthMm' | 'intrinsicHeightMm'>;
