import { getCutCheckListScrollTopPx } from './get.cut.check.list.scroll.top.px';

const newBox = (top: number, bottom: number): Pick<HTMLElement, 'getBoundingClientRect'> => ({
  getBoundingClientRect: () => new DOMRect(0, top, 100, bottom - top),
});
const LIST = { ...newBox(100, 300), scrollTop: 50, clientHeight: 200 };

describe(getCutCheckListScrollTopPx.name, () => {
  it('stays put for a row in view', () => {
    expect(getCutCheckListScrollTopPx(LIST, newBox(150, 190))).toBe(50);
  });

  it('moves up far enough for a row above and its margin', () => {
    expect(getCutCheckListScrollTopPx(LIST, newBox(80, 120))).toBe(14);
  });

  it('moves down far enough for a row below and its margin', () => {
    expect(getCutCheckListScrollTopPx(LIST, newBox(290, 330))).toBe(96);
  });
});
