/**
 * The machine a toolpath is made for: its work area, which no move may leave, and the corner the head starts at.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineOriginCorner } from '../../profiles/machine.profile.constants';
import type { OriginWorkArea } from './OriginWorkArea';

export interface ToolpathMachineArea extends OriginWorkArea {
  /** Machine corner the work origin sits at, where the head is when the job starts. */
  originCorner: MachineOriginCorner;
}
