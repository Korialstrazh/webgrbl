/**
 * A project object as the database stores it: everything but the SVG text, so a save stays small.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from './ProjectObject';

export type StoredProjectObject = Omit<ProjectObject, 'svgText'>;
