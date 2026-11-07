/**
 * The kinds of overlay: a popover floats beside its trigger, while a dialog or drawer takes over the screen, so opening
 * one closes any open popover.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const OVERLAY_KIND = {
  POPOVER: 'popover',
  DIALOG: 'dialog',
} as const;

export type OverlayKind = typeof OVERLAY_KIND[keyof typeof OVERLAY_KIND];
