import { getPanelDefaultSizes } from './get.panel.default.sizes';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';

const ROOT_FONT_SIZE_PX = 16;
const WORKBENCH_WIDTH_PX = 1600;
const WIDE_WORKBENCH_WIDTH_PX = 1920;
const BELOW_ROOMY_WORKBENCH_WIDTH_PX = 1500;
// 32rem at a 16 px root font is 512 px, 26.67 % of 1920 px; the bed takes what the side panels give up.
const WIDE_SIDE_PANEL_PERCENT = 512 / 1920 * 100;
const VERY_WIDE_WORKBENCH_WIDTH_PX = 3200;
const WIDE_BED_PERCENT = 100 - 2 * WIDE_SIDE_PANEL_PERCENT;
// 16.25rem and 20rem at a 16 px root font, in percent of 1600 px.
const NARROW_DESIGN_PERCENT = 16.25;
const NARROW_MACHINE_PERCENT = 20;

const getPercents = (panelSizes: PanelDefaultSize[]): number[] =>
  panelSizes.map((panelSize: PanelDefaultSize): number => parseFloat(String(panelSize)));

const expectPercents = (panelSizes: PanelDefaultSize[], expectedPercents: readonly number[]): void => {
  const percents: number[] = getPercents(panelSizes);

  expect(percents).toHaveLength(expectedPercents.length);
  expectedPercents.forEach((expectedPercent: number, index: number) => {
    expect(percents[index]).toBeCloseTo(expectedPercent);
  });
};

describe(getPanelDefaultSizes.name, () => {
  it('opens with the stored percentages when every side panel is within its limits', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: [20, 55, 25],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    })).toEqual(['20%', '55%', '25%']);
  });

  it('keeps a stored side panel share at its maximum width on a wide screen, so the bed takes the extra width', () => {
    const panelSizes: PanelDefaultSize[] = getPanelDefaultSizes({
      storedPanelSizePercents: [28, 44, 28],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WIDE_WORKBENCH_WIDTH_PX,
    });

    expectPercents(panelSizes, [WIDE_SIDE_PANEL_PERCENT, WIDE_BED_PERCENT, WIDE_SIDE_PANEL_PERCENT]);
  });

  it('keeps a stored side panel share at its minimum width in a narrow workbench', () => {
    const panelSizes: PanelDefaultSize[] = getPanelDefaultSizes({
      storedPanelSizePercents: [10, 80, 10],
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    });

    expectPercents(panelSizes, [NARROW_DESIGN_PERCENT, 100 - NARROW_DESIGN_PERCENT - NARROW_MACHINE_PERCENT, 20]);
  });

  it('opens with the fixed side panel widths and the bed taking the rest when nothing is stored', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: undefined,
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: BELOW_ROOMY_WORKBENCH_WIDTH_PX,
    })).toEqual([328, undefined, 352]);
  });

  it('opens the design panel wider on a roomy window when nothing is stored', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: undefined,
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WORKBENCH_WIDTH_PX,
    })).toEqual([384, undefined, 352]);
  });

  it('grows both side panels in proportion to a wider window when nothing is stored', () => {
    const [designWidthPx, bedSize, machineWidthPx] = getPanelDefaultSizes({
      storedPanelSizePercents: undefined,
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: WIDE_WORKBENCH_WIDTH_PX,
    });

    expect(designWidthPx).toBeCloseTo(384 * 1.2);
    expect(bedSize).toBeUndefined();
    expect(machineWidthPx).toBeCloseTo(352 * 1.2);
  });

  it('stops growing the side panels at their maximum width on a very wide window', () => {
    expect(getPanelDefaultSizes({
      storedPanelSizePercents: undefined,
      rootFontSizePx: ROOT_FONT_SIZE_PX,
      workbenchWidthPx: VERY_WIDE_WORKBENCH_WIDTH_PX,
    })).toEqual([512, undefined, 512]);
  });
});
