/**
 * The kinds of overlay: a popover floats beside its trigger, while a dialog or drawer takes over the screen, so opening
 * one closes any open popover.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const OVERLAY_KIND = {
  POPOVER: 'popover',
  DIALOG: 'dialog',
} as const;

export type OverlayKind = typeof OVERLAY_KIND[keyof typeof OVERLAY_KIND];
