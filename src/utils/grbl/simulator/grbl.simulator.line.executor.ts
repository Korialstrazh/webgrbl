import {
  GRBL_MACHINE_STATE,
  GRBL_OK_RESPONSE_TEXT,
  GRBL_SYSTEM_COMMAND_PREFIX,
  GRBL_WHITESPACE_PATTERN,
} from '../grbl.constants';
import {
  GRBL_SIMULATOR_BUILD_OPTION_REPORT,
  GRBL_SIMULATOR_ERROR_GCODE_LOCKED,
  GRBL_SIMULATOR_ERROR_NOT_IDLE,
  GRBL_SIMULATOR_G_CODE,
  GRBL_SIMULATOR_HELP_REPORT,
  GRBL_SIMULATOR_JOG_COMMAND_PREFIX,
  GRBL_SIMULATOR_JOG_MOTION_GCODE,
  GRBL_SIMULATOR_MESSAGE,
  GRBL_SIMULATOR_ORIGIN,
  GRBL_SIMULATOR_SYSTEM_COMMAND,
  GRBL_SIMULATOR_VERSION_REPORT,
} from './grbl.simulator.constants';
import { getInterpretedGcodeLine } from './grbl.simulator.gcode.interpreter';
import { getSimulatorGcodeStateReport } from './grbl.simulator.gcode.state.report';
import { getParsedSimulatorSettingWrite } from './grbl.simulator.setting.write.parser';
import { getSimulatorSettingsReportLines } from './grbl.simulator.settings.report';
import type { GrblMachineState } from '../grbl.constants';
import type { GrblSimulatorGcodeError } from './interfaces/GrblSimulatorGcodeError';
import type { GrblSimulatorInterpretedLine } from './interfaces/GrblSimulatorInterpretedLine';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';
import type { GrblSimulatorSettingWrite } from './interfaces/GrblSimulatorSettingWrite';
import type { GrblSimulatorLineExecutorHost } from './interfaces/GrblSimulatorLineExecutorHost';

const NO_TEXT = '';
/** States in which GRBL refuses to print $$, because printing takes too long during motion. */
const SETTINGS_REPORT_BLOCKING_STATES: readonly GrblMachineState[] = [GRBL_MACHINE_STATE.RUN, GRBL_MACHINE_STATE.HOLD];
/** States in which GRBL runs configuration commands such as $I, $H and setting writes. */
const CONFIGURATION_STATES: readonly GrblMachineState[] = [GRBL_MACHINE_STATE.IDLE, GRBL_MACHINE_STATE.ALARM];
/** States in which GRBL accepts a jog. */
const JOG_STATES: readonly GrblMachineState[] = [GRBL_MACHINE_STATE.IDLE, GRBL_MACHINE_STATE.JOG];
/** States in which GRBL prints $$. */
const SETTINGS_REPORT_STATES: readonly GrblMachineState[] = Object.values(GRBL_MACHINE_STATE).filter(
  (machineState: GrblMachineState): boolean => !SETTINGS_REPORT_BLOCKING_STATES.includes(machineState),
);

/**
 * Runs and answers the received lines of the simulated controller: G-code, and the system commands $, $$, $I, $G,
 * $X, $H, $C, $J= and $n=value.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblSimulatorLineExecutor {
  /** Simulator state the lines read and change. */
  private readonly host: GrblSimulatorLineExecutorHost;

  public constructor(host: GrblSimulatorLineExecutorHost) {
    this.host = host;
  }

  /** Runs one prepared line; a line that is empty after preparation is answered with ok, as GRBL does. */
  public executePreparedLine(preparedLine: string | undefined): void {
    if (!preparedLine) {
      this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
    } else if (preparedLine.startsWith(GRBL_SYSTEM_COMMAND_PREFIX)) {
      this.executeSystemCommand(preparedLine);
    } else {
      this.executeGcodeLine(preparedLine);
    }
  }

  /** GRBL locks out every G-code line, not only motion, while in the Alarm state. */
  private executeGcodeLine(line: string): void {
    const machineState: GrblMachineState = this.host.getMachineState();

    if (machineState === GRBL_MACHINE_STATE.ALARM) {
      this.host.emitError(GRBL_SIMULATOR_ERROR_GCODE_LOCKED);

      return;
    }

    const result: GrblSimulatorInterpretedLine | GrblSimulatorGcodeError = getInterpretedGcodeLine(
      line,
      this.host.getModalState(),
      this.host.getSettings(),
    );

    if ('errorCode' in result) {
      this.host.emitError(result.errorCode);

      return;
    }

    this.host.setModalState(result.nextState);

    if (result.motionBlock && machineState !== GRBL_MACHINE_STATE.CHECK) {
      this.host.motion.enqueueBlock(result.motionBlock, false);
    }

    this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
  }

  private executeSystemCommand(preparedLine: string): void {
    const command: string = preparedLine.replace(GRBL_WHITESPACE_PATTERN, NO_TEXT).toUpperCase();

    if (command.startsWith(GRBL_SIMULATOR_JOG_COMMAND_PREFIX)) {
      this.executeJogCommand(command.slice(GRBL_SIMULATOR_JOG_COMMAND_PREFIX.length));

      return;
    }

    switch (command) {
    case GRBL_SIMULATOR_SYSTEM_COMMAND.HELP:
      this.host.emitLines(GRBL_SIMULATOR_HELP_REPORT, GRBL_OK_RESPONSE_TEXT);
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.GCODE_STATE:
      this.host.emitLines(getSimulatorGcodeStateReport(this.host.getModalState()), GRBL_OK_RESPONSE_TEXT);
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.UNLOCK:
      this.unlockAlarm();
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.CHECK_MODE:
      this.toggleCheckMode();
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.SETTINGS:
      this.executeCommandInStates(SETTINGS_REPORT_STATES, (): void => this.reportSettings());
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.BUILD_INFO:
      this.executeCommandInStates(CONFIGURATION_STATES, (): void => this.reportBuildInfo());
      break;
    case GRBL_SIMULATOR_SYSTEM_COMMAND.HOME:
      this.executeCommandInStates(CONFIGURATION_STATES, (): void => this.homeMachine());
      break;
    default:
      this.writeSetting(command);
      break;
    }
  }

  private executeCommandInStates(allowedStates: readonly GrblMachineState[], commandRunner: () => void): void {
    if (allowedStates.includes(this.host.getMachineState())) {
      commandRunner();
    } else {
      this.host.emitError(GRBL_SIMULATOR_ERROR_NOT_IDLE);
    }
  }

  private reportSettings(): void {
    this.host.emitLines(...getSimulatorSettingsReportLines(this.host.getSettings()), GRBL_OK_RESPONSE_TEXT);
  }

  private reportBuildInfo(): void {
    this.host.emitLines(GRBL_SIMULATOR_VERSION_REPORT, GRBL_SIMULATOR_BUILD_OPTION_REPORT, GRBL_OK_RESPONSE_TEXT);
  }

  /** GRBL only prints the unlock message when it actually leaves the Alarm state. */
  private unlockAlarm(): void {
    if (this.host.getMachineState() === GRBL_MACHINE_STATE.ALARM) {
      this.host.setAlarmLocked(false);
      this.host.emitLines(GRBL_SIMULATOR_MESSAGE.UNLOCKED);
    }

    this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
  }

  /** Homing is instant: the machine is at the origin and unlocked. */
  private homeMachine(): void {
    this.host.motion.setPosition(GRBL_SIMULATOR_ORIGIN);
    this.host.setModalState({ ...this.host.getModalState(), position: GRBL_SIMULATOR_ORIGIN });
    this.host.setAlarmLocked(false);
    this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
  }

  /** Leaving check mode resets the controller after the ok, as GRBL does. */
  private toggleCheckMode(): void {
    const machineState: GrblMachineState = this.host.getMachineState();

    if (machineState === GRBL_MACHINE_STATE.CHECK) {
      this.host.emitLines(GRBL_SIMULATOR_MESSAGE.CHECK_MODE_DISABLED, GRBL_OK_RESPONSE_TEXT);
      this.host.executeSoftReset();

      return;
    }

    if (machineState !== GRBL_MACHINE_STATE.IDLE) {
      this.host.emitError(GRBL_SIMULATOR_ERROR_NOT_IDLE);

      return;
    }

    this.host.setCheckMode(true);
    this.host.emitLines(GRBL_SIMULATOR_MESSAGE.CHECK_MODE_ENABLED, GRBL_OK_RESPONSE_TEXT);
  }

  /** A jog is a linear feed move that needs its own F word and leaves the modal state alone, except the position. */
  private executeJogCommand(jogGcode: string): void {
    if (!JOG_STATES.includes(this.host.getMachineState())) {
      this.host.emitError(GRBL_SIMULATOR_ERROR_NOT_IDLE);

      return;
    }

    const modalState: GrblSimulatorModalState = this.host.getModalState();
    const jogState: GrblSimulatorModalState = { ...modalState, feedRate: 0, motionMode: GRBL_SIMULATOR_G_CODE.LINEAR };
    const result: GrblSimulatorInterpretedLine | GrblSimulatorGcodeError = getInterpretedGcodeLine(
      `${GRBL_SIMULATOR_JOG_MOTION_GCODE}${jogGcode}`,
      jogState,
      this.host.getSettings(),
    );

    if ('errorCode' in result) {
      this.host.emitError(result.errorCode);

      return;
    }

    if (result.motionBlock) {
      this.host.motion.enqueueBlock(result.motionBlock, true);
      this.host.setModalState({ ...modalState, position: result.motionBlock.target });
    }

    this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
  }

  private writeSetting(command: string): void {
    const settingWrite: GrblSimulatorSettingWrite | GrblSimulatorGcodeError = getParsedSimulatorSettingWrite(
      command,
      this.host.getSettings(),
    );

    if ('errorCode' in settingWrite) {
      this.host.emitError(settingWrite.errorCode);

      return;
    }

    this.executeCommandInStates(CONFIGURATION_STATES, (): void => {
      this.host.storeSetting(settingWrite.settingNumber, settingWrite.value);
      this.host.emitLines(GRBL_OK_RESPONSE_TEXT);
    });
  }
}
