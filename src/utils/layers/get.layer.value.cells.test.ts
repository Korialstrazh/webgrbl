import type { TFunction } from 'i18next';
import { i18n } from '../localization/localization';
import type { LayerSummarySettings } from './interfaces/LayerSummarySettings';
import { getLayerValueCells } from './get.layer.value.cells';
import { LAYER_MODE } from '../palette/palette.constants';

const SETTINGS: LayerSummarySettings = { mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 12000, passes: 3 };

describe(getLayerValueCells.name, () => {
  it('gives power and passes with short unit marks and speed as a bare number, leaving mm/min to the tooltip', () => {
    const t: TFunction = i18n.t;

    expect(getLayerValueCells(t, SETTINGS)).toEqual(['100\u202f%', '12000', '3\u00d7']);
  });
});
