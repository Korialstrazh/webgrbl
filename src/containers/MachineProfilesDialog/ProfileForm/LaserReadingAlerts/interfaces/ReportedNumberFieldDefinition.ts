/**
 * One number value the laser can report for a profile: the reported field and the key of its label.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type {
  MachineProfileValuesFromSettings,
} from '../../../../../utils/profiles/interfaces/MachineProfileValuesFromSettings';

export interface ReportedNumberFieldDefinition {
  /** Reported value the line shows. */
  field: keyof Pick<MachineProfileValuesFromSettings, 'workAreaXMm' | 'workAreaYMm' | 'sValueMax'>;
  /** Localization key of the field label. */
  labelKey: string;
}
