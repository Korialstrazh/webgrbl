/**
 * The object fields the artwork matrix reads: the size the artwork was imported at.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../project/interfaces/ProjectObject';

export type ObjectArtworkSize = Pick<ProjectObject, 'intrinsicWidthMm' | 'intrinsicHeightMm'>;
