/**
 * Gets the CSS width of an app dialog: its widest width, or the window width less a gutter on each side when the
 * window is narrower, so the dialog and its close button are never cut off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { APP_MODAL_WINDOW_GUTTER } from './app.modal.constants';

export const getAppModalWidth = (maxWidth: string): string =>
  `min(${maxWidth}, calc(100vw - ${APP_MODAL_WINDOW_GUTTER}))`;
