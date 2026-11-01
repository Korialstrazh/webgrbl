/**
 * What a toolpath generation is built from: the drawables and warnings read on the main thread, and the layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDrawableSet } from './BedDrawableSet';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';

export interface ToolpathGenerationInput extends BedDrawableSet {
  /** The layers of the project in burn order; off layers are left out of the toolpath. */
  layers: ProjectLayer[];
}
