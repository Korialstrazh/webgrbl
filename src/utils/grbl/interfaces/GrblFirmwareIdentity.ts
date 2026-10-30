/**
 * Firmware name and version read from the welcome banner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblFirmwareIdentity {
  firmwareName: string;
  /** Version text with its letter suffix, for example 1.1h. */
  version: string;
  /** Rest of the banner line after the version. */
  vendorText: string;
}
