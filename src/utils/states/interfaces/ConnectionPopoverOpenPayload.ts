/**
 * What the ConnectionPopoverOpenChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface ConnectionPopoverOpenPayload {
  /** Whether the connection popover under the top-bar pill is now open. */
  isConnectionPopoverOpen: boolean;
}
