/**
 * Gets a bed SVG point in the machine frame: SVG Y grows down from the back edge, machine Y grows up from the front.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

export const getBedMachinePoint = (svgPoint: BedSvgPoint, bedHeightMm: number): BedMachinePoint => ({
  x: svgPoint.x,
  y: bedHeightMm - svgPoint.y,
});
