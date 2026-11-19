/**
 * Some fields of a machine profile with new values, applied over the form draft.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../../../utils/profiles/interfaces/MachineProfile';

export type MachineProfileChanges = Partial<MachineProfile>;
