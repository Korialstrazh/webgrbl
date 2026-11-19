/**
 * The placement fields of a project object: position, size and rotation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from './ProjectObject';

export type ProjectObjectTransform = Pick<ProjectObject, 'xMm' | 'yMm' | 'widthMm' | 'heightMm' | 'rotationDeg'>;
