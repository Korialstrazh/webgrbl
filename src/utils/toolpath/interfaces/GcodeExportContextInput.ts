/**
 * What the G-code export context is built from: the active machine profile, the laser's settings and the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
