/**
 * Props of LaserReadingAlerts: the values the connected laser reported validly.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type {
  ReportedMachineProfileValues,
} from '../../../../../utils/profiles/interfaces/ReportedMachineProfileValues';

export interface LaserReadingAlertsProps {
  /** The values the laser reported validly; a value it did not report is absent. */
  reportedValues: ReportedMachineProfileValues;
}
