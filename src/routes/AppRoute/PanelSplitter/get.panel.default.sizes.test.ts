import { getPanelDefaultSizes } from './get.panel.default.sizes';

const ROOT_FONT_SIZE_PX = 16;

describe(getPanelDefaultSizes.name, () => {
  it('opens with the stored percentages', () => {
    expect(getPanelDefaultSizes([20, 50, 30], ROOT_FONT_SIZE_PX)).toEqual(['20%', '50%', '30%']);
  });

  it('opens with the fixed side panel widths and the bed taking the rest when nothing is stored', () => {
    expect(getPanelDefaultSizes(undefined, ROOT_FONT_SIZE_PX)).toEqual([280, undefined, 352]);
  });
});
