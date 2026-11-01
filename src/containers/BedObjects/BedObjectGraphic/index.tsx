/**
 * One object drawn on the bed: its artwork stretched to its box, a dashed danger outline when it leaves the bed, and
 * the dashed selection box with square corner handles when it is selected. The group is turned around the box centre,
 * so everything inside is drawn around the origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PointerEvent, ReactNode } from 'react';
import { getSvgDataUrl } from '../../../utils/project/get.svg.data.url';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import { HALF_BOX_FACTOR } from '../../../utils/project/project.constants';
import {
  BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID,
  SELECTION_BOX_PADDING_MM,
  SELECTION_HANDLE_SIZE_MM,
  SVG_PRESERVE_ASPECT_RATIO_NONE,
} from '../bed.objects.constants';
import { getObjectSvgTransform } from '../get.object.svg.transform';
import { getSelectionHandleOrigins } from './get.selection.handle.origins';
import type { BedObjectGraphicProps } from './interfaces/BedObjectGraphicProps';
import type { ObjectFramePoint } from './interfaces/ObjectFramePoint';
import styles from './styles.module.scss';

const renderSelectionHandles = (selectionWidthMm: number, selectionHeightMm: number): ReactNode =>
  getSelectionHandleOrigins(selectionWidthMm, selectionHeightMm).map((handleOrigin: ObjectFramePoint) => (
    <rect
      key={`${handleOrigin.x} ${handleOrigin.y}`}
      className={styles.selectionHandle}
      x={handleOrigin.x}
      y={handleOrigin.y}
      width={SELECTION_HANDLE_SIZE_MM}
      height={SELECTION_HANDLE_SIZE_MM}
    />
  ));

export const BedObjectGraphic = (props: BedObjectGraphicProps): ReactNode => {
  const { projectObject, bedHeightMm, isSelected, hasHandles, isOutsideBed, onPointerDown } = props;
  const { id, name, svgText, widthMm, heightMm }: ProjectObject = projectObject;
  const left: number = -widthMm * HALF_BOX_FACTOR;
  const top: number = -heightMm * HALF_BOX_FACTOR;
  const selectionWidthMm: number = widthMm + SELECTION_BOX_PADDING_MM + SELECTION_BOX_PADDING_MM;
  const selectionHeightMm: number = heightMm + SELECTION_BOX_PADDING_MM + SELECTION_BOX_PADDING_MM;

  const handlePointerDown = (pointerEvent: PointerEvent<SVGGElement>): void => {
    onPointerDown(pointerEvent, id);
  };

  return (
    <g
      className={styles.bedObject}
      role="img"
      aria-label={name}
      data-selected={isSelected}
      data-outside-bed={isOutsideBed}
      transform={getObjectSvgTransform(projectObject, bedHeightMm)}
      onPointerDown={handlePointerDown}
    >
      <image
        href={getSvgDataUrl(svgText)}
        x={left}
        y={top}
        width={widthMm}
        height={heightMm}
        preserveAspectRatio={SVG_PRESERVE_ASPECT_RATIO_NONE}
      />
      {isOutsideBed && (
        <rect
          className={styles.outsideOutline}
          data-testid={BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID}
          x={left}
          y={top}
          width={widthMm}
          height={heightMm}
        />
      )}
      {isSelected && (
        <rect
          className={styles.selectionBox}
          x={left - SELECTION_BOX_PADDING_MM}
          y={top - SELECTION_BOX_PADDING_MM}
          width={selectionWidthMm}
          height={selectionHeightMm}
        />
      )}
      {hasHandles && renderSelectionHandles(selectionWidthMm, selectionHeightMm)}
    </g>
  );
};
