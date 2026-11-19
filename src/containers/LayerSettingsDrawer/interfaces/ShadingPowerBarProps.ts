/**
 * What the black to white power bar needs: the power at each end and the machine's rated power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ShadingPowerBarProps {
  /** Power in percent at the darkest point. */
  maxPowerPercent: number;
  /** Power in percent at the lightest point. */
  minPowerPercent: number;
  /** Rated power of the machine in watts; undefined shows the ends in percent. */
  maxPowerWatts: number | undefined;
}
