/**
 * Formats a status report of the simulated controller, such as <Idle|MPos:0.000,0.000,0.000|FS:0,0>.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_STATUS_FIELD,
  GRBL_STATUS_FIELD_SEPARATOR,
  GRBL_STATUS_NUMBER_SEPARATOR,
  GRBL_STATUS_VALUE_SEPARATOR,
} from '../grbl.constants';
import { GRBL_SIMULATOR_POSITION_DECIMALS } from './grbl.simulator.constants';
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';
import type { GrblSimulatorStatusFields } from './interfaces/GrblSimulatorStatusFields';

const STATUS_REPORT_START = '<';
const STATUS_REPORT_END = '>';

const getFormattedAxisPosition = (position: GrblAxisPosition): string =>
  [position.x, position.y, position.z]
    .map((axisValue: number): string => axisValue.toFixed(GRBL_SIMULATOR_POSITION_DECIMALS))
    .join(GRBL_STATUS_NUMBER_SEPARATOR);

const getStatusField = (fieldName: string, fieldValue: string): string =>
  `${fieldName}${GRBL_STATUS_VALUE_SEPARATOR}${fieldValue}`;

export const getSimulatorStatusReport = (fields: GrblSimulatorStatusFields): string => {
  const feedAndPower: string = [Math.round(fields.feedRate), Math.round(fields.laserPower)].join(
    GRBL_STATUS_NUMBER_SEPARATOR,
  );
  const reportParts: string[] = [
    fields.stateText,
    getStatusField(GRBL_STATUS_FIELD.MACHINE_POSITION, getFormattedAxisPosition(fields.machinePosition)),
    getStatusField(GRBL_STATUS_FIELD.FEED_AND_SPINDLE, feedAndPower),
  ];

  if (fields.workCoordinateOffset) {
    const offsetText: string = getFormattedAxisPosition(fields.workCoordinateOffset);

    reportParts.push(getStatusField(GRBL_STATUS_FIELD.WORK_COORDINATE_OFFSET, offsetText));
  }

  return `${STATUS_REPORT_START}${reportParts.join(GRBL_STATUS_FIELD_SEPARATOR)}${STATUS_REPORT_END}`;
};
