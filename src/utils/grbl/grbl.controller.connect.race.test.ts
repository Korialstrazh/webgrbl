import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GRBL_DEFAULT_RX_BUFFER_BYTES } from './grbl.constants';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblController } from './grbl.controller';
import { newGrblControllerHarness } from './test.support/grbl.controller.harness';
import { disconnectGrblHarness } from './test.support/grbl.harness.disconnect';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblControllerHarness } from './test.support/GrblControllerHarness';

/** Lets a test finish the handshake at the moment it chooses. */
interface GrblHandshakeControl {
  /** Resolves the running handshake; set while one runs. */
  resolveHandshake: ((connectionInfo: GrblConnectionInfo) => void) | undefined;
}

const HANDSHAKE_CONTROL: GrblHandshakeControl = vi.hoisted((): GrblHandshakeControl => ({
  resolveHandshake: undefined,
}));

vi.mock('./grbl.handshake', () => ({
  performGrblHandshake: (): Promise<GrblConnectionInfo> =>
    new Promise((resolveHandshake: (connectionInfo: GrblConnectionInfo) => void): void => {
      HANDSHAKE_CONTROL.resolveHandshake = resolveHandshake;
    }),
}));

const CONNECTION_INFO: GrblConnectionInfo = {
  identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: '' },
  rxBufferSize: GRBL_DEFAULT_RX_BUFFER_BYTES,
  settings: {},
  buildInfoLines: [],
};

describe(GrblController.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a disconnect between the handshake result and the connect result rejects connect, no timer left', async () => {
    const harness: GrblControllerHarness = newGrblControllerHarness();
    const connection: Promise<GrblConnectionInfo> = harness.controller.connect();
    const rejection: Promise<void> = expect(connection).rejects.toBeInstanceOf(GrblConnectionClosedError);

    HANDSHAKE_CONTROL.resolveHandshake?.(CONNECTION_INFO);
    const disconnect: Promise<void> = harness.controller.disconnect();

    await rejection;
    await disconnect;
    expect(vi.getTimerCount()).toBe(0);

    const nextConnection: Promise<GrblConnectionInfo> = harness.controller.connect();
    HANDSHAKE_CONTROL.resolveHandshake?.(CONNECTION_INFO);

    await expect(nextConnection).resolves.toEqual(CONNECTION_INFO);

    await disconnectGrblHarness(harness);
    expect(vi.getTimerCount()).toBe(0);
  });
});
