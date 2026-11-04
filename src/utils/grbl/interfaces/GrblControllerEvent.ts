/**
 * Any event the GRBL controller emits, told apart by its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAlarmEvent } from './GrblAlarmEvent';
import type { GrblConnectionLostEvent } from './GrblConnectionLostEvent';
import type { GrblConsoleEntryEvent } from './GrblConsoleEntryEvent';
import type { GrblControllerResetEvent } from './GrblControllerResetEvent';
import type { GrblErrorEvent } from './GrblErrorEvent';
import type { GrblNotRespondingEvent } from './GrblNotRespondingEvent';
import type { GrblProgramProgressEvent } from './GrblProgramProgressEvent';
import type { GrblProgramStoppedOnErrorEvent } from './GrblProgramStoppedOnErrorEvent';
import type { GrblStatusReportEvent } from './GrblStatusReportEvent';

export type GrblControllerEvent =
  | GrblConsoleEntryEvent
  | GrblStatusReportEvent
  | GrblErrorEvent
  | GrblAlarmEvent
  | GrblConnectionLostEvent
  | GrblNotRespondingEvent
  | GrblProgramStoppedOnErrorEvent
  | GrblControllerResetEvent
  | GrblProgramProgressEvent;
