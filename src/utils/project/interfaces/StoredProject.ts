/**
 * A project as the database stores it: its objects without their SVG text, which lives in its own table.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { StoredProjectObject } from './StoredProjectObject';

export interface StoredProject {
  /** Random UUID, never reused. */
  id: string;
  /** Display name, 1 to 100 characters after trimming. */
  name: string;
  /** When the project was created, as a UTC ISO 8601 string. */
  createdAt: string;
  /** When the project was last saved or renamed, as a UTC ISO 8601 string. */
  updatedAt: string;
  /** The objects in drawing order. */
  objects: StoredProjectObject[];
  /** The layers of the document; missing in a row stored before projects had layers. */
  layers?: ProjectLayer[];
  /** The material of the document; missing until the user chooses one, and in a row stored before materials. */
  materialId?: string;
}
