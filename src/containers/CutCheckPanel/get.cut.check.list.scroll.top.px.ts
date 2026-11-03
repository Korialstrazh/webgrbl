/**
 * The scroll position of the part list that shows a row, moving as little as it can.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
type ListBox = Pick<HTMLElement, 'scrollTop' | 'clientHeight' | 'getBoundingClientRect'>;
type RowBox = Pick<HTMLElement, 'getBoundingClientRect'>;

export const getCutCheckListScrollTopPx = (list: ListBox, row: RowBox): number => {
  const listRect: Pick<DOMRect, 'top'> = list.getBoundingClientRect();
  const rowRect: Pick<DOMRect, 'top' | 'bottom'> = row.getBoundingClientRect();
  const rowTopPx: number = rowRect.top - listRect.top;
  const rowBottomPx: number = rowRect.bottom - listRect.top;

  if (rowTopPx < 0) {
    return list.scrollTop + rowTopPx;
  }

  return rowBottomPx > list.clientHeight ? list.scrollTop + rowBottomPx - list.clientHeight : list.scrollTop;
};
