/**
 * The action types that change the project document. All of them are saved and can be undone; only the toolpath input
 * ones make a ready toolpath out of date, because the toolpath is not made from the material.
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
  ProjectMaterialSelected,
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectRedoRequested,
  ProjectUndoRequested,
} from './project.document.state';

export const PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES: readonly string[] = [
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

export const PROJECT_DOCUMENT_CHANGE_ACTION_TYPES: readonly string[] = [
  ...PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES,
  ProjectMaterialSelected.type,
];
