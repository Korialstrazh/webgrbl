/**
 * The scroll position of a scrolling panel that shows a row with a margin around it, moving as little as it can.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
type ScrollerBox = Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'getBoundingClientRect'>;
type RowBox = Pick<HTMLElement, 'getBoundingClientRect'>;

const ROW_MARGIN_PX = 16;

export const getCutCheckListScrollTopPx = (scroller: ScrollerBox, row: RowBox): number => {
  const scrollerRect: Pick<DOMRect, 'top'> = scroller.getBoundingClientRect();
  const rowRect: Pick<DOMRect, 'top' | 'bottom'> = row.getBoundingClientRect();
  const rowTopPx: number = rowRect.top - scrollerRect.top - ROW_MARGIN_PX;
  const rowBottomPx: number = rowRect.bottom - scrollerRect.top + ROW_MARGIN_PX;

  if (rowTopPx < 0) {
    return scroller.scrollTop + rowTopPx;
  }

  return rowBottomPx > scroller.clientHeight
    ? scroller.scrollTop + rowBottomPx - scroller.clientHeight
    : scroller.scrollTop;
};
