/**
 * Validly reported laser values that include both work area lengths (`$130` and `$131`).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './MachineProfile';
import type { ReportedMachineProfileValues } from './ReportedMachineProfileValues';

export type ReportedMachineWorkArea =
  ReportedMachineProfileValues & Pick<MachineProfile, 'workAreaXMm' | 'workAreaYMm'>;
