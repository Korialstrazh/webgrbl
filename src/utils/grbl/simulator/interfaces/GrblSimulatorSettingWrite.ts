/**
 * One setting value a $n=value command asks the simulated controller to store.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblSimulatorSettingWrite {
  /** Number of the setting, such as 110 for $110. */
  settingNumber: number;
  /** Value text to store. */
  value: string;
}
