/**
 * Gets the ids of the objects of a project document, in drawing order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectObject } from './interfaces/ProjectObject';

export const getProjectObjectIds = (projectDocument: ProjectDocument): string[] =>
  projectDocument.objects.map((projectObject: ProjectObject): string => projectObject.id);
