/**
 * Props of LaserReadingAlerts: the values the connected laser reported validly.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type {
  ReportedMachineProfileValues,
} from '../../../../../utils/profiles/interfaces/ReportedMachineProfileValues';

export interface LaserReadingAlertsProps {
  /** The values the laser reported validly; a value it did not report is absent. */
  reportedValues: ReportedMachineProfileValues;
}
