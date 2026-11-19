/**
 * The profile values a laser reported validly; a value it did not report, or reported out of range, is absent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfileValuesFromSettings } from './MachineProfileValuesFromSettings';

export type ReportedMachineProfileValues = Partial<MachineProfileValuesFromSettings>;
