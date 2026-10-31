/**
 * The connection choices that are remembered between sessions.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
