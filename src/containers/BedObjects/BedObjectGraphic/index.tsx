/**
 * One object drawn on the bed: its artwork stretched to its box, drawn the way its layers burn it in full on the bed
 * and as an amber dashed outline off it, a thick amber dashed box over a faint tint when it leaves the bed, and the
 * dashed selection box when it is selected. As the one selected object it also gets four corner handles that scale it
 * and a handle on an arm above the box that turns it. The group is turned around the box centre, so everything inside
 * is drawn around the origin. It renders again only when its own props change, so a drag of one object does not redraw
 * the others.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { memo, useId, useMemo } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { getObjectDesignDrawing } from '../../../utils/bed/get.object.design.drawing';
import type { ObjectDesignDrawing } from '../../../utils/bed/interfaces/ObjectDesignDrawing';
import { isDesignDrawnAsAuthored } from '../../../utils/bed/is.design.drawn.as.authored';
import { useObjectArtworkFrame } from '../../../utils/hooks/use.object.artwork.frame';
import { getSvgDataUrl } from '../../../utils/project/get.svg.data.url';
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import { HALF_BOX_FACTOR } from '../../../utils/project/project.constants';
import { getSvgDisplayText } from '../../../utils/svg/tree/get.svg.display.text';
import { getSvgTextOfDisabledElements } from '../../../utils/svg/tree/get.svg.text.of.disabled.elements';
import type { ObjectArtworkFrame } from '../../../utils/toolpath/interfaces/ObjectArtworkFrame';
import {
  BED_OBJECT_HANDLE,
  BED_OBJECT_HANDLE_TEST_ID,
  BED_OBJECT_HIT_AREA_TEST_ID,
  BED_OBJECT_OUTSIDE_OUTLINE_TEST_ID,
  SELECTION_BOX_PADDING_MM,
  SVG_PRESERVE_ASPECT_RATIO_NONE,
} from '../bed.objects.constants';
import type { BedObjectHandle } from '../bed.objects.constants';
import { getObjectArtworkSvgTransform } from '../get.object.artwork.svg.transform';
import { getObjectBedClipSvgTransform } from '../get.object.bed.clip.svg.transform';
import { getObjectSvgTransform } from '../get.object.svg.transform';
import type { BedHandleSizes } from '../interfaces/BedHandleSizes';
import { getSelectionHandleOrigins } from './get.selection.handle.origins';
import type { BedObjectGraphicProps } from './interfaces/BedObjectGraphicProps';
import type { SelectionHandlePlacement } from './interfaces/SelectionHandlePlacement';
import { ObjectDesignArtwork } from './ObjectDesignArtwork';
import styles from './styles.module.scss';

// React's ids may hold characters that a url(#id) reference would have to escape.
const NON_ID_CHARACTERS_PATTERN = /[^a-zA-Z0-9]/g;
const BED_CLIP_ID_PREFIX = 'bed-clip-';

type HandlePointerDownHandler = (pointerEvent: PointerEvent<SVGElement>, handle: BedObjectHandle) => void;

/** The size of the dashed selection box around an object's drawn geometry. */
type SelectionBoxSize = Pick<ProjectObject, 'widthMm' | 'heightMm'>;

const renderSelectionHandles = (
  handleSizes: BedHandleSizes,
  selectionBox: SelectionBoxSize,
  handlePointerDown: HandlePointerDownHandler,
): ReactNode => {
  const { handleSizeMm, rotateArmMm } = handleSizes;
  const selectionTop: number = -selectionBox.heightMm * HALF_BOX_FACTOR;
  const rotateHandleY: number = selectionTop - rotateArmMm;

  return (
    <>
      {getSelectionHandleOrigins(selectionBox.widthMm, selectionBox.heightMm, handleSizeMm).map(
        ({ handle, origin }: SelectionHandlePlacement) => (
          <rect
            key={handle}
            className={styles.selectionHandle}
            data-testid={BED_OBJECT_HANDLE_TEST_ID}
            data-handle={handle}
            x={origin.x}
            y={origin.y}
            width={handleSizeMm}
            height={handleSizeMm}
            onPointerDown={(pointerEvent: PointerEvent<SVGRectElement>) => handlePointerDown(pointerEvent, handle)}
          />
        ),
      )}
      <line className={styles.rotateArm} x1={0} y1={selectionTop} x2={0} y2={rotateHandleY} />
      <circle
        className={styles.selectionHandle}
        data-testid={BED_OBJECT_HANDLE_TEST_ID}
        data-handle={BED_OBJECT_HANDLE.ROTATE}
        cx={0}
        cy={rotateHandleY}
        r={handleSizeMm * HALF_BOX_FACTOR}
        onPointerDown={(pointerEvent: PointerEvent<SVGCircleElement>) =>
          handlePointerDown(pointerEvent, BED_OBJECT_HANDLE.ROTATE)}
      />
    </>
  );
};

const BedObjectGraphicContent = (props: BedObjectGraphicProps): ReactNode => {
  const { projectObject, bedWidthMm, bedHeightMm, isSelected, hasHandles, isOutsideBed, handleSizes } = props;
  const { layerLooks } = props;
  const { onPointerDown, onHandlePointerDown } = props;
  const { id, name: objectName, svgText, widthMm, heightMm }: ProjectObject = projectObject;
  const { intrinsicWidthMm, intrinsicHeightMm }: ProjectObject = projectObject;
  // Read once per artwork: a drag changes only the box, so it neither reads the SVG nor looks it up again.
  const designDrawing: ObjectDesignDrawing = useMemo(
    () => getObjectDesignDrawing({ svgText, intrinsicWidthMm, intrinsicHeightMm }),
    [svgText, intrinsicWidthMm, intrinsicHeightMm],
  );
  // Turned-off content is left out of the drawing above and drawn again, dimmed, from its own text.
  const disabledDrawing: ObjectDesignDrawing | undefined = useMemo(() => {
    const disabledSvgText: string | undefined = getSvgTextOfDisabledElements(svgText);

    return disabledSvgText
      ? getObjectDesignDrawing({ svgText: disabledSvgText, intrinsicWidthMm, intrinsicHeightMm })
      : undefined;
  }, [svgText, intrinsicWidthMm, intrinsicHeightMm]);
  const displaySvgText: string = useMemo(() => getSvgDisplayText(svgText), [svgText]);
  const bedClipId: string = BED_CLIP_ID_PREFIX + useId().replace(NON_ID_CHARACTERS_PATTERN, '');
  const artworkFrame: ObjectArtworkFrame = useObjectArtworkFrame(projectObject);
  const left: number = -widthMm * HALF_BOX_FACTOR;
  const top: number = -heightMm * HALF_BOX_FACTOR;
  // The selection hugs the drawn geometry, the size the Objects list and the job report, not the SVG page.
  const artworkWidthMm: number = widthMm * artworkFrame.widthFraction;
  const artworkHeightMm: number = heightMm * artworkFrame.heightFraction;
  const artworkCenterX: number = left + widthMm * artworkFrame.leftFraction + artworkWidthMm * HALF_BOX_FACTOR;
  const artworkCenterY: number = top + heightMm * artworkFrame.topFraction + artworkHeightMm * HALF_BOX_FACTOR;
  const selectionBox: SelectionBoxSize = {
    widthMm: artworkWidthMm + SELECTION_BOX_PADDING_MM + SELECTION_BOX_PADDING_MM,
    heightMm: artworkHeightMm + SELECTION_BOX_PADDING_MM + SELECTION_BOX_PADDING_MM,
  };

  const handlePointerDown = (pointerEvent: PointerEvent<SVGGElement>): void => {
    onPointerDown(pointerEvent, id);
  };

  // A handle press must not also reach the object's own press, which would start a move.
  const handleHandlePointerDown: HandlePointerDownHandler = (pointerEvent, handle) => {
    pointerEvent.stopPropagation();
    onHandlePointerDown(pointerEvent, id, handle);
  };

  const artworkComponent: ReactNode = isDesignDrawnAsAuthored(designDrawing, layerLooks) ? (
    <image
      href={getSvgDataUrl(displaySvgText)}
      x={left}
      y={top}
      width={widthMm}
      height={heightMm}
      preserveAspectRatio={SVG_PRESERVE_ASPECT_RATIO_NONE}
    />
  ) : (
    <g transform={getObjectArtworkSvgTransform(projectObject)}>
      <ObjectDesignArtwork designDrawing={designDrawing} layerLooks={layerLooks} />
    </g>
  );

  return (
    <g
      className={styles.bedObject}
      role="img"
      aria-label={objectName}
      data-bed-object
      data-selected={isSelected}
      data-outside-bed={isOutsideBed}
      transform={getObjectSvgTransform(projectObject, bedHeightMm)}
      onPointerDown={handlePointerDown}
    >
      {/* The whole box takes the presses, even where the drawing is cut off at the bed edge. */}
      <rect
        className={styles.hitArea}
        data-testid={BED_OBJECT_HIT_AREA_TEST_ID}
        x={left}
        y={top}
        width={widthMm}
        height={heightMm}
      />
      <clipPath id={bedClipId}>
        <rect
          x={0}
          y={0}
          width={bedWidthMm}
          height={bedHeightMm}
          transform={getObjectBedClipSvgTransform(projectObject, bedHeightMm)}
        />
      </clipPath>
      {/* The part of an object off the bed is still drawn, faint and without the halo, so a huge or misplaced import
          is visible where it lies; the viewport stops it under the rulers. */}
      {isOutsideBed && (
        <g className={styles.offBedArtwork} data-off-bed-artwork aria-hidden>
          {artworkComponent}
        </g>
      )}
      {/* The part on the bed is drawn in full, stopped at the bed edge. */}
      <g className={styles.artwork} data-artwork clipPath={`url(#${bedClipId})`}>
        {artworkComponent}
      </g>
      {/* Skipped content: faint, dashed and without the halo, so it never reads as a burn. */}
      {disabledDrawing && (
        <g className={styles.disabledArtwork} data-disabled-artwork clipPath={`url(#${bedClipId})`}>
          <g transform={getObjectArtworkSvgTransform(projectObject)}>
            <ObjectDesignArtwork designDrawing={disabledDrawing} layerLooks={layerLooks} />
          </g>
        </g>
      )}
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
      <g transform={`translate(${artworkCenterX} ${artworkCenterY})`}>
        {isSelected && (
          <rect
            className={styles.selectionBox}
            x={-selectionBox.widthMm * HALF_BOX_FACTOR}
            y={-selectionBox.heightMm * HALF_BOX_FACTOR}
            width={selectionBox.widthMm}
            height={selectionBox.heightMm}
          />
        )}
        {hasHandles && renderSelectionHandles(handleSizes, selectionBox, handleHandlePointerDown)}
      </g>
    </g>
  );
};

export const BedObjectGraphic = memo(BedObjectGraphicContent);
