/**
 * One number value the laser can report for a profile: the reported field and the key of its label.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
