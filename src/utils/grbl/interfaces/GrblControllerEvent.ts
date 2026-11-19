/**
 * Any event the GRBL controller emits, told apart by its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
