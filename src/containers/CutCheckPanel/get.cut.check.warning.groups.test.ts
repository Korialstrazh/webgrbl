import { CUT_CHECK_WARNING_KIND } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { getCutCheckWarningGroups } from './get.cut.check.warning.groups';

const LAYER_KEY = '#ff0000';
const OTHER_LAYER_KEY = '#00ff00';

const newWarning = (overrides: Partial<CutCheckWarning> = {}): CutCheckWarning => ({
  kind: CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED,
  layerKey: LAYER_KEY,
  partId: 1,
  predictedDepthMm: 2.81,
  neededDepthMm: 3,
  isLessSure: false,
  isDepthUpperBound: false,
  ...overrides,
});

const getCounts = (warnings: CutCheckWarning[]): number[] =>
  getCutCheckWarningGroups(warnings).map((group) => group.warnings.length);

describe(getCutCheckWarningGroups.name, () => {
  it('puts warnings together that differ only in the part, in order', () => {
    const [group] = getCutCheckWarningGroups([newWarning({ partId: 1 }), newWarning({ partId: 2 })]);

    expect(group?.warnings.map(({ partId }) => partId)).toEqual([1, 2]);
  });

  it('puts depths together that read the same once rounded', () => {
    expect(getCounts([newWarning(), newWarning({ partId: 2, predictedDepthMm: 2.84 })])).toEqual([2]);
  });

  it.each<[string, Partial<CutCheckWarning>]>([
    ['kind', { kind: CUT_CHECK_WARNING_KIND.PART_ATTACHED }],
    ['layer', { layerKey: OTHER_LAYER_KEY }],
    ['predicted depth', { predictedDepthMm: 1 }],
    ['needed depth', { neededDepthMm: 6 }],
    ['certainty', { isLessSure: true }],
    ['upper bound', { isDepthUpperBound: true }],
  ])('keeps warnings apart by %s', (_name, overrides) => {
    expect(getCounts([newWarning(), newWarning({ partId: 2, ...overrides })])).toEqual([1, 1]);
  });

  it('gives no groups for no warnings', () => {
    expect(getCutCheckWarningGroups([])).toEqual([]);
  });
});
