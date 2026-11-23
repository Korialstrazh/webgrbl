/**
 * The part of the antd Tree instance the element tree keyboard uses: scrolling its virtual list to a row.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Key } from 'react';
import type { ANTD_TREE_SCROLL_ALIGN_AUTO } from '../../../../utils/antd.constants';

export interface ElementTreeScroller {
  /** Scrolls the virtual list so the row of the key is in view. */
  scrollTo: (target: { key: Key; align?: typeof ANTD_TREE_SCROLL_ALIGN_AUTO }) => void;
}
