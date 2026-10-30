/**
 * Parses a GRBL status report line such as `<Idle|MPos:0.000,0.000,0.000|FS:0,0>`.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  GRBL_EMPTY_TEXT,
  GRBL_MACHINE_STATE,
  GRBL_STATUS_FIELD,
  GRBL_STATUS_FIELD_SEPARATOR,
  GRBL_STATUS_NUMBER_SEPARATOR,
  GRBL_STATUS_REPORT_PATTERN,
  GRBL_STATUS_VALUE_SEPARATOR,
} from './grbl.constants';
import type { GrblMachineState } from './grbl.constants';
import type { GrblAxisPosition } from './interfaces/GrblAxisPosition';
import type { GrblStatusReport } from './interfaces/GrblStatusReport';

const AXIS_COUNT = 3;
const PAIR_COUNT = 2;
/** Stands in for a number that a length-checked list cannot be missing. */
const CHECKED_NUMBER_FALLBACK = 0;

const getParsedNumberList = (text: string, expectedCount: number): number[] | undefined => {
  const numbers: number[] = text.split(GRBL_STATUS_NUMBER_SEPARATOR).map((part: string): number => Number(part));
  const isComplete: boolean = numbers.length >= expectedCount && numbers.every(Number.isFinite);

  return isComplete ? numbers : undefined;
};

const getParsedAxisPosition = (text: string): GrblAxisPosition | undefined => {
  const numbers: number[] | undefined = getParsedNumberList(text, AXIS_COUNT);

  if (!numbers) {
    return undefined;
  }

  const [x = CHECKED_NUMBER_FALLBACK, y = CHECKED_NUMBER_FALLBACK, z = CHECKED_NUMBER_FALLBACK] = numbers;

  return { x, y, z };
};

const getMachineStateByName = (stateName: string): GrblMachineState | undefined =>
  Object.values(GRBL_MACHINE_STATE).find((knownState: GrblMachineState): boolean => knownState === stateName);

const applyStatusField = (report: GrblStatusReport, fieldText: string): void => {
  const separatorIndex: number = fieldText.indexOf(GRBL_STATUS_VALUE_SEPARATOR);
  const fieldName: string = fieldText.slice(0, separatorIndex);
  const fieldValue: string = fieldText.slice(separatorIndex + 1);
  const pair: number[] | undefined = getParsedNumberList(fieldValue, PAIR_COUNT);

  switch (fieldName) {
  case GRBL_STATUS_FIELD.MACHINE_POSITION:
    report.machinePosition = getParsedAxisPosition(fieldValue);
    break;
  case GRBL_STATUS_FIELD.WORK_POSITION:
    report.workPosition = getParsedAxisPosition(fieldValue);
    break;
  case GRBL_STATUS_FIELD.WORK_COORDINATE_OFFSET:
    report.workCoordinateOffset = getParsedAxisPosition(fieldValue);
    break;
  case GRBL_STATUS_FIELD.BUFFER:
    report.plannerBlocksAvailable = pair?.[0];
    report.rxBytesAvailable = pair?.[1];
    break;
  case GRBL_STATUS_FIELD.FEED_AND_SPINDLE:
    report.feedRate = pair?.[0];
    report.spindleSpeed = pair?.[1];
    break;
  case GRBL_STATUS_FIELD.FEED:
    report.feedRate = getParsedNumberList(fieldValue, 1)?.[0];
    break;
  case GRBL_STATUS_FIELD.OVERRIDES: {
    const percents: number[] | undefined = getParsedNumberList(fieldValue, AXIS_COUNT);

    const [
      feedPercent = CHECKED_NUMBER_FALLBACK,
      rapidPercent = CHECKED_NUMBER_FALLBACK,
      spindlePercent = CHECKED_NUMBER_FALLBACK,
    ] = percents ?? [];

    report.overrides = percents ? { feedPercent, rapidPercent, spindlePercent } : undefined;
    break;
  }
  default:
    break;
  }
};

export const getParsedGrblStatusReport = (line: string): GrblStatusReport | undefined => {
  const reportMatch: RegExpMatchArray | null = line.trim().match(GRBL_STATUS_REPORT_PATTERN);

  if (!reportMatch) {
    return undefined;
  }

  const [stateField, ...otherFields] = (reportMatch[1] ?? GRBL_EMPTY_TEXT).split(GRBL_STATUS_FIELD_SEPARATOR);
  const stateText: string = stateField ?? GRBL_EMPTY_TEXT;
  const [stateName = GRBL_EMPTY_TEXT, substateText] = stateText.split(GRBL_STATUS_VALUE_SEPARATOR);
  const machineState: GrblMachineState | undefined = getMachineStateByName(stateName);

  if (!machineState) {
    return undefined;
  }

  const report: GrblStatusReport = {
    machineState,
    machineSubstate: substateText ? getParsedNumberList(substateText, 1)?.[0] : undefined,
    machinePosition: undefined,
    workPosition: undefined,
    workCoordinateOffset: undefined,
    plannerBlocksAvailable: undefined,
    rxBytesAvailable: undefined,
    feedRate: undefined,
    spindleSpeed: undefined,
    overrides: undefined,
  };

  for (const fieldText of otherFields) {
    applyStatusField(report, fieldText);
  }

  return report;
};
