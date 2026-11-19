/**
 * A granted serial port: a stable id for this page session plus the USB ids the browser reports.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SerialPortDescriptor {
  /** Id that identifies the port during this page session. */
  portId: string;
  /** USB vendor id, when the port is a USB device. */
  usbVendorId: number | undefined;
  /** USB product id, when the port is a USB device. */
  usbProductId: number | undefined;
}
