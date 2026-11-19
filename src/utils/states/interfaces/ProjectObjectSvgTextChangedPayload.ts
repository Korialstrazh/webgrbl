/**
 * The new SVG text of one object with the layers derived for it, stored in one undo step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { ProjectObjectSvgTextPayload } from './ProjectObjectSvgTextPayload';

export interface ProjectObjectSvgTextChangedPayload extends ProjectObjectSvgTextPayload {
  /** Layers derived from the palette for the document with the new text; only layers with a new key are added. */
  layers: ProjectLayer[];
}
