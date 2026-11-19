/**
 * Validly reported laser values that include both work area lengths (`$130` and `$131`).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from './MachineProfile';
import type { ReportedMachineProfileValues } from './ReportedMachineProfileValues';

export type ReportedMachineWorkArea =
  ReportedMachineProfileValues & Pick<MachineProfile, 'workAreaXMm' | 'workAreaYMm'>;
