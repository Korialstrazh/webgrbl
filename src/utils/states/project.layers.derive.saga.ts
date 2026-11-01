/**
 * Derives the layers of a project document from the current palette. Run by the sagas before they put a document
 * change, so the reducer stays pure and the layers land in the same undo step as the change that brought the colours.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { select } from 'redux-saga/effects';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { Palette } from '../palette/interfaces/Palette';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { selectPalette } from './palette.state';

/** Gives the existing layers unchanged plus a new layer for each colour of the objects that has none yet. */
export function* deriveProjectLayers(
  projectObjects: ProjectObject[],
  existingLayers: ProjectLayer[],
): Generator<unknown, ProjectLayer[]> {
  const palette: Palette = (yield select(selectPalette)) as Palette;

  return getObjectsDerivedLayers(projectObjects, palette, existingLayers);
}
