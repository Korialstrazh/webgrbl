/**
 * Props of one object drawn on the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PointerEvent } from 'react';
import type { ProjectObject } from '../../../../utils/project/interfaces/ProjectObject';

export interface BedObjectGraphicProps {
  /** The object as drawn, already moved by a drag in progress. */
  projectObject: ProjectObject;
  /** Height of the bed, which turns machine Y into SVG Y. */
  bedHeightMm: number;
  isSelected: boolean;
  /** Whether the corner handles are drawn: only when this is the one selected object. */
  hasHandles: boolean;
  /** Whether any corner of the object lies outside the bed. */
  isOutsideBed: boolean;
  onPointerDown: (pointerEvent: PointerEvent<SVGGElement>, objectId: string) => void;
}
