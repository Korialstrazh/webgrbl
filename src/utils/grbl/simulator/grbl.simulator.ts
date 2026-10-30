import {
  GRBL_CYCLE_RESUME_BYTE,
  GRBL_FEED_HOLD_BYTE,
  GRBL_JOG_CANCEL_BYTE,
  GRBL_MACHINE_STATE,
  GRBL_SOFT_RESET_BYTE,
  GRBL_STATUS_QUERY_BYTE,
} from '../grbl.constants';
import { getPreparedGrblLine } from '../grbl.line.preparer';
import {
  GRBL_SIMULATOR_ALARM_ABORT_DURING_CYCLE,
  GRBL_SIMULATOR_BANNER,
  GRBL_SIMULATOR_FAULT_KIND,
  GRBL_SIMULATOR_LINE_ENDING,
  GRBL_SIMULATOR_LINE_FEED_BYTE,
  GRBL_SIMULATOR_MESSAGE,
  GRBL_SIMULATOR_MOTION_PHASE,
  GRBL_SIMULATOR_ORIGIN,
  GRBL_SIMULATOR_RESPONSE_PREFIX,
} from './grbl.simulator.constants';
import { GRBL_SIMULATOR_DEFAULT_SETTINGS } from './grbl.simulator.default.settings';
import { GrblSimulatorLineExecutor } from './grbl.simulator.line.executor';
import { GrblSimulatorLineFaults } from './grbl.simulator.line.faults';
import { getSimulatorMachineState } from './grbl.simulator.machine.state';
import { newGrblSimulatorModalState } from './grbl.simulator.modal.state';
import { GrblSimulatorMotion } from './grbl.simulator.motion';
import { GrblSimulatorRxBuffer } from './grbl.simulator.rx.buffer';
import { getSimulatorStateText } from './grbl.simulator.state.text';
import { getSimulatorStatusReport } from './grbl.simulator.status.report';
import type { GrblMachineState } from '../grbl.constants';
import type { GrblSimulatorMotionPhase } from './grbl.simulator.constants';
import type { GrblSimulatorFault } from './interfaces/GrblSimulatorFault';
import type { GrblSimulatorLineExecutorHost } from './interfaces/GrblSimulatorLineExecutorHost';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';

/** Motion phases in which a soft reset loses steps, so GRBL raises ALARM:3. */
const MOTION_ABORTING_PHASES: readonly GrblSimulatorMotionPhase[] = [
  GRBL_SIMULATOR_MOTION_PHASE.RUN,
  GRBL_SIMULATOR_MOTION_PHASE.JOG,
  GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING,
  GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING,
];

/**
 * GRBL 1.1 stand-in for tests and the "Simulated laser": a 127-byte receive buffer, realtime commands acted on at
 * once, system commands, G-code through a 15-block planner, and faults a test can inject.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblSimulator {
  /** Receives every output line, each ending with CRLF. */
  private outputListener: (text: string) => void;
  /** Planner and motion of the machine. */
  private readonly motion: GrblSimulatorMotion = new GrblSimulatorMotion((): void => this.handleBlocksFreed());
  /** Runs and answers received lines. */
  private readonly lineExecutor: GrblSimulatorLineExecutor = new GrblSimulatorLineExecutor(this.newLineExecutorHost());
  /** Stored settings; they survive resets like GRBL's EEPROM. */
  private settings: Record<number, string> = { ...GRBL_SIMULATOR_DEFAULT_SETTINGS };
  /** G-code modal state; its position is where the last planned block ends. */
  private modalState: GrblSimulatorModalState = newGrblSimulatorModalState();
  /** Serial receive buffer; replaced on power-on, which also clears its overflow record. */
  private rxBuffer: GrblSimulatorRxBuffer = new GrblSimulatorRxBuffer();
  /** Non-realtime lines received since power-on or the last reset. */
  private receivedLineCount = 0;
  /** True while in the Alarm state, which locks out G-code. */
  private isAlarmLocked = false;
  /** True while $C check mode is on. */
  private isCheckMode = false;
  /** True when the next status report must include WCO. */
  private isOffsetReportDue = true;
  /** True after a stop-responding fault; nothing is output any more. */
  private isOutputSilenced = false;
  /** Error-on-line faults that have not fired yet. */
  private readonly lineFaults: GrblSimulatorLineFaults = new GrblSimulatorLineFaults();

  public constructor(outputListener: (text: string) => void) {
    this.outputListener = outputListener;
  }

  public setOutputListener(outputListener: (text: string) => void): void {
    this.outputListener = outputListener;
  }

  public receiveBytes(bytes: Uint8Array): void {
    for (const byte of bytes) {
      this.receiveByte(byte);
    }
  }

  /** Boots the controller: machine position and offsets start at zero, settings and injected faults are kept. */
  public powerOn(): void {
    this.motion.stopMotion();
    this.motion.setPosition(GRBL_SIMULATOR_ORIGIN);
    this.modalState = newGrblSimulatorModalState();
    this.isAlarmLocked = false;
    this.rxBuffer = new GrblSimulatorRxBuffer();
    this.resetProtocolState();
    this.emitLines(GRBL_SIMULATOR_BANNER);
  }

  /** Stops all motion and its timer, as unplugging the board would. */
  public powerOff(): void {
    this.motion.stopMotion();
    this.rxBuffer.clearStoredBytes();
  }

  public injectFault(fault: GrblSimulatorFault): void {
    switch (fault.kind) {
    case GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE:
      this.lineFaults.addFault(fault);
      break;
    case GRBL_SIMULATOR_FAULT_KIND.ALARM:
      this.motion.stopMotion();
      this.syncModalPosition();
      this.rxBuffer.clearStoredBytes();
      this.receivedLineCount = 0;
      this.isAlarmLocked = true;
      this.emitLines(`${GRBL_SIMULATOR_RESPONSE_PREFIX.ALARM}${fault.alarmCode}`);
      break;
    case GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING:
      this.isOutputSilenced = true;
      break;
    default: {
      const unknownFault: never = fault;
      throw new Error(`Unknown simulator fault ${JSON.stringify(unknownFault)}`);
    }
    }
  }

  public hasRxBufferOverflowed(): boolean {
    return this.rxBuffer.hasOverflowed();
  }

  public getReceivedLineCount(): number {
    return this.receivedLineCount;
  }

  private getMachineState(): GrblMachineState {
    return getSimulatorMachineState(this.isAlarmLocked, this.isCheckMode, this.motion.getMotionPhase());
  }

  /** The interpreter makes a new offset object only for G92, after which GRBL reports WCO again. */
  private setModalState(modalState: GrblSimulatorModalState): void {
    if (modalState.workCoordinateOffset !== this.modalState.workCoordinateOffset) {
      this.isOffsetReportDue = true;
    }

    this.modalState = modalState;
  }

  private emitLines(...lines: string[]): void {
    if (this.isOutputSilenced) {
      return;
    }

    for (const line of lines) {
      this.outputListener(`${line}${GRBL_SIMULATOR_LINE_ENDING}`);
    }
  }

  private emitError(errorCode: number): void {
    this.emitLines(`${GRBL_SIMULATOR_RESPONSE_PREFIX.ERROR}${errorCode}`);
  }

  /** Soft reset: flushes planner and receive buffer, keeps the position, raises ALARM:3 if motion was cut off. */
  private executeSoftReset(): void {
    const isMotionAborted: boolean = MOTION_ABORTING_PHASES.includes(this.motion.getMotionPhase());

    this.motion.stopMotion();
    this.modalState = newGrblSimulatorModalState(this.motion.getPosition(), this.modalState.workCoordinateOffset);
    this.resetProtocolState();

    if (isMotionAborted) {
      this.isAlarmLocked = true;
      this.emitLines(`${GRBL_SIMULATOR_RESPONSE_PREFIX.ALARM}${GRBL_SIMULATOR_ALARM_ABORT_DURING_CYCLE}`);
    }

    this.emitLines(GRBL_SIMULATOR_BANNER);

    if (this.isAlarmLocked) {
      this.emitLines(GRBL_SIMULATOR_MESSAGE.UNLOCK_REQUIRED);
    }
  }

  private newLineExecutorHost(): GrblSimulatorLineExecutorHost {
    return {
      motion: this.motion,
      getMachineState: (): GrblMachineState => this.getMachineState(),
      getModalState: (): GrblSimulatorModalState => this.modalState,
      setModalState: (modalState: GrblSimulatorModalState): void => this.setModalState(modalState),
      getSettings: (): Readonly<Record<number, string>> => this.settings,
      storeSetting: (settingNumber: number, value: string): void => {
        this.settings = { ...this.settings, [settingNumber]: value };
      },
      setCheckMode: (isCheckMode: boolean): void => {
        this.isCheckMode = isCheckMode;
      },
      setAlarmLocked: (isAlarmLocked: boolean): void => {
        this.isAlarmLocked = isAlarmLocked;
      },
      emitLines: (...lines: string[]): void => this.emitLines(...lines),
      emitError: (errorCode: number): void => this.emitError(errorCode),
      executeSoftReset: (): void => this.executeSoftReset(),
    };
  }

  private resetProtocolState(): void {
    this.rxBuffer.clearStoredBytes();
    this.receivedLineCount = 0;
    this.isCheckMode = false;
    this.isOffsetReportDue = true;
  }

  private receiveByte(byte: number): void {
    if (this.handleRealtimeByte(byte)) {
      return;
    }

    this.rxBuffer.storeByte(byte);

    if (byte === GRBL_SIMULATOR_LINE_FEED_BYTE) {
      this.processReceivedLines();
    }
  }

  /** Acts on a realtime byte at once, as GRBL does, and returns true; returns false for any other byte. */
  private handleRealtimeByte(byte: number): boolean {
    switch (byte) {
    case GRBL_STATUS_QUERY_BYTE:
      this.emitStatusReport();
      break;
    case GRBL_FEED_HOLD_BYTE:
      this.executeFeedHold();
      break;
    case GRBL_CYCLE_RESUME_BYTE:
      this.motion.resumeCycle();
      break;
    case GRBL_SOFT_RESET_BYTE:
      this.executeSoftReset();
      break;
    case GRBL_JOG_CANCEL_BYTE:
      this.motion.cancelJog();
      break;
    default:
      return false;
    }

    return true;
  }

  private executeFeedHold(): void {
    switch (this.getMachineState()) {
    case GRBL_MACHINE_STATE.IDLE:
    case GRBL_MACHINE_STATE.RUN:
      this.motion.startFeedHold();
      break;
    case GRBL_MACHINE_STATE.JOG:
      this.motion.cancelJog();
      break;
    default:
      break;
    }
  }

  /** Moves complete lines out of the receive buffer while the planner has room, as GRBL's protocol loop does. */
  private processReceivedLines(): void {
    while (this.canPlanReceivedLine()) {
      this.executeLine(this.rxBuffer.takeCompleteLine());
    }
  }

  private canPlanReceivedLine(): boolean {
    return this.rxBuffer.hasCompleteLine() && !this.motion.isPlannerFull();
  }

  private executeLine(rawLine: string): void {
    this.receivedLineCount++;

    const faultErrorCode: number | undefined = this.lineFaults.takeFaultErrorCode(this.receivedLineCount);

    // Error code 0 is a valid injected fault, so a falsy check would treat it as no fault.
    // eslint-disable-next-line no-restricted-syntax -- 0 is distinct from absent here
    if (faultErrorCode !== undefined) {
      this.emitError(faultErrorCode);
    } else {
      this.lineExecutor.executePreparedLine(getPreparedGrblLine(rawLine));
    }
  }

  private emitStatusReport(): void {
    const motionPhase: GrblSimulatorMotionPhase = this.motion.getMotionPhase();

    this.emitLines(
      getSimulatorStatusReport({
        stateText: getSimulatorStateText(this.getMachineState(), motionPhase),
        machinePosition: this.motion.getPosition(),
        feedRate: this.motion.getCurrentFeedRate(),
        laserPower: this.motion.getCurrentLaserPower(),
        workCoordinateOffset: this.isOffsetReportDue ? this.modalState.workCoordinateOffset : undefined,
      }),
    );
    this.isOffsetReportDue = false;
  }

  private syncModalPosition(): void {
    this.modalState = { ...this.modalState, position: this.motion.getPosition() };
  }

  private handleBlocksFreed(): void {
    if (!this.motion.hasPlannedBlocks()) {
      this.syncModalPosition();
    }

    this.processReceivedLines();
  }
}
