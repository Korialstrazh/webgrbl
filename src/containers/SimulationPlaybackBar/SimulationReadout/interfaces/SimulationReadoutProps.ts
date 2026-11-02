/**
 * Props of the simulation readout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TimelinePosition } from '../../../../utils/toolpath/interfaces/TimelinePosition';

export interface SimulationReadoutProps {
  /** Where the head is at the simulation time; undefined while the toolpath may not play. */
  position: TimelinePosition | undefined;
}
