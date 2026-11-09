/**
 * The new SVG text of one object with the layers derived for it, stored in one undo step.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { ProjectObjectSvgTextPayload } from './ProjectObjectSvgTextPayload';

export interface ProjectObjectSvgTextChangedPayload extends ProjectObjectSvgTextPayload {
  /** Layers derived from the palette for the document with the new text; only layers with a new key are added. */
  layers: ProjectLayer[];
}
