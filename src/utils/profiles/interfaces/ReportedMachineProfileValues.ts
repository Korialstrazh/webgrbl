/**
 * The profile values a laser reported validly; a value it did not report, or reported out of range, is absent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfileValuesFromSettings } from './MachineProfileValuesFromSettings';

export type ReportedMachineProfileValues = Partial<MachineProfileValuesFromSettings>;
