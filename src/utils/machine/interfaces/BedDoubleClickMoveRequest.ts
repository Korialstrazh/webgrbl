/**
 * What decides whether a double-click on empty bed may move the laser, and where to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
