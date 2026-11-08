/**
 * The machine bed drawn to scale: grid, the content passed as children (the project objects), the laser-head
 * crosshair and the work zero marker. A head or work zero outside the bed is drawn at the nearest bed edge in a dashed
 * outside style. Only the children take pointer presses; the rest of the drawing lets them through.
 *
 * The view box is the part of the bed in view, so the zoom and pan live in the SVG itself and every pointer position
 * read through the SVG's screen matrix is already in bed millimetres. The markers are divided
 * by the zoom, so they keep their size on screen. The rulers are drawn over the view by BedRulers, in screen space.
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
import type { BedMarker } from '../../utils/bed/interfaces/BedMarker';
import type { BedViewBox } from '../../utils/bed/interfaces/BedViewBox';
import { DEFAULT } from '../../utils/localization/default.locales';
import {
  ARIA_SENTENCE_SEPARATOR,
  VIEW_BOX_SEPARATOR,
  BED_HEAD_TEST_ID,
  BED_WORK_ORIGIN_TEST_ID,
  CROSSHAIR_ARM_MM,
  HEAD_RING_RADIUS_MM,
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

const getMarkerClassName = (markerClassName: string | undefined, marker: BedMarker): string =>
  (marker.isOutsideBed ? [markerClassName, styles.outsideBed] : [markerClassName]).join(' ');

const getScreenTransform = (xMm: number, yMm: number, heightMm: number, markerScale: number): string =>
  `translate(${xMm} ${heightMm - yMm}) scale(${markerScale})`;

const getViewBoxText = (viewBox: BedViewBox): string =>
  [viewBox.xMm, viewBox.yMm, viewBox.widthMm, viewBox.heightMm].join(VIEW_BOX_SEPARATOR);

export const BedView = (props: BedViewProps): ReactNode => {
  const { t } = useTranslation();
  const { dimensions, headPosition, workOriginPosition, viewBox, zoom = 1, children } = props;
  const { widthMm, heightMm } = dimensions;
  const markerScale: number = 1 / zoom;
  const minorGridPath: string = useMemo(() => getGridLinePath(widthMm, heightMm, false), [widthMm, heightMm]);
  const majorGridPath: string = useMemo(() => getGridLinePath(widthMm, heightMm, true), [widthMm, heightMm]);
  const headMarker: BedMarker | undefined = headPosition && getBedMarker(headPosition, dimensions);
  const headCrosshairPath: string =
    `M${-CROSSHAIR_ARM_MM} 0H${CROSSHAIR_ARM_MM}M0 ${-CROSSHAIR_ARM_MM}V${CROSSHAIR_ARM_MM}`;
  const workOriginMarker: BedMarker | undefined = workOriginPosition && getBedMarker(workOriginPosition, dimensions);

  return (
    <svg
      className={styles.bedView}
      viewBox={getViewBoxText(viewBox ?? { xMm: 0, yMm: 0, widthMm, heightMm })}
      // A group, not an img: an img hides its children from assistive technology, and the objects on the bed carry
      // their own names.
      role="group"
      aria-label={getAriaLabel(t, props)}
    >
      <rect className={styles.surface} x={0} y={0} width={widthMm} height={heightMm} />
      <path className={styles.minorGrid} d={minorGridPath} />
      <path className={styles.majorGrid} d={majorGridPath} />
      <g>{children}</g>
      {workOriginMarker && (
        <circle
          className={getMarkerClassName(styles.workOrigin, workOriginMarker)}
          data-testid={BED_WORK_ORIGIN_TEST_ID}
          data-outside-bed={workOriginMarker.isOutsideBed}
          transform={getScreenTransform(workOriginMarker.xMm, workOriginMarker.yMm, heightMm, markerScale)}
          r={WORK_ORIGIN_MARKER_RADIUS_MM}
        />
      )}
      {headMarker && (
        <g
          className={getMarkerClassName(styles.head, headMarker)}
          data-testid={BED_HEAD_TEST_ID}
          data-outside-bed={headMarker.isOutsideBed}
          transform={getScreenTransform(headMarker.xMm, headMarker.yMm, heightMm, markerScale)}
        >
          {/* A dark halo under the red marks keeps the head visible over the artwork's glow. */}
          <path className={styles.headHalo} d={headCrosshairPath} />
          <circle className={styles.headHalo} r={HEAD_RING_RADIUS_MM} />
          <path d={headCrosshairPath} />
          <circle className={styles.headRing} r={HEAD_RING_RADIUS_MM} />
        </g>
      )}
    </svg>
  );
};
