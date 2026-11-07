import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { getBedDoubleClickJogCommand } from './get.bed.double.click.jog.command';
import type { BedDoubleClickMoveRequest } from './interfaces/BedDoubleClickMoveRequest';

const FEED_RATE = 3000;
const LINE_ENDING = '\r\n';
const SIMULATED_MOVE_MS = 10_000;
const MACHINE_POSITION_PATTERN = /MPos:([^|>]+)/;
const STATUS_QUERY = '?';

const newBedDoubleClickMoveRequest = (
  overrides: Partial<BedDoubleClickMoveRequest> = {},
): BedDoubleClickMoveRequest => ({
  isPreferenceOn: true,
  isConnected: true,
  machineState: GRBL_MACHINE_STATE.IDLE,
  isJobRunActive: false,
  isPointerFiring: false,
  isOverlayOpen: false,
  bedPoint: { x: 120, y: 80 },
  machineArea: newToolpathMachineArea(),
  feedRate: FEED_RATE,
  ...overrides,
});

describe(getBedDoubleClickJogCommand.name, () => {
  it('builds one absolute jog to the bed point at the Move panel speed, without Z or laser words', () => {
    expect(getBedDoubleClickJogCommand(newBedDoubleClickMoveRequest())).toBe('$J=G90 G21 X120 Y80 F3000');
  });

  it('mirrors the axes of a back-right origin like the bed drawing does', () => {
    const command: string | undefined = getBedDoubleClickJogCommand(newBedDoubleClickMoveRequest({
      machineArea: newToolpathMachineArea({ originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT }),
    }));

    expect(command).toBe('$J=G90 G21 X280 Y220 F3000');
  });

  it.each([
    { bedPoint: { x: -15, y: -4 }, expected: '$J=G90 G21 X0 Y0 F3000' },
    { bedPoint: { x: 450, y: 333 }, expected: '$J=G90 G21 X400 Y300 F3000' },
  ])('holds $bedPoint.x, $bedPoint.y inside the work area', ({ bedPoint, expected }) => {
    expect(getBedDoubleClickJogCommand(newBedDoubleClickMoveRequest({ bedPoint }))).toBe(expected);
  });

  it.each([
    { reason: 'the preference is off', overrides: { isPreferenceOn: false } },
    { reason: 'the laser is not connected', overrides: { isConnected: false } },
    { reason: 'a job or frame runs', overrides: { isJobRunActive: true } },
    { reason: 'the pointer fires', overrides: { isPointerFiring: true } },
    { reason: 'an overlay is open', overrides: { isOverlayOpen: true } },
    { reason: 'the laser is in alarm', overrides: { machineState: GRBL_MACHINE_STATE.ALARM } },
    { reason: 'the laser holds', overrides: { machineState: GRBL_MACHINE_STATE.HOLD } },
    { reason: 'the laser homes', overrides: { machineState: GRBL_MACHINE_STATE.HOME } },
    { reason: 'a jog is going on', overrides: { machineState: GRBL_MACHINE_STATE.JOG } },
    { reason: 'the laser runs', overrides: { machineState: GRBL_MACHINE_STATE.RUN } },
    { reason: 'no status came yet', overrides: { machineState: undefined } },
  ])('sends nothing when $reason', ({ overrides }) => {
    expect(getBedDoubleClickJogCommand(newBedDoubleClickMoveRequest(overrides))).toBeUndefined();
  });

  describe('with the simulated laser', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('moves the head to the double-clicked point', async () => {
      const outputLines: string[] = [];
      const simulator: GrblSimulator = new GrblSimulator((text: string): void => {
        outputLines.push(text.slice(0, -LINE_ENDING.length));
      });
      const command: string | undefined = getBedDoubleClickJogCommand(newBedDoubleClickMoveRequest());

      simulator.powerOn();
      simulator.receiveBytes(new TextEncoder().encode(`${command}\n`));
      await vi.advanceTimersByTimeAsync(SIMULATED_MOVE_MS);
      simulator.receiveBytes(new TextEncoder().encode(STATUS_QUERY));

      expect(MACHINE_POSITION_PATTERN.exec(outputLines.at(-1) ?? '')?.[1]).toBe('120.000,80.000,0.000');
    });
  });
});
