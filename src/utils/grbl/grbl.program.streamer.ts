import { GRBL_CONTROLLER_EVENT_KIND, GRBL_LINE_ORIGIN } from './grbl.constants';
import { runGrblCheckMode } from './grbl.check.mode';
import { GrblCommandWipedError } from './grbl.command.wiped.error';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblControlLineExchange } from './grbl.control.line.exchange';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { getNonAsciiProgramLineErrors } from './grbl.program.non.ascii.line.errors';
import { getProgramQueuedLines } from './grbl.program.queued.lines';
import type { GrblCheckModeContext } from './interfaces/GrblCheckModeContext';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblProgramRun } from './interfaces/GrblProgramRun';
import type { GrblProgramStreamerHost } from './interfaces/GrblProgramStreamerHost';
import type { GrblProgramStreamOptions } from './interfaces/GrblProgramStreamOptions';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/** With stop-on-error on, a program with a line that may not be sent is refused before any line of it is sent. */
const isProgramRefusedBeforeSending = (
  isStopOnErrorEnabled: boolean,
  firstUnsendableLineError: GrblProgramLineError | undefined,
): firstUnsendableLineError is GrblProgramLineError => isStopOnErrorEnabled && !!firstUnsendableLineError;

/** Line errors in the order of their lines, as the lines refused before sending join the errors GRBL answered. */
const getLineErrorsInLineOrder = (lineErrors: GrblProgramLineError[]): GrblProgramLineError[] =>
  [...lineErrors].sort(
    (firstError: GrblProgramLineError, secondError: GrblProgramLineError): number =>
      firstError.lineNumber - secondError.lineNumber,
  );

/**
 * Streams one program at a time through the shared send queue (console commands typed meanwhile share its buffer
 * budget), tracks the answers to its lines and ends it on completion, stop on error, a reset, an alarm or a closed
 * connection. Also runs check mode (see runGrblCheckMode) and the $C lines it needs.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblProgramStreamer {
  /** The controller parts the streamer acts on. */
  private readonly host: GrblProgramStreamerHost;
  /** True from the start of a stream or check until its promise settles. */
  private isProgramRunning = false;
  /** The program lines being streamed; undefined between runs and while check mode sends its $C lines. */
  private activeRun: GrblProgramRun | undefined;
  /** Sends the $C lines of check mode and tracks the wait for the reset banner. */
  private readonly controlLines: GrblControlLineExchange;

  public constructor(host: GrblProgramStreamerHost) {
    this.host = host;
    this.controlLines = new GrblControlLineExchange(host);
  }

  /**
   * Streams the program and resolves with how it ended. Rejects with GrblControllerBusyError while a program or check
   * runs and with GrblConnectionClosedError while disconnected.
   */
  public async streamProgram(programLines: string[], options: GrblProgramStreamOptions): Promise<GrblProgramResult> {
    this.claimProgramSlot();

    try {
      return await this.runProgramLines(programLines, options.isStopOnErrorEnabled, false);
    } finally {
      this.isProgramRunning = false;
    }
  }

  /** Checks the program in GRBL check mode and resolves with its line errors (see runGrblCheckMode). */
  public async checkProgram(programLines: string[]): Promise<GrblProgramLineError[]> {
    this.claimProgramSlot();

    try {
      return await runGrblCheckMode(this.newCheckModeContext(), programLines);
    } finally {
      this.isProgramRunning = false;
    }
  }

  /** Counts an ok for a program or check line; the program completes with the answer to its last line. */
  public handleLineAcknowledged(line: GrblQueuedLine | undefined): void {
    if (!line) {
      return;
    }

    if (this.controlLines.settleIfControlLine(line, undefined)) {
      return;
    }

    if (!line.programLineNumber) {
      return;
    }

    const answeringRun: GrblProgramRun | undefined = this.getAnswerAcceptingRun();

    if (answeringRun) {
      this.countAnsweredLine(answeringRun);
    }
  }

  /**
   * Records an error for a program or check line. With stop-on-error on, the stop starts before the router sends
   * more lines, so nothing after the error is sent. Errors in check mode are results and raise no grbl-error event.
   */
  public handleProgramLineError(line: GrblQueuedLine, errorCode: number): void {
    if (this.controlLines.settleIfControlLine(line, errorCode)) {
      return;
    }

    const { programLineNumber } = line;

    if (!programLineNumber) {
      return;
    }

    const answeringRun: GrblProgramRun | undefined = this.getAnswerAcceptingRun();

    if (!answeringRun) {
      return;
    }

    const lineError: GrblProgramLineError = { lineNumber: programLineNumber, lineText: line.text, errorCode };

    answeringRun.lineErrors.push(lineError);

    if (answeringRun.isStopOnErrorEnabled) {
      this.stopRunOnError(answeringRun, lineError);

      return;
    }

    if (!answeringRun.isCheckRun) {
      this.host.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
        code: errorCode,
        lineText: line.text,
        origin: GRBL_LINE_ORIGIN.PROGRAM,
      });
    }

    this.countAnsweredLine(answeringRun);
  }

  /** A soft reset wiped the program lines; a stop on error ends its run itself once the stop is done. */
  public handleMachineReset(): void {
    this.controlLines.failControlLineWait(new GrblCommandWipedError());

    const answeringRun: GrblProgramRun | undefined = this.getAnswerAcceptingRun();

    if (answeringRun) {
      this.finishRun(answeringRun, false);
    }
  }

  /** An alarm flushed the controller receive buffer, so the program lines in flight will never be answered. */
  public handleAlarm(): void {
    if (!this.isProgramRunning) {
      return;
    }

    this.host.commandWriter.dropAllLines();
    this.controlLines.failControlLineWait(new GrblCommandWipedError());

    if (this.activeRun) {
      this.finishRun(this.activeRun, false);
    }
  }

  /** Ends the wait for the reset banner of check mode. */
  public handleBannerWaitEnded(): void {
    this.controlLines.handleBannerWaitEnded();
  }

  /** Ends whatever runs, for a closed connection. */
  public releaseProgram(error: Error): void {
    this.controlLines.failControlLineWait(error);

    if (this.activeRun) {
      this.finishRun(this.activeRun, false);
    }

    this.controlLines.handleBannerWaitEnded();
  }

  private claimProgramSlot(): void {
    if (this.isProgramRunning) {
      throw new GrblControllerBusyError();
    }

    if (!this.host.isConnected()) {
      throw new GrblConnectionClosedError();
    }

    this.isProgramRunning = true;
  }

  private runProgramLines(
    programLines: string[],
    isStopOnErrorEnabled: boolean,
    isCheckRun: boolean,
  ): Promise<GrblProgramResult> {
    const nonAsciiLineErrors: GrblProgramLineError[] = getNonAsciiProgramLineErrors(programLines);
    const [firstNonAsciiLineError] = nonAsciiLineErrors;

    if (isProgramRefusedBeforeSending(isStopOnErrorEnabled, firstNonAsciiLineError)) {
      this.host.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR, ...firstNonAsciiLineError });

      return Promise.resolve({ isCompleted: false, lineErrors: [firstNonAsciiLineError] });
    }

    if (!isCheckRun) {
      this.emitProgramLineErrors(nonAsciiLineErrors);
    }

    const queuedLines: GrblQueuedLine[] = getProgramQueuedLines(programLines);

    if (!queuedLines.length) {
      return Promise.resolve({ isCompleted: true, lineErrors: nonAsciiLineErrors });
    }

    return new Promise((resolveRun: (result: GrblProgramResult) => void): void => {
      const run: GrblProgramRun = {
        sentLineCount: queuedLines.length,
        answeredLineCount: 0,
        lineErrors: [...nonAsciiLineErrors],
        isStopOnErrorEnabled,
        isCheckRun,
        isStoppingOnError: false,
        resolveRun,
      };

      this.activeRun = run;
      this.emitProgramProgress(run);
      this.host.commandWriter.enqueueLines(queuedLines);
    });
  }

  /** The active run unless a stop on error already ended its interest in answers. */
  private getAnswerAcceptingRun(): GrblProgramRun | undefined {
    return this.activeRun?.isStoppingOnError ? undefined : this.activeRun;
  }

  private countAnsweredLine(run: GrblProgramRun): void {
    run.answeredLineCount++;
    this.emitProgramProgress(run);

    if (run.answeredLineCount === run.sentLineCount) {
      this.finishRun(run, true);
    }
  }

  private emitProgramProgress(run: GrblProgramRun): void {
    if (!run.isCheckRun) {
      this.host.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_PROGRESS,
        answeredLineCount: run.answeredLineCount,
        totalLineCount: run.sentLineCount,
      });
    }
  }

  private stopRunOnError(run: GrblProgramRun, lineError: GrblProgramLineError): void {
    run.isStoppingOnError = true;
    this.host.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.PROGRAM_STOPPED_ON_ERROR, ...lineError });
    void this.finishRunAfterStop(run);
  }

  private async finishRunAfterStop(run: GrblProgramRun): Promise<void> {
    await this.host.stopMachine();
    this.finishRun(run, false);
  }

  /** Settling twice is harmless: a run that already ended is no longer the active run. */
  private finishRun(run: GrblProgramRun, isCompleted: boolean): void {
    if (run !== this.activeRun) {
      return;
    }

    this.activeRun = undefined;
    run.resolveRun({ isCompleted, lineErrors: getLineErrorsInLineOrder(run.lineErrors) });
  }

  /** Lines refused before sending are reported like the lines GRBL answered with an error. */
  private emitProgramLineErrors(lineErrors: GrblProgramLineError[]): void {
    for (const { lineText, errorCode } of lineErrors) {
      this.host.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
        code: errorCode,
        lineText,
        origin: GRBL_LINE_ORIGIN.PROGRAM,
      });
    }
  }

  private newCheckModeContext(): GrblCheckModeContext {
    return {
      sendControlLine: (commandText: string, isFollowedByReset: boolean): Promise<number | undefined> =>
        this.controlLines.sendControlLine(commandText, isFollowedByReset),
      streamCheckedLines: (programLines: string[]): Promise<GrblProgramResult> =>
        this.runProgramLines(programLines, false, true),
      waitForResetBanner: (): Promise<void> => this.controlLines.waitForResetBanner(),
      getInterruptionError: (): Error =>
        this.host.isConnected() ? new GrblCommandWipedError() : new GrblConnectionClosedError(),
    };
  }
}
