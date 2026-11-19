/**
 * Gets the four corners of an object's box after rotation, in the machine frame (Y up).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR, HALF_TURN_DEG } from './project.constants';

export const getObjectCorners = (transform: ProjectObjectTransform): ObjectCornerPoint[] => {
  const halfWidth: number = transform.widthMm * HALF_BOX_FACTOR;
  const halfHeight: number = transform.heightMm * HALF_BOX_FACTOR;
  const centerX: number = transform.xMm + halfWidth;
  const centerY: number = transform.yMm + halfHeight;
  const angleRadians: number = (transform.rotationDeg * Math.PI) / HALF_TURN_DEG;
  const cosine: number = Math.cos(angleRadians);
  const sine: number = Math.sin(angleRadians);
  const offsets: ObjectCornerPoint[] = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ];

  return offsets.map((offset: ObjectCornerPoint): ObjectCornerPoint => ({
    x: centerX + offset.x * cosine - offset.y * sine,
    y: centerY + offset.x * sine + offset.y * cosine,
  }));
};
