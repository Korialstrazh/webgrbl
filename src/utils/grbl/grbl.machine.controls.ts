import { GRBL_CONTROLLER_EVENT_KIND, GRBL_REALTIME_COMMAND, GRBL_RESET_BANNER_TIMEOUT_MS } from './grbl.constants';
import { runGrblStopSequence } from './grbl.stop.sequence';
import type { GrblRealtimeCommand } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblMachineControlsHost } from './interfaces/GrblMachineControlsHost';
import type { GrblStopSequenceContext } from './interfaces/GrblStopSequenceContext';

/** Ends the hold wait of a running stop at once. */
type GrblHoldWaitCanceller = () => void;

/**
 * Stop, soft reset, feed hold and cycle resume of a connected controller, plus the wait for the banner after a reset.
 * Every command does nothing unless the controller is connected.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblMachineControls {
  /** The controller parts the controls act on. */
  private readonly host: GrblMachineControlsHost;
  /** The stop sequence in progress; a second stop request shares it. */
  private runningStop: Promise<void> | undefined;
  /** Ends the hold wait of the running stop; set only while it waits. */
  private holdWaitCanceller: GrblHoldWaitCanceller | undefined;
  /** Gives up on the banner after the latest reset; set only while the queue is held for one. */
  private bannerWaitTimerId: ReturnType<typeof setTimeout> | undefined;

  public constructor(host: GrblMachineControlsHost) {
    this.host = host;
  }

  /** Runs the stop sequence; resolves once the reset byte is written. A stop requested meanwhile shares it. */
  public stopMachine(): Promise<void> {
    if (!this.host.isConnected()) {
      return Promise.resolve();
    }

    this.runningStop ??= this.runStopSequence();

    return this.runningStop;
  }

  /** Writes the soft reset at once, drops all queued and in-flight lines and holds the queue until the banner. */
  public async resetMachine(): Promise<void> {
    if (!this.host.isConnected()) {
      return;
    }

    this.host.commandWriter.holdQueueUntilBanner();
    this.startBannerWaitTimer();
    this.host.handleMachineReset();
    await this.host.commandWriter.writeRealtimeCommand(GRBL_REALTIME_COMMAND.SOFT_RESET);
  }

  /** For the $C that leaves check mode: GRBL resets itself after its ok, so the queue waits for that banner. */
  public holdQueueUntilCheckModeBanner(): void {
    this.host.commandWriter.holdQueueUntilBannerKeepingLines();
    this.startBannerWaitTimer();
  }

  public async writeConnectedRealtimeCommand(command: GrblRealtimeCommand): Promise<void> {
    if (this.host.isConnected()) {
      await this.host.commandWriter.writeRealtimeCommand(command);
    }
  }

  /**
   * Counts a banner the controller printed while the queue waits for one; the banner wait ends once no banner is
   * expected any more. Any other banner while connected means the controller reset itself (see
   * handleControllerReset).
   */
  public handleReceivedBanner(): void {
    if (this.host.commandWriter.isQueueHeldForBanner()) {
      this.countAwaitedBanner();
    } else if (this.host.isConnected()) {
      this.handleControllerReset();
    }
  }

  /** Ends a running hold wait and the banner wait, for a closed connection. */
  public releaseMachineControls(): void {
    this.holdWaitCanceller?.();
    this.clearBannerWaitTimer();
  }

  /**
   * GRBL prints its banner after every reset, also one the app did not cause (homing failure, its reset button, a
   * brown-out). The reset flushed its receive buffer, so the lines in flight will never be answered: they are
   * dropped, so later answers pair with later lines, and running work ends. A running stop skips the rest of its
   * hold wait, as the machine no longer moves.
   */
  private handleControllerReset(): void {
    this.holdWaitCanceller?.();
    this.host.commandWriter.dropAllLines();
    this.host.handleMachineReset();
    this.host.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.CONTROLLER_RESET });
  }

  /**
   * Banners cannot be told apart, so an unexpected banner during the wait counts as an expected one. That releases
   * the queue at most one banner early, and the late banner then arrives while the queue is not held, so it is
   * handled as a controller reset and drops whatever was sent meanwhile: answers never pair with the wrong line.
   */
  private countAwaitedBanner(): void {
    this.host.commandWriter.releaseQueueAfterBanner();

    if (!this.host.commandWriter.isQueueHeldForBanner()) {
      this.clearBannerWaitTimer();
      this.host.handleBannerWaitEnded();
    }
  }

  /** Each reset restarts the wait, so the timeout counts from the latest reset. */
  private startBannerWaitTimer(): void {
    this.clearBannerWaitTimer();
    this.bannerWaitTimerId = setTimeout((): void => this.handleBannerWaitTimeout(), GRBL_RESET_BANNER_TIMEOUT_MS);
  }

  /** Without a banner the queue would hold every later line forever, so it sends again and the user is told. */
  private handleBannerWaitTimeout(): void {
    this.bannerWaitTimerId = undefined;
    this.host.commandWriter.releaseQueueBannerHold();
    this.host.reportNotResponding();
    this.host.handleBannerWaitEnded();
  }

  private clearBannerWaitTimer(): void {
    clearTimeout(this.bannerWaitTimerId);
    this.bannerWaitTimerId = undefined;
  }

  private async runStopSequence(): Promise<void> {
    try {
      await runGrblStopSequence(this.newStopSequenceContext());
    } finally {
      this.runningStop = undefined;
    }
  }

  private newStopSequenceContext(): GrblStopSequenceContext {
    const { commandWriter, statusPoller } = this.host;

    return {
      clearPendingLines: (): void => commandWriter.clearPendingLines(),
      writeRealtimeCommand: (command: GrblRealtimeCommand): void => void commandWriter.writeRealtimeCommand(command),
      getUnansweredStatusQueryCount: (): number => commandWriter.getUnansweredStatusQueryCount(),
      setStatusPollInterval: (intervalMs: number): void => {
        if (this.host.isConnected()) {
          statusPoller.startPolling(intervalMs);
        }
      },
      addEventListener: (listener: (event: GrblControllerEvent) => void): (() => void) =>
        this.host.addEventListener(listener),
      setHoldWaitCanceller: (canceller: GrblHoldWaitCanceller | undefined): void => {
        this.holdWaitCanceller = canceller;
      },
      resetMachine: (): Promise<void> => this.resetMachine(),
    };
  }
}
