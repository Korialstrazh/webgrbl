/**
 * One number input of the profile form: the profile field it edits and the key of its label.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';

export interface ProfileNumberFieldDefinition {
  /** Profile field the input edits. */
  field: keyof Pick<MachineProfile, 'maxPowerWatts' | 'workAreaXMm' | 'workAreaYMm' | 'sValueMax' | 'jogFeedRate'>;
  /** Localization key of the field label. */
  labelKey: string;
  /** Localization key of a short explanation of a GRBL term in the label, shown from an info icon. */
  hintKey?: string;
}
