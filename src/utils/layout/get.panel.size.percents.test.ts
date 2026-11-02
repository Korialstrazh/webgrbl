import { getPanelSizePercents } from './get.panel.size.percents';

describe(getPanelSizePercents.name, () => {
  it('turns the pixel sizes into percentages of their total', () => {
    expect(getPanelSizePercents([250, 500, 250])).toEqual([25, 50, 25]);
  });

  it('gives nothing when the workbench has no width yet', () => {
    expect(getPanelSizePercents([0, 0, 0])).toBeUndefined();
  });

  it('gives nothing for a wrong number of panels', () => {
    expect(getPanelSizePercents([500, 500])).toBeUndefined();
  });
});
