/**
 * What decides whether a double-click on empty bed may move the laser, and where to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblMachineState } from '../../grbl/grbl.constants';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { ToolpathMachineArea } from '../../toolpath/interfaces/ToolpathMachineArea';

export interface BedDoubleClickMoveRequest {
  /** True when the user switched the double-click move on. */
  isPreferenceOn: boolean;
  /** True while the laser is connected. */
  isConnected: boolean;
  /** The last reported machine state; undefined before the first status report. */
  machineState: GrblMachineState | undefined;
  /** True while a job or a frame runs. */
  isJobRunActive: boolean;
  /** True while the laser pointer fires. */
  isPointerFiring: boolean;
  /** True while a drawer, dialog or popover is open. */
  isOverlayOpen: boolean;
  /** The double-clicked bed point, x to the right and y away from the user, in millimetres. */
  bedPoint: GeometryPoint;
  /** The work area and origin corner of the active profile. */
  machineArea: ToolpathMachineArea;
  /** The jog speed of the Move panel, in millimetres per minute. */
  feedRate: number;
}
