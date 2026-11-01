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
import type { BedObjectHandle } from '../../bed.objects.constants';
import type { BedHandleSizes } from '../../interfaces/BedHandleSizes';

export interface BedObjectGraphicProps {
  /** The object as drawn, already moved by a drag in progress. */
  projectObject: ProjectObject;
  /** Height of the bed, which turns machine Y into SVG Y. */
  bedHeightMm: number;
  isSelected: boolean;
  /** Whether the scale and rotate handles are drawn: only when this is the one selected object. */
  hasHandles: boolean;
  /** The handle sizes in bed millimetres; the same object between renders while the bed's screen scale holds. */
  handleSizes: BedHandleSizes;
  /** Whether any corner of the object lies outside the bed. */
  isOutsideBed: boolean;
  /** Called for a press on the object outside its handles; stable between renders, so unchanged objects skip one. */
  onPointerDown: (pointerEvent: PointerEvent<SVGGElement>, objectId: string) => void;
  /** Called for a press on one of the handles; stable between renders like onPointerDown. */
  onHandlePointerDown: (pointerEvent: PointerEvent<SVGElement>, objectId: string, handle: BedObjectHandle) => void;
}
