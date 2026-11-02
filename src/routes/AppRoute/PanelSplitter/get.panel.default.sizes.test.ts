import { getPanelDefaultSizes } from './get.panel.default.sizes';

const ROOT_FONT_SIZE_PX = 16;
const WORKBENCH_WIDTH_PX = 1600;
const WIDE_WORKBENCH_WIDTH_PX = 1920;
// 28rem at a 16 px root font.
const SIDE_PANEL_MAX_WIDTH_PX = 448;

describe(getPanelDefaultSizes.name, () => {
  it('opens the side panels at their stored share of the workbench width, with the bed taking the rest', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: [20, 55, 25],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    })).toEqual([320, undefined, 400]);
  });

  it('keeps a stored side panel share at its maximum width on a wide screen, so the bed takes the extra width', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: [24, 50, 26],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WIDE_WORKBENCH_WIDTH_PX,
    })).toEqual([SIDE_PANEL_MAX_WIDTH_PX, undefined, SIDE_PANEL_MAX_WIDTH_PX]);
  });

  it('keeps a stored side panel share at its minimum width in a narrow workbench', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: [10, 80, 10],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    })).toEqual([260, undefined, 320]);
  });

  it('opens with the fixed side panel widths and the bed taking the rest when nothing is stored', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: undefined,
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    })).toEqual([328, undefined, 352]);
  });
});
