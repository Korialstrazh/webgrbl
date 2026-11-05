import type { TFunction } from 'i18next';
import { MULTIPLICATION_SIGN } from '../characters.constants';
import { i18n } from '../localization/localization';
import type { LayerSummarySettings } from './interfaces/LayerSummarySettings';
import { getLayerValueCells } from './get.layer.value.cells';
import { LAYER_MODE } from '../palette/palette.constants';

const SETTINGS: LayerSummarySettings = { mode: LAYER_MODE.LINE, maxPowerPercent: 100, speedMmPerMin: 12000, passes: 3 };

describe(getLayerValueCells.name, () => {
  it('gives power, speed and passes in short form, leaving the speed unit to the tooltip', () => {
    const t: TFunction = i18n.t;

    expect(getLayerValueCells(t, SETTINGS)).toEqual(['100%', '12000', `3${MULTIPLICATION_SIGN}`]);
  });
});
