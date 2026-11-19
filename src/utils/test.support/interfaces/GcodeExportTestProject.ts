/**
 * What a G-code export test store starts with: its objects, whether their layers are on, the machine profile and the
 * toolpath worker client.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';
import type { ProjectObject } from '../../project/interfaces/ProjectObject';
import type { ToolpathWorkerClient } from '../../toolpath/interfaces/ToolpathWorkerClient';

export interface GcodeExportTestProject {
  /** Name of the open project. */
  projectName: string;
  /** Objects of the project document; their layers are derived from the default palette. */
  objects: ProjectObject[];
  /** Whether every derived layer is sent to the laser. */
  areLayersEnabled: boolean;
  /** The active machine profile, or undefined for none. */
  activeProfile: MachineProfile | undefined;
  /** The toolpath worker client the store generates with. */
  toolpathWorkerClient: ToolpathWorkerClient;
}
