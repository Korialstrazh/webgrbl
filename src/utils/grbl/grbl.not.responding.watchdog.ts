import { newBackgroundTimer } from './background.timer';
import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_MACHINE_STATE,
  GRBL_NOT_RESPONDING_SILENCE_MS,
  GRBL_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import type { GrblMachineState } from './grbl.constants';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';
import type { GrblNotRespondingWatchdogHost } from './interfaces/GrblNotRespondingWatchdogHost';

/** States in which a silent controller is expected: it holds its lines until the user resumes. */
const PAUSED_MACHINE_STATES: readonly GrblMachineState[] = [GRBL_MACHINE_STATE.HOLD, GRBL_MACHINE_STATE.DOOR];

/**
 * Reports the controller as not responding when lines are in flight, nothing was received for 10 000 ms and the
 * machine is not paused in Hold or Door. Each silence is reported once; any received line starts a new silence.
 * The banner-wait timeout reports through it as well, so one silence never gives two events.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblNotRespondingWatchdog {
  /** The controller parts the watchdog reads and reports through. */
  private readonly host: GrblNotRespondingWatchdogHost;
  /** True between startWatching() and stopWatching(). */
  private isWatching = false;
  /** True once the current silence was reported. */
  private isSilenceReported = false;
  /** Checks the silence; set only while watching and the current silence is not reported yet. */
  private silenceTimerId: number | undefined;
  /** Runs the silence check, also in a hidden tab. */
  private readonly backgroundTimer: BackgroundTimer;

  public constructor(host: GrblNotRespondingWatchdogHost, backgroundTimer: BackgroundTimer = newBackgroundTimer()) {
    this.host = host;
    this.backgroundTimer = backgroundTimer;
  }

  /** Starts watching from now, as if a line had just been received. */
  public startWatching(): void {
    this.isWatching = true;
    this.startNewSilence();
  }

  public stopWatching(): void {
    this.isWatching = false;
    this.clearSilenceTimer();
  }

  public handleLineReceived(): void {
    if (this.isWatching) {
      this.startNewSilence();
    }
  }

  /** Emits not-responding unless the current silence was already reported. */
  public reportNotResponding(): void {
    if (this.isSilenceReported) {
      return;
    }

    this.isSilenceReported = true;
    this.clearSilenceTimer();
    this.host.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.NOT_RESPONDING });
  }

  private startNewSilence(): void {
    this.isSilenceReported = false;
    this.startSilenceTimer(GRBL_NOT_RESPONDING_SILENCE_MS);
  }

  /**
   * A silence without lines in flight, or while paused, is not reported yet; it is checked again each poll interval,
   * so a line sent later into the same silence is reported without waiting another 10 000 ms.
   */
  private handleSilenceTimeout(): void {
    this.silenceTimerId = undefined;

    if (this.isSilenceReportable()) {
      this.reportNotResponding();
    } else {
      this.startSilenceTimer(GRBL_STATUS_POLL_INTERVAL_MS);
    }
  }

  private isSilenceReportable(): boolean {
    const machineState: GrblMachineState | undefined = this.host.getLatestStatus()?.machineState;
    const isMachinePaused: boolean = !!machineState && PAUSED_MACHINE_STATES.includes(machineState);

    return this.host.hasInFlightLines() && !isMachinePaused;
  }

  private startSilenceTimer(delayMs: number): void {
    this.clearSilenceTimer();
    this.silenceTimerId = this.backgroundTimer.setTimeout((): void => this.handleSilenceTimeout(), delayMs);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimerId) {
      this.backgroundTimer.clear(this.silenceTimerId);
    }

    this.silenceTimerId = undefined;
  }
}
