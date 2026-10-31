/**
 * Parts of the simulated controller that received lines read and change.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblMachineState } from '../../grbl.constants';
import type { GrblSimulatorMotion } from '../grbl.simulator.motion';
import type { GrblSimulatorModalState } from './GrblSimulatorModalState';

export interface GrblSimulatorLineExecutorHost {
  /** Planner and motion of the machine. */
  motion: GrblSimulatorMotion;
  getMachineState(): GrblMachineState;
  getModalState(): GrblSimulatorModalState;
  setModalState(modalState: GrblSimulatorModalState): void;
  getSettings(): Readonly<Record<number, string>>;
  storeSetting(settingNumber: number, value: string): void;
  setCheckMode(isCheckMode: boolean): void;
  setAlarmLocked(isAlarmLocked: boolean): void;
  emitLines(...lines: string[]): void;
  emitError(errorCode: number): void;
  executeSoftReset(): void;
}
