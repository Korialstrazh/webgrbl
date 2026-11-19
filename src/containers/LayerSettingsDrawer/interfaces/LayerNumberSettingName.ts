/**
 * The names of the layer settings that hold a number.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettings } from '../../../utils/layers/interfaces/LayerSettings';

export type LayerNumberSettingName = {
  [SettingName in keyof LayerSettings]: LayerSettings[SettingName] extends number ? SettingName : never;
}[keyof LayerSettings];
