/**
 * The placement fields of a project object: position, size and rotation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from './ProjectObject';

export type ProjectObjectTransform = Pick<ProjectObject, 'xMm' | 'yMm' | 'widthMm' | 'heightMm' | 'rotationDeg'>;
