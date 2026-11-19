/**
 * Gets a bed SVG point in the machine frame: SVG Y grows down from the back edge, machine Y grows up from the front.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

export const getBedMachinePoint = (svgPoint: BedSvgPoint, bedHeightMm: number): BedMachinePoint => ({
  x: svgPoint.x,
  y: bedHeightMm - svgPoint.y,
});
