/**
 * A small square drawing of a stored project: each object as a box where it sits on the bed, turned as it is turned,
 * so rows that share a name can still be told apart. Decorative; the row text names the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR } from '../../../utils/project/project.constants';
import { getThumbnailViewBox } from './get.thumbnail.view.box';
import type { ProjectThumbnailProps } from './interfaces/ProjectThumbnailProps';
import styles from './styles.module.scss';

const getBoxSvgTransform = (box: ProjectObjectTransform): string => {
  const centerX: number = box.xMm + box.widthMm * HALF_BOX_FACTOR;
  const centerY: number = -(box.yMm + box.heightMm * HALF_BOX_FACTOR);

  return `translate(${centerX} ${centerY}) rotate(${-box.rotationDeg})`;
};

export const ProjectThumbnail = ({ objectBoxes }: ProjectThumbnailProps): ReactNode => (
  <svg className={styles.projectThumbnail} viewBox={getThumbnailViewBox(objectBoxes)} aria-hidden>
    {objectBoxes.map((box: ProjectObjectTransform, boxIndex: number) => (
      <rect
        key={boxIndex}
        className={styles.objectBox}
        x={-box.widthMm * HALF_BOX_FACTOR}
        y={-box.heightMm * HALF_BOX_FACTOR}
        width={box.widthMm}
        height={box.heightMm}
        transform={getBoxSvgTransform(box)}
      />
    ))}
  </svg>
);
