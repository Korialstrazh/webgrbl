/**
 * Firmware name and version read from the welcome banner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblFirmwareIdentity {
  firmwareName: string;
  /** Version text with its letter suffix, for example 1.1h. */
  version: string;
  /** Rest of the banner line after the version. */
  vendorText: string;
}
