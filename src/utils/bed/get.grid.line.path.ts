/**
 * Builds the SVG path of the grid lines every step, leaving out the stronger lines when drawing the weak ones.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRID_STEP_MM, MAJOR_GRID_STEP_MM } from './bed.constants';

const isMajorGridLine = (positionMm: number): boolean => !(positionMm % MAJOR_GRID_STEP_MM);

const hasGridLineInPath = (positionMm: number, isMajorPath: boolean): boolean =>
  isMajorGridLine(positionMm) === isMajorPath;

export const getGridLinePath = (widthMm: number, heightMm: number, isMajorPath: boolean): string => {
  const segments: string[] = [];

  for (let xMm = 0; xMm <= widthMm; xMm += GRID_STEP_MM) {
    if (hasGridLineInPath(xMm, isMajorPath)) {
      segments.push(`M${xMm} 0V${heightMm}`);
    }
  }

  // The machine Y axis points up, the screen Y axis points down.
  for (let yMm = 0; yMm <= heightMm; yMm += GRID_STEP_MM) {
    if (hasGridLineInPath(yMm, isMajorPath)) {
      segments.push(`M0 ${heightMm - yMm}H${widthMm}`);
    }
  }

  return segments.join('');
};
