import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { getMoveAvailability } from './get.move.availability';
import type { MoveAvailability } from './interfaces/MoveAvailability';
import type { MoveAvailabilityConditions } from './interfaces/MoveAvailabilityConditions';

interface MoveAvailabilityCase extends MoveAvailabilityConditions {
  /** What the row checks, shown as the test name. */
  caseName: string;
  /** The controls expected to be enabled. */
  expectedAvailability: MoveAvailability;
}

const NOTHING_AVAILABLE: MoveAvailability = { canJog: false, canHome: false, canSetZero: false };

const MOVE_AVAILABILITY_CASES: MoveAvailabilityCase[] = [
  {
    caseName: 'Idle with homing allows everything',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.IDLE,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: { canJog: true, canHome: true, canSetZero: true },
  },
  {
    caseName: 'Idle without homing switches disables Home only',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.IDLE,
    hasHomingSwitches: false,
    isPointerFiring: false,
    expectedAvailability: { canJog: true, canHome: false, canSetZero: true },
  },
  {
    caseName: 'Jog allows jog and go-to-zero but not Home or Set zero',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.JOG,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: { canJog: true, canHome: false, canSetZero: false },
  },
  {
    caseName: 'Alarm with homing allows Home only',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.ALARM,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: { canJog: false, canHome: true, canSetZero: false },
  },
  {
    caseName: 'Alarm without homing switches allows nothing',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.ALARM,
    hasHomingSwitches: false,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'Run allows nothing',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.RUN,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'Hold allows nothing',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.HOLD,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'Door allows nothing',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.DOOR,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'connected before the first status allows nothing',
    isConnected: true,
    machineState: undefined,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'disconnected allows nothing, even with a stale Idle',
    isConnected: false,
    machineState: GRBL_MACHINE_STATE.IDLE,
    hasHomingSwitches: true,
    isPointerFiring: false,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'Idle with homing allows nothing while the pointer fires',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.IDLE,
    hasHomingSwitches: true,
    isPointerFiring: true,
    expectedAvailability: NOTHING_AVAILABLE,
  },
  {
    caseName: 'Alarm with homing allows nothing while the pointer fires',
    isConnected: true,
    machineState: GRBL_MACHINE_STATE.ALARM,
    hasHomingSwitches: true,
    isPointerFiring: true,
    expectedAvailability: NOTHING_AVAILABLE,
  },
];

describe(getMoveAvailability.name, () => {
  it.each(MOVE_AVAILABILITY_CASES)(
    '$caseName',
    ({ caseName, expectedAvailability, ...conditions }: MoveAvailabilityCase) => {
      expect(getMoveAvailability(conditions), caseName).toEqual(expectedAvailability);
    },
  );
});
