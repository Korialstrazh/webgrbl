/**
 * What the element tree keyboard hook gives the tree: its tab stop row, its expanded rows and its event handlers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FocusEvent, Key, KeyboardEvent } from 'react';

export interface ElementTreeKeyboard {
  /** The path of the one row whose buttons are in the Tab order; undefined for an empty tree. */
  tabStopPath: string | undefined;
  /** The paths of the rows whose children show; every parent row starts expanded. */
  expandedPaths: string[];
  /** Takes the expanded rows antd reports after a row is opened or closed. */
  changeExpandedPaths: (expandedKeys: Key[]) => void;
  /**
   * Moves the tab stop on Arrow Up, Arrow Down, Home and End, scrolls to that row and focuses it; keeps the tree keys
   * from antd.
   */
  moveTabStopByKey: (keyboardEvent: KeyboardEvent<HTMLElement>) => void;
  /** Makes the row that took focus (by Tab or by mouse) the tab stop, and keeps the focus from antd's tree. */
  followFocusedRow: (focusEvent: FocusEvent<HTMLElement>) => void;
  /** Keeps a row's blur from antd's tree, which would forget the row it marks as active. */
  stopRowBlur: (focusEvent: FocusEvent<HTMLElement>) => void;
  /** After a scroll, moves the tab stop to a row in view when its own row left the list. */
  keepTabStopInView: () => void;
}
