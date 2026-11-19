/**
 * What getObjectBoxFieldValue needs: the box placement, where the geometry sits in it, the field and the typed value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
