/**
 * What the black to white power bar needs: the power at each end and the machine's rated power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ShadingPowerBarProps {
  /** Power in percent at the darkest point. */
  maxPowerPercent: number;
  /** Power in percent at the lightest point. */
  minPowerPercent: number;
  /** Rated power of the machine in watts; undefined shows the ends in percent. */
  maxPowerWatts: number | undefined;
}
