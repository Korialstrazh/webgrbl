/**
 * The machine bed drawn to scale: grid, rulers, the laser-head crosshair and the work zero marker.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getCoordinateText } from '../../utils/bed/get.coordinate.text';
import { getGridLinePath } from '../../utils/bed/get.grid.line.path';
import { getRulerLabelPositions } from '../../utils/bed/get.ruler.label.positions';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { GrblAxisPosition } from '../../utils/grbl/interfaces/GrblAxisPosition';
import { DEFAULT } from '../../utils/localization/default.locales';
import {
  ARIA_SENTENCE_SEPARATOR,
  BED_HEAD_TEST_ID,
  CENTER_DIVISOR,
  CROSSHAIR_ARM_MM,
  PLACEHOLDER_FONT_SIZE_MM,
  RULER_FONT_SIZE_MM,
  RULER_LABEL_OFFSET_MM,
  WORK_ORIGIN_MARKER_RADIUS_MM,
} from './bed.view.constants';
import styles from './styles.module.scss';

interface BedViewProps {
  dimensions: BedDimensions;
  /** The laser head in machine coordinates; undefined until a position is known. */
  headPosition: GrblAxisPosition | undefined;
  /** The work zero as a machine coordinate. */
  workOriginPosition: GrblAxisPosition | undefined;
  /** Text centred on the bed, for example when there is no machine yet. */
  placeholderLabel: string | undefined;
}

const getAriaLabel = (t: TFunction, props: BedViewProps): string => {
  const { dimensions, headPosition, workOriginPosition } = props;
  const sentences: string[] = [
    t(DEFAULT.BED_ARIA_LABEL, { width: dimensions.widthMm, height: dimensions.heightMm }),
  ];

  if (headPosition) {
    sentences.push(
      t(DEFAULT.BED_ARIA_HEAD, { x: getCoordinateText(headPosition.x), y: getCoordinateText(headPosition.y) }),
    );
  }

  if (workOriginPosition) {
    sentences.push(
      t(DEFAULT.BED_ARIA_WORK_ORIGIN, {
        x: getCoordinateText(workOriginPosition.x),
        y: getCoordinateText(workOriginPosition.y),
      }),
    );
  }

  return sentences.join(ARIA_SENTENCE_SEPARATOR);
};

const getScreenTransform = (position: GrblAxisPosition, heightMm: number): string =>
  `translate(${position.x} ${heightMm - position.y})`;

export const BedView = (props: BedViewProps): ReactNode => {
  const { t } = useTranslation();
  const { dimensions, headPosition, workOriginPosition, placeholderLabel } = props;
  const { widthMm, heightMm } = dimensions;

  return (
    <svg
      className={styles.bedView}
      viewBox={`0 0 ${widthMm} ${heightMm}`}
      role="img"
      aria-label={getAriaLabel(t, props)}
    >
      <rect className={styles.surface} x={0} y={0} width={widthMm} height={heightMm} />
      <path className={styles.minorGrid} d={getGridLinePath(widthMm, heightMm, false)} />
      <path className={styles.majorGrid} d={getGridLinePath(widthMm, heightMm, true)} />
      {getRulerLabelPositions(widthMm).map((positionMm: number) => (
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
      {getRulerLabelPositions(heightMm).map((positionMm: number) => (
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
      {workOriginPosition && (
        <circle
          className={styles.workOrigin}
          transform={getScreenTransform(workOriginPosition, heightMm)}
          r={WORK_ORIGIN_MARKER_RADIUS_MM}
        />
      )}
      {headPosition && (
        <g
          className={styles.head}
          data-testid={BED_HEAD_TEST_ID}
          transform={getScreenTransform(headPosition, heightMm)}
        >
          <path d={`M${-CROSSHAIR_ARM_MM} 0H${CROSSHAIR_ARM_MM}M0 ${-CROSSHAIR_ARM_MM}V${CROSSHAIR_ARM_MM}`} />
        </g>
      )}
      {placeholderLabel && (
        <text
          className={styles.placeholder}
          x={widthMm / CENTER_DIVISOR}
          y={heightMm / CENTER_DIVISOR}
          fontSize={PLACEHOLDER_FONT_SIZE_MM}
        >
          {placeholderLabel}
        </text>
      )}
    </svg>
  );
};
