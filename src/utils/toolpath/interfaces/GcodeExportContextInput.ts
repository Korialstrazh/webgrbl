/**
 * What the G-code export context is built from: the active machine profile, the laser's settings and the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';

export interface GcodeExportContextInput {
  /** The active machine profile. */
  profile: MachineProfile;
  /** The settings the connected laser reported, by setting number; empty when not connected. */
  laserSettings: Record<number, string>;
  /** Name of the project. */
  projectName: string;
  /** Moment of the export, as an ISO text. */
  createdAtIso: string;
}
