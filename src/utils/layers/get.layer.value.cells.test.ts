import type { TFunction } from 'i18next';
import { i18n } from '../localization/localization';
import type { LayerSummarySettings } from './interfaces/LayerSummarySettings';
import { getLayerValueCells } from './get.layer.value.cells';
import { LAYER_MODE } from '../palette/palette.constants';

const SETTINGS: LayerSummarySettings = { mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 12000, passes: 3 };

describe(getLayerValueCells.name, () => {
  it('gives power, speed and passes as bare numbers, leaving every unit to the tooltip', () => {
    const t: TFunction = i18n.t;

    expect(getLayerValueCells(t, SETTINGS)).toEqual(['100', '12000', '3']);
  });
});
