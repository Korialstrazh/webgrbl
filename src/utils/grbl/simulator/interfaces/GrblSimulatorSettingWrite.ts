/**
 * One setting value a $n=value command asks the simulated controller to store.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblSimulatorSettingWrite {
  /** Number of the setting, such as 110 for $110. */
  settingNumber: number;
  /** Value text to store. */
  value: string;
}
