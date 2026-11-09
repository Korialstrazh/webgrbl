/**
 * Arrows on the bed edges that point to where an object runs off the bed, so an object whose artwork is mostly or
 * wholly off the bed still shows on the bed which way it went. Drawn only for an object outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { memo } from 'react';
import type { ReactNode } from 'react';
import { getObjectArtworkBedBounds } from '../../../utils/project/get.object.artwork.bed.bounds';
import { BED_OFF_BED_ARROW_TEST_ID } from '../bed.objects.constants';
import { getOffBedArrowPoints } from '../get.off.bed.arrow.points';
import type { BedOffBedArrowsProps } from '../interfaces/BedOffBedArrowsProps';
import styles from './styles.module.scss';

const BedOffBedArrowsContent = ({ projectObject, bed, arrowSize }: BedOffBedArrowsProps): ReactNode => (
  <g className={styles.offBedArrows} aria-hidden>
    {getOffBedArrowPoints(getObjectArtworkBedBounds(projectObject), bed, arrowSize).map((pointsText: string) => (
      <polygon key={pointsText} className={styles.arrow} data-testid={BED_OFF_BED_ARROW_TEST_ID} points={pointsText} />
    ))}
  </g>
);

export const BedOffBedArrows = memo(BedOffBedArrowsContent);
