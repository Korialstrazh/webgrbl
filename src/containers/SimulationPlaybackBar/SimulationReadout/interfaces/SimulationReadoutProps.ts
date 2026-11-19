/**
 * Props of the simulation readout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TimelinePosition } from '../../../../utils/toolpath/interfaces/TimelinePosition';

export interface SimulationReadoutProps {
  /** Where the head is at the simulation time; undefined while the toolpath may not play. */
  position: TimelinePosition | undefined;
}
