/**
 * Creates a project object with default values and a new id; overrides replace single fields.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from './interfaces/ProjectObject';
import {
  DEFAULT_OBJECT_NAME,
  DEFAULT_OBJECT_SIZE_MM,
  DEFAULT_OBJECT_SVG_TEXT,
} from './project.constants';

export const newProjectObject = (overrides: Partial<ProjectObject> = {}): ProjectObject => ({
  id: crypto.randomUUID(),
  name: DEFAULT_OBJECT_NAME,
  svgText: DEFAULT_OBJECT_SVG_TEXT,
  intrinsicWidthMm: DEFAULT_OBJECT_SIZE_MM,
  intrinsicHeightMm: DEFAULT_OBJECT_SIZE_MM,
  xMm: 0,
  yMm: 0,
  widthMm: DEFAULT_OBJECT_SIZE_MM,
  heightMm: DEFAULT_OBJECT_SIZE_MM,
  rotationDeg: 0,
  ...overrides,
});
