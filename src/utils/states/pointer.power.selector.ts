/**
 * The laser pointer power in use: the active laser profile's own value, so each laser keeps its pointer power. A
 * profile saved before profiles stored it, or no profile at all, uses the power last set in this session, which starts
 * at the default. The value is always inside the allowed pointer range.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getClampedPointerPowerPercent } from '../machine/get.clamped.pointer.power.percent';
import { selectLaserPointerPowerPercent } from './laser.pointer.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import type { AppRootState } from './new.store';

export const selectPointerPowerPercent = (state: AppRootState): number =>
  getClampedPointerPowerPercent(
    selectActiveMachineProfile(state)?.pointerPowerPercent ?? selectLaserPointerPowerPercent(state),
  );
