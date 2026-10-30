import { GRBL_CONTROLLER_EVENT_KIND, GRBL_LINE_ORIGIN } from './grbl.constants';
import { runGrblCheckMode } from './grbl.check.mode';
import { GrblCommandWipedError } from './grbl.command.wiped.error';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { getProgramQueuedLines } from './grbl.program.queued.lines';
import type { GrblCheckModeContext } from './interfaces/GrblCheckModeContext';
import type { GrblControlLineWait } from './interfaces/GrblControlLineWait';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblProgramRun } from './interfaces/GrblProgramRun';
import type { GrblProgramStreamerHost } from './interfaces/GrblProgramStreamerHost';
import type { GrblProgramStreamOptions } from './interfaces/GrblProgramStreamOptions';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/** True when GRBL resets itself after this answer: the line expects a reset and was answered ok. */
const isResetFollowingControlLineAnswer = (
  wait: GrblControlLineWait | undefined,
  errorCode: number | undefined,
): boolean => !errorCode && !!wait?.isFollowedByReset;

/**
 * Streams one program at a time through the shared send queue (console commands typed meanwhile share its buffer
 * budget), tracks the answers to its lines and ends it on completion, stop on error, a reset, an alarm or a closed
 * connection. Also runs check mode (see runGrblCheckMode) and the $C lines it needs.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblProgramStreamer {
  /** The controller parts the streamer acts on. */
  private readonly host: GrblProgramStreamerHost;
  /** True from the start of a stream or check until its promise settles. */
  private isProgramRunning = false;
  /** The program lines being streamed; undefined between runs and while check mode sends its $C lines. */
  private activeRun: GrblProgramRun | undefined;
  /** The $C line of check mode waiting for its answer. */
  private controlLineWait: GrblControlLineWait | undefined;
  /** True from the ok of the $C that leaves check mode until the queue stops waiting for the reset banner. */
  private isResetBannerAwaited = false;
  /** Resolves the wait for the reset banner; set only while someone waits. */
  private resolveResetBannerWait: (() => void) | undefined;

  public constructor(host: GrblProgramStreamerHost) {
    this.host = host;
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

    if (line === this.controlLineWait?.line) {
      this.settleControlLine(undefined);

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
    if (line === this.controlLineWait?.line) {
      this.settleControlLine(errorCode);

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
    this.failControlLineWait(new GrblCommandWipedError());

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
    this.failControlLineWait(new GrblCommandWipedError());

    if (this.activeRun) {
      this.finishRun(this.activeRun, false);
    }
  }

  public handleBannerWaitEnded(): void {
    this.isResetBannerAwaited = false;
    this.resolveResetBannerWait?.();
    this.resolveResetBannerWait = undefined;
  }

  /** Ends whatever runs, for a closed connection. */
  public releaseProgram(error: Error): void {
    this.failControlLineWait(error);

    if (this.activeRun) {
      this.finishRun(this.activeRun, false);
    }

    this.handleBannerWaitEnded();
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
    const queuedLines: GrblQueuedLine[] = getProgramQueuedLines(programLines);

    if (!queuedLines.length) {
      return Promise.resolve({ isCompleted: true, lineErrors: [] });
    }

    return new Promise((resolveRun: (result: GrblProgramResult) => void): void => {
      this.activeRun = {
        sentLineCount: queuedLines.length,
        answeredLineCount: 0,
        lineErrors: [],
        isStopOnErrorEnabled,
        isCheckRun,
        isStoppingOnError: false,
        resolveRun,
      };
      this.host.commandWriter.enqueueLines(queuedLines);
    });
  }

  /** The active run unless a stop on error already ended its interest in answers. */
  private getAnswerAcceptingRun(): GrblProgramRun | undefined {
    return this.activeRun?.isStoppingOnError ? undefined : this.activeRun;
  }

  private countAnsweredLine(run: GrblProgramRun): void {
    run.answeredLineCount++;

    if (run.answeredLineCount === run.sentLineCount) {
      this.finishRun(run, true);
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
    run.resolveRun({ isCompleted, lineErrors: run.lineErrors });
  }

  private sendControlLine(commandText: string, isFollowedByReset: boolean): Promise<number | undefined> {
    const line: GrblQueuedLine = {
      text: commandText,
      isSentAlone: isFollowedByReset,
      origin: GRBL_LINE_ORIGIN.PROGRAM,
      programLineNumber: undefined,
    };

    return new Promise(
      (resolveAnswer: (errorCode: number | undefined) => void, rejectAnswer: (error: Error) => void): void => {
        this.controlLineWait = { line, isFollowedByReset, resolveAnswer, rejectAnswer };
        this.host.commandWriter.enqueueLines([line]);
      },
    );
  }

  /** The hold for the reset banner starts before the router sends more lines, so none of them is wiped. */
  private settleControlLine(errorCode: number | undefined): void {
    const wait: GrblControlLineWait | undefined = this.controlLineWait;

    this.controlLineWait = undefined;

    if (isResetFollowingControlLineAnswer(wait, errorCode)) {
      this.isResetBannerAwaited = true;
      this.host.holdQueueUntilCheckModeBanner();
    }

    wait?.resolveAnswer(errorCode);
  }

  private failControlLineWait(error: Error): void {
    this.controlLineWait?.rejectAnswer(error);
    this.controlLineWait = undefined;
  }

  private waitForResetBanner(): Promise<void> {
    if (!this.isResetBannerAwaited) {
      return Promise.resolve();
    }

    return new Promise((resolveWait: () => void): void => {
      this.resolveResetBannerWait = resolveWait;
    });
  }

  private newCheckModeContext(): GrblCheckModeContext {
    return {
      sendControlLine: (commandText: string, isFollowedByReset: boolean): Promise<number | undefined> =>
        this.sendControlLine(commandText, isFollowedByReset),
      streamCheckedLines: (programLines: string[]): Promise<GrblProgramResult> =>
        this.runProgramLines(programLines, false, true),
      waitForResetBanner: (): Promise<void> => this.waitForResetBanner(),
      getInterruptionError: (): Error =>
        this.host.isConnected() ? new GrblCommandWipedError() : new GrblConnectionClosedError(),
    };
  }
}
