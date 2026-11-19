/**
 * Props of the toast stack.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToastStackProps {
  /** Whether the window is wide; narrower, the stacked regions scroll, so the stack is pinned to the window. */
  isWide: boolean;
}
