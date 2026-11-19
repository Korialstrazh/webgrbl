import type { GrblSimulatorErrorOnLineFault } from './interfaces/GrblSimulatorErrorOnLineFault';

/**
 * Error-on-line faults injected into the simulated controller; each fires once, on the line number it names.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblSimulatorLineFaults {
  /** Faults that have not fired yet. */
  private pendingFaults: GrblSimulatorErrorOnLineFault[] = [];

  public addFault(fault: GrblSimulatorErrorOnLineFault): void {
    this.pendingFaults.push(fault);
  }

  /** Removes the fault for this line number and returns its error code, or undefined when the line has none. */
  public takeFaultErrorCode(lineNumber: number): number | undefined {
    const faultIndex: number = this.pendingFaults.findIndex(
      (fault: GrblSimulatorErrorOnLineFault): boolean => fault.lineNumber === lineNumber,
    );
    const [firedFault] = faultIndex < 0 ? [] : this.pendingFaults.splice(faultIndex, 1);

    return firedFault?.errorCode;
  }
}
