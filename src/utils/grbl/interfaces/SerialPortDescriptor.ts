/**
 * A granted serial port: a stable id for this page session plus the USB ids the browser reports.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SerialPortDescriptor {
  /** Id that identifies the port during this page session. */
  portId: string;
  /** USB vendor id, when the port is a USB device. */
  usbVendorId: number | undefined;
  /** USB product id, when the port is a USB device. */
  usbProductId: number | undefined;
}
