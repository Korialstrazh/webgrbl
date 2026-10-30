import { GrblSimulator } from './simulator/grbl.simulator';
import { GRBL_SIMULATOR_OUTPUT_DELAY_MS } from './simulator/grbl.simulator.constants';
import type { SerialTransport } from './interfaces/SerialTransport';

/**
 * Serial transport backed by the GRBL simulator: the "Simulated laser" for users without hardware and the
 * machine the engine tests run against. Output arrives asynchronously, like reads from a real port.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class SimulatedLaserTransport implements SerialTransport {
  /** The simulated controller behind the port. */
  private readonly simulator: GrblSimulator;
  /** Encodes simulator output into the bytes a port delivers. */
  private readonly outputEncoder: TextEncoder = new TextEncoder();
  /** True between open() and close() or a simulated connection loss. */
  private isOpen = false;
  /** Receives the output bytes. */
  private receiveListener: ((chunk: Uint8Array) => void) | undefined;
  /** Told once when the connection is lost. */
  private connectionLostListener: (() => void) | undefined;

  /**
   * @param simulator An existing simulator to drive; its output listener is replaced by this transport.
   *   When omitted, the transport creates its own simulator.
   */
  public constructor(simulator?: GrblSimulator) {
    const outputListener = (text: string): void => this.deliverSimulatorOutput(text);

    this.simulator = simulator ?? new GrblSimulator(outputListener);
    this.simulator.setOutputListener(outputListener);
  }

  public async open(): Promise<void> {
    this.isOpen = true;
    this.simulator.powerOn();
  }

  public async write(bytes: Uint8Array): Promise<void> {
    if (this.isOpen) {
      this.simulator.receiveBytes(bytes);
    }
  }

  public async close(): Promise<void> {
    this.isOpen = false;
    this.simulator.powerOff();
  }

  public setReceiveListener(listener: (chunk: Uint8Array) => void): void {
    this.receiveListener = listener;
  }

  public setConnectionLostListener(listener: () => void): void {
    this.connectionLostListener = listener;
  }

  /** Acts as if the cable was pulled: output stops, writes are ignored and the listener is told once. */
  public simulateConnectionLoss(): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.simulator.powerOff();
    this.connectionLostListener?.();
  }

  public getSimulator(): GrblSimulator {
    return this.simulator;
  }

  private deliverSimulatorOutput(text: string): void {
    if (!this.isOpen) {
      return;
    }

    const chunk: Uint8Array = this.outputEncoder.encode(text);

    setTimeout((): void => {
      if (this.isOpen) {
        this.receiveListener?.(chunk);
      }
    }, GRBL_SIMULATOR_OUTPUT_DELAY_MS);
  }
}
