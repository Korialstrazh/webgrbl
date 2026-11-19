/**
 * The action types that change the project document. All of them are saved and can be undone; only the toolpath input
 * ones make a ready toolpath out of date, because the toolpath is not made from the material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  ProjectObjectSvgTextChanged,
  ProjectRedoRequested,
  ProjectUndoRequested,
  SampleJobAdded,
} from './project.document.state';

export const PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES: readonly string[] = [
  ProjectObjectsAdded.type,
  SampleJobAdded.type,
  ProjectObjectsTransformed.type,
  ProjectObjectsDeleted.type,
  ProjectObjectSvgTextChanged.type,
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
