/**
 * The machine bed drawn to scale: grid, rulers, the content passed as children (the project objects), the laser-head
 * crosshair and the work zero marker. A head or work zero outside the bed is drawn at the nearest bed edge in a dashed
 * outside style. Only the children take pointer presses; the rest of the drawing lets them through.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getBedMarker } from '../../utils/bed/get.bed.marker';
import { getCoordinateText } from '../../utils/bed/get.coordinate.text';
import { getGridLinePath } from '../../utils/bed/get.grid.line.path';
import { getRulerLabelPositions } from '../../utils/bed/get.ruler.label.positions';
import type { BedMarker } from '../../utils/bed/interfaces/BedMarker';
import { DEFAULT } from '../../utils/localization/default.locales';
import {
  ARIA_SENTENCE_SEPARATOR,
  BED_HEAD_TEST_ID,
  BED_WORK_ORIGIN_TEST_ID,
  CENTER_FRACTION,
  CROSSHAIR_ARM_MM,
  PLACEHOLDER_FONT_SIZE_MM,
  RULER_DIGIT_WIDTH_FRACTION,
  RULER_FONT_SIZE_MM,
  RULER_LABEL_OFFSET_MM,
  WORK_ORIGIN_MARKER_RADIUS_MM,
} from './bed.view.constants';
import type { BedViewProps } from './interfaces/BedViewProps';
import styles from './styles.module.scss';

const getAriaLabel = (t: TFunction, props: BedViewProps): string => {
  const { dimensions, headPosition, workOriginPosition } = props;
  const sentences: string[] = [
    t(DEFAULT.BED_ARIA_LABEL, { width: dimensions.widthMm, height: dimensions.heightMm }),
  ];

  if (headPosition) {
    const isOutsideBed: boolean = getBedMarker(headPosition, dimensions).isOutsideBed;

    sentences.push(
      t(isOutsideBed ? DEFAULT.BED_ARIA_HEAD_OUTSIDE : DEFAULT.BED_ARIA_HEAD, {
        x: getCoordinateText(headPosition.x),
        y: getCoordinateText(headPosition.y),
      }),
    );
  }

  if (workOriginPosition) {
    const isOutsideBed: boolean = getBedMarker(workOriginPosition, dimensions).isOutsideBed;

    sentences.push(
      t(isOutsideBed ? DEFAULT.BED_ARIA_WORK_ORIGIN_OUTSIDE : DEFAULT.BED_ARIA_WORK_ORIGIN, {
        x: getCoordinateText(workOriginPosition.x),
        y: getCoordinateText(workOriginPosition.y),
      }),
    );
  }

  return sentences.join(ARIA_SENTENCE_SEPARATOR);
};

/** A top label is written to the right of its position, so it needs the offset plus its widest text. */
const getTopLabelClearanceMm = (widthMm: number): number =>
  RULER_LABEL_OFFSET_MM + String(Math.floor(widthMm)).length * RULER_DIGIT_WIDTH_FRACTION * RULER_FONT_SIZE_MM;

/** A left label is written above its position, so it needs the offset plus one line of text. */
const LEFT_LABEL_CLEARANCE_MM: number = RULER_LABEL_OFFSET_MM + RULER_FONT_SIZE_MM;

const getMarkerClassName = (markerClassName: string | undefined, marker: BedMarker): string =>
  (marker.isOutsideBed ? [markerClassName, styles.outsideBed] : [markerClassName]).join(' ');

const getScreenTransform = (xMm: number, yMm: number, heightMm: number): string =>
  `translate(${xMm} ${heightMm - yMm})`;

export const BedView = (props: BedViewProps): ReactNode => {
  const { t } = useTranslation();
  const { dimensions, headPosition, workOriginPosition, placeholderLabel, children } = props;
  const { widthMm, heightMm } = dimensions;
  const minorGridPath: string = useMemo(() => getGridLinePath(widthMm, heightMm, false), [widthMm, heightMm]);
  const majorGridPath: string = useMemo(() => getGridLinePath(widthMm, heightMm, true), [widthMm, heightMm]);
  const topLabelPositions: number[] = useMemo(
    () => getRulerLabelPositions(widthMm, getTopLabelClearanceMm(widthMm)),
    [widthMm],
  );
  const leftLabelPositions: number[] = useMemo(
    () => getRulerLabelPositions(heightMm, LEFT_LABEL_CLEARANCE_MM),
    [heightMm],
  );
  const headMarker: BedMarker | undefined = headPosition && getBedMarker(headPosition, dimensions);
  const workOriginMarker: BedMarker | undefined = workOriginPosition && getBedMarker(workOriginPosition, dimensions);

  return (
    <svg
      className={styles.bedView}
      viewBox={`0 0 ${widthMm} ${heightMm}`}
      // A group, not an img: an img hides its children from assistive technology, and the objects on the bed carry
      // their own names.
      role="group"
      aria-label={getAriaLabel(t, props)}
    >
      <rect className={styles.surface} x={0} y={0} width={widthMm} height={heightMm} />
      <path className={styles.minorGrid} d={minorGridPath} />
      <path className={styles.majorGrid} d={majorGridPath} />
      {topLabelPositions.map((positionMm: number) => (
        <text
          key={`top-${positionMm}`}
          className={styles.rulerLabel}
          x={positionMm + RULER_LABEL_OFFSET_MM}
          y={RULER_FONT_SIZE_MM}
          fontSize={RULER_FONT_SIZE_MM}
        >
          {positionMm}
        </text>
      ))}
      {leftLabelPositions.map((positionMm: number) => (
        <text
          key={`left-${positionMm}`}
          className={styles.rulerLabel}
          x={RULER_LABEL_OFFSET_MM}
          y={heightMm - positionMm - RULER_LABEL_OFFSET_MM}
          fontSize={RULER_FONT_SIZE_MM}
        >
          {positionMm}
        </text>
      ))}
      <g>{children}</g>
      {workOriginMarker && (
        <circle
          className={getMarkerClassName(styles.workOrigin, workOriginMarker)}
          data-testid={BED_WORK_ORIGIN_TEST_ID}
          data-outside-bed={workOriginMarker.isOutsideBed}
          transform={getScreenTransform(workOriginMarker.xMm, workOriginMarker.yMm, heightMm)}
          r={WORK_ORIGIN_MARKER_RADIUS_MM}
        />
      )}
      {headMarker && (
        <g
          className={getMarkerClassName(styles.head, headMarker)}
          data-testid={BED_HEAD_TEST_ID}
          data-outside-bed={headMarker.isOutsideBed}
          transform={getScreenTransform(headMarker.xMm, headMarker.yMm, heightMm)}
        >
          <path d={`M${-CROSSHAIR_ARM_MM} 0H${CROSSHAIR_ARM_MM}M0 ${-CROSSHAIR_ARM_MM}V${CROSSHAIR_ARM_MM}`} />
        </g>
      )}
      {placeholderLabel && (
        <text
          className={styles.placeholder}
          x={widthMm * CENTER_FRACTION}
          y={heightMm * CENTER_FRACTION}
          fontSize={PLACEHOLDER_FONT_SIZE_MM}
        >
          {placeholderLabel}
        </text>
      )}
    </svg>
  );
};
