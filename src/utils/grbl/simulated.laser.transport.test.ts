import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulatedLaserTransport } from './simulated.laser.transport';
import { GrblSimulator } from './simulator/grbl.simulator';
import { GRBL_SIMULATOR_FAULT_KIND } from './simulator/grbl.simulator.constants';

const BANNER_OUTPUT = "Grbl 1.1h ['$' for help]\r\n";
const BUILD_INFO_OUTPUT = '[VER:1.1h.20190825:]\r\n[OPT:V,15,128]\r\nok\r\n';
const BUILD_INFO_COMMAND = '$I\n';

interface TransportHarness {
  transport: SimulatedLaserTransport;
  receivedChunks: string[];
}

const newTransportHarness = (simulator?: GrblSimulator): TransportHarness => {
  const transport: SimulatedLaserTransport = new SimulatedLaserTransport(simulator);
  const receivedChunks: string[] = [];
  const decoder: TextDecoder = new TextDecoder();

  transport.setReceiveListener((chunk: Uint8Array): void => {
    receivedChunks.push(decoder.decode(chunk));
  });

  return { transport, receivedChunks };
};

const writeText = async (transport: SimulatedLaserTransport, text: string): Promise<void> => {
  await transport.write(new TextEncoder().encode(text));
};

describe(SimulatedLaserTransport.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delivers the banner after open', async () => {
    const harness: TransportHarness = newTransportHarness();

    await harness.transport.open();

    expect(harness.receivedChunks).toEqual([]);

    await vi.advanceTimersByTimeAsync(0);

    expect(harness.receivedChunks).toEqual([BANNER_OUTPUT]);
  });

  it('forwards written bytes to the simulator and delivers its answers', async () => {
    const harness: TransportHarness = newTransportHarness();
    await harness.transport.open();
    await vi.advanceTimersByTimeAsync(0);
    harness.receivedChunks.length = 0;

    await writeText(harness.transport, BUILD_INFO_COMMAND);
    await vi.advanceTimersByTimeAsync(0);

    expect(harness.receivedChunks.join('')).toBe(BUILD_INFO_OUTPUT);
  });

  it('uses the given simulator', async () => {
    const simulator: GrblSimulator = new GrblSimulator(() => undefined);
    const harness: TransportHarness = newTransportHarness(simulator);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING });

    await harness.transport.open();
    await vi.advanceTimersByTimeAsync(0);

    expect(harness.transport.getSimulator()).toBe(simulator);
    expect(harness.receivedChunks).toEqual([]);
  });

  it('simulateConnectionLoss calls the connection-lost listener', async () => {
    const harness: TransportHarness = newTransportHarness();
    const connectionLostListener = vi.fn();
    harness.transport.setConnectionLostListener(connectionLostListener);
    await harness.transport.open();
    await vi.advanceTimersByTimeAsync(0);
    harness.receivedChunks.length = 0;

    harness.transport.simulateConnectionLoss();
    await writeText(harness.transport, BUILD_INFO_COMMAND);
    await vi.advanceTimersByTimeAsync(0);

    expect(connectionLostListener).toHaveBeenCalledOnce();
    expect(harness.receivedChunks).toEqual([]);
  });

  it('drops output that is still pending when the port closes', async () => {
    const harness: TransportHarness = newTransportHarness();
    await harness.transport.open();

    await harness.transport.close();
    await vi.advanceTimersByTimeAsync(0);

    expect(harness.receivedChunks).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
