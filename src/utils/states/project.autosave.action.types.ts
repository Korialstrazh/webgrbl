/**
 * The actions after which the open project is autosaved: every document change except loading a document, which
 * only shows what is already stored. Derived from PROJECT_DOCUMENT_CHANGE_ACTION_TYPES, so the two lists cannot drift.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PROJECT_DOCUMENT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ProjectDocumentLoaded } from './project.document.state';

/** One action that changes nothing, such as undo with no history, costs one save. */
export const PROJECT_AUTOSAVE_ACTION_TYPES: string[] = PROJECT_DOCUMENT_CHANGE_ACTION_TYPES.filter(
  (actionType: string): boolean => actionType !== ProjectDocumentLoaded.type,
);
