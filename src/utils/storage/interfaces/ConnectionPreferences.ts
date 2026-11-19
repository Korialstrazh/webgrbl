/**
 * The connection choices that are remembered between sessions.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ConnectionPreferences {
  /** Baud rate the user chose. */
  baudRate: number;
  /** Which machine the user chose. */
  portChoice: {
    /** True when the simulated laser was chosen instead of a serial port. */
    isSimulated: boolean;
    /** USB vendor id of the chosen serial port. */
    usbVendorId: number | undefined;
    /** USB product id of the chosen serial port. */
    usbProductId: number | undefined;
  };
}
