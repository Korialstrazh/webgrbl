/**
 * What the ConsoleOpenChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface ConsoleOpenPayload {
  /** Whether the console panel is shown below the bed. */
  isConsoleOpen: boolean;
}
