import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_EMPTY_TEXT,
  GRBL_LINE_ORIGIN,
  GRBL_RESPONSE_KIND,
} from './grbl.constants';
import { newGrblConsoleEntryEvent } from './grbl.console.entry.event';
import { getParsedGrblResponse } from './grbl.response.parser';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import type { GrblResponse } from './interfaces/GrblResponse';
import type { GrblResponseRouterHost } from './interfaces/GrblResponseRouterHost';

/** Developer-facing message for a response kind the router does not handle. */
const getUnknownResponseMessage = (response: never): string => `Unknown GRBL response ${JSON.stringify(response)}`;

/**
 * Routes every line the controller prints: shows it as a console entry, restarts the not-responding silence clock,
 * then hands the parsed response to the part it belongs to (send queue, program streamer, status tracker, handshake,
 * banner counting).
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblResponseRouter {
  /** The controller parts responses are routed to. */
  private readonly host: GrblResponseRouterHost;

  public constructor(host: GrblResponseRouterHost) {
    this.host = host;
  }

  public routeReceivedLine(lineText: string): void {
    const response: GrblResponse = getParsedGrblResponse(lineText);

    this.host.notRespondingWatchdog.handleLineReceived();
    this.host.emitEvent(newGrblConsoleEntryEvent({
      direction: GRBL_CONSOLE_DIRECTION.RECEIVED,
      text: lineText,
      realtimeCommand: undefined,
      isStatusReport: response.kind === GRBL_RESPONSE_KIND.STATUS,
    }));
    this.routeResponse(response, lineText);
  }

  private routeResponse(response: GrblResponse, lineText: string): void {
    const { commandWriter, statusTracker, machineControls, programStreamer } = this.host;

    switch (response.kind) {
    case GRBL_RESPONSE_KIND.OK:
      programStreamer.handleLineAcknowledged(commandWriter.acknowledgeOldestLine());
      commandWriter.sendQueuedLines();
      break;
    case GRBL_RESPONSE_KIND.ERROR:
      this.handleErrorResponse(response.code);
      break;
    case GRBL_RESPONSE_KIND.ALARM:
      this.host.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM, code: response.code });
      programStreamer.handleAlarm();
      break;
    case GRBL_RESPONSE_KIND.STATUS:
      commandWriter.trackStatusReportReceived();
      this.host.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT,
        status: statusTracker.trackStatusReport(response.report),
      });
      break;
    case GRBL_RESPONSE_KIND.BANNER:
      this.host.handleHandshakeBanner(response.identity);
      machineControls.handleReceivedBanner();
      break;
    case GRBL_RESPONSE_KIND.SETTING:
    case GRBL_RESPONSE_KIND.FEEDBACK:
    case GRBL_RESPONSE_KIND.OTHER:
      commandWriter.collectAnswerLine(lineText);
      break;
    default: {
      const unknownResponse: never = response;
      throw new Error(getUnknownResponseMessage(unknownResponse));
    }
    }
  }

  /**
   * The error is reported before more lines are sent, so a stop on error drops them first. Program lines are
   * reported by the program streamer. Before the banner after a reset an error belongs to a wiped line, so nothing
   * is reported: it would show a misleading error.
   */
  private handleErrorResponse(errorCode: number): void {
    const { commandWriter, programStreamer } = this.host;

    if (commandWriter.isQueueHeldForBanner()) {
      return;
    }

    const failedLine: GrblQueuedLine | undefined = commandWriter.acknowledgeOldestLine();

    if (failedLine?.origin === GRBL_LINE_ORIGIN.PROGRAM) {
      programStreamer.handleProgramLineError(failedLine, errorCode);
    } else {
      this.host.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
        code: errorCode,
        lineText: failedLine?.text ?? GRBL_EMPTY_TEXT,
        origin: failedLine?.origin ?? GRBL_LINE_ORIGIN.CONSOLE,
      });
    }

    commandWriter.sendQueuedLines();
  }
}
