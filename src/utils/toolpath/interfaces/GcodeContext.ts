/**
 * Everything the G-code writer needs besides the toolpath: the header texts, the machine and its origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineOriginCorner } from '../../profiles/machine.profile.constants';

export interface GcodeContext {
  /** Name of the project, written in the title line. */
  projectName: string;
  /** Name of the machine profile, written in the profile line. */
  profileName: string;
  /** Machine corner the work origin sits at. */
  originCorner: MachineOriginCorner;
  /** Width of the machine work area in mm. */
  workAreaXMm: number;
  /** Depth of the machine work area in mm. */
  workAreaYMm: number;
  /** The S value the machine takes for full power. */
  sValueMax: number;
  /** Whether the machine has air assist wired to M8 and M9. */
  hasAirAssist: boolean;
  /** Version of the app, written in the title line. */
  appVersion: string;
  /** Moment the G-code was made, as an ISO text, written in the title line. */
  createdAtIso: string;
}
