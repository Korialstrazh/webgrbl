/**
 * The profile values a connected laser reports through its GRBL settings, plus whether its laser mode is on.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from './MachineProfile';

export interface MachineProfileValuesFromSettings
  extends Pick<MachineProfile, 'workAreaXMm' | 'workAreaYMm' | 'sValueMax' | 'hasHomingSwitches'> {
  /** True when `$32` (laser mode) is on. */
  isLaserModeOn: boolean;
}
