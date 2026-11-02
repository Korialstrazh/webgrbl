/**
 * The actions after which the open project is autosaved: every document change except loading a document, which
 * only shows what is already stored. Derived from PROJECT_DOCUMENT_CHANGE_ACTION_TYPES, so the two lists cannot drift.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PROJECT_DOCUMENT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ProjectDocumentLoaded } from './project.document.state';

/** One action that changes nothing, such as undo with no history, costs one save. */
export const PROJECT_AUTOSAVE_ACTION_TYPES: string[] = PROJECT_DOCUMENT_CHANGE_ACTION_TYPES.filter(
  (actionType: string): boolean => actionType !== ProjectDocumentLoaded.type,
);
