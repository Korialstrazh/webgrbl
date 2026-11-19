/**
 * What getObjectBoxFieldValue needs: the box placement, where the geometry sits in it, the field and the typed value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../project/interfaces/ProjectObjectTransform';
import type { ObjectArtworkFrame } from './ObjectArtworkFrame';

export interface ObjectBoxFieldInput {
  /** The object's stored placement, of its SVG page. */
  boxPlacement: ProjectObjectTransform;
  /** Where the drawn geometry sits inside the page. */
  artworkFrame: ObjectArtworkFrame;
  /** The field the value was typed into. */
  field: keyof ProjectObjectTransform;
  /** The typed value, speaking of the drawn geometry. */
  artworkValue: number;
}
