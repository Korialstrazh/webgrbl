/**
 * What the ConsoleOpenChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface ConsoleOpenPayload {
  /** Whether the console panel is shown below the bed. */
  isConsoleOpen: boolean;
}
