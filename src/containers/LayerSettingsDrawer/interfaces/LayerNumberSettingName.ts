/**
 * The names of the layer settings that hold a number.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from '../../../utils/layers/interfaces/LayerSettings';

export type LayerNumberSettingName = {
  [SettingName in keyof LayerSettings]: LayerSettings[SettingName] extends number ? SettingName : never;
}[keyof LayerSettings];
