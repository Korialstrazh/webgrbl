/**
 * Gets the ids of the objects of a project document, in drawing order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectObject } from './interfaces/ProjectObject';

export const getProjectObjectIds = (projectDocument: ProjectDocument): string[] =>
  projectDocument.objects.map((projectObject: ProjectObject): string => projectObject.id);
