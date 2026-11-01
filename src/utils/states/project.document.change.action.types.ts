/**
 * The action types that change the project document, objects and layers alike. Each one makes a ready toolpath
 * out of date.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  LayerPaletteEntryLinked,
  LayerSettingsChanged,
  LayerToggled,
  LayersReordered,
  ProjectDocumentLoaded,
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectRedoRequested,
  ProjectUndoRequested,
} from './project.document.state';

export const PROJECT_DOCUMENT_CHANGE_ACTION_TYPES: readonly string[] = [
  ProjectObjectsAdded.type,
  ProjectObjectsTransformed.type,
  ProjectObjectsDeleted.type,
  ProjectUndoRequested.type,
  ProjectRedoRequested.type,
  ProjectDocumentLoaded.type,
  LayerSettingsChanged.type,
  LayerToggled.type,
  LayersReordered.type,
  LayerPaletteEntryLinked.type,
];
