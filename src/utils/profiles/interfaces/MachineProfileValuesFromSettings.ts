/**
 * The profile values a connected laser reports through its GRBL settings, plus whether its laser mode is on.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './MachineProfile';

export interface MachineProfileValuesFromSettings
  extends Pick<MachineProfile, 'workAreaXMm' | 'workAreaYMm' | 'sValueMax' | 'hasHomingSwitches'> {
  /** True when `$32` (laser mode) is on. */
  isLaserModeOn: boolean;
}
