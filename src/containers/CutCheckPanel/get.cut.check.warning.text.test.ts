import { CUT_CHECK_WARNING_KIND } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarningKind } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { i18n } from '../../utils/localization/localization';
import { getCutCheckWarningText } from './get.cut.check.warning.text';

const LAYER_NAME = 'Cut red';
const PART_SUGGESTION = 'add a run or lower the speed';
const FILL_SUGGESTION = 'lower the power or raise the speed';
const LESS_SURE_TEXT = 'less sure';

const newWarning = (overrides: Partial<CutCheckWarning>): CutCheckWarning => ({
  kind: CUT_CHECK_WARNING_KIND.PART_ATTACHED,
  layerKey: '#ff0000',
  partId: 2,
  predictedDepthMm: 1.26,
  neededDepthMm: 3,
  isLessSure: false,
  ...overrides,
});

const getText = (warning: CutCheckWarning): string =>
  getCutCheckWarningText(i18n.t, warning, LAYER_NAME);

describe(getCutCheckWarningText.name, () => {
  it.each<[CutCheckWarningKind, string, string]>([
    [CUT_CHECK_WARNING_KIND.PART_ATTACHED, 'part 2 stays attached', PART_SUGGESTION],
    [CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED, 'part 2 may stay attached', PART_SUGGESTION],
  ])('words %s with the layer, the part, both depths and the suggestion', (kind, partText, suggestion) => {
    const warningText: string = getText(newWarning({ kind }));

    expect(warningText).toContain(LAYER_NAME);
    expect(warningText).toContain(partText);
    expect(warningText).toContain('predicted 1.3 mm');
    expect(warningText).toContain('needed 3.0 mm');
    expect(warningText).toContain(suggestion);
    expect(warningText).not.toContain(LESS_SURE_TEXT);
  });

  it('words a fill that cuts through with the layer, both depths and its own suggestion', () => {
    const warningText: string = getText(newWarning({
      kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH,
      partId: undefined,
      predictedDepthMm: 4,
    }));

    expect(warningText).toContain(LAYER_NAME);
    expect(warningText).toContain('predicted 4.0 mm');
    expect(warningText).toContain('sheet 3.0 mm');
    expect(warningText).toContain(FILL_SUGGESTION);
    expect(warningText).not.toContain(PART_SUGGESTION);
  });

  it('says when the estimate is less sure', () => {
    expect(getText(newWarning({ isLessSure: true }))).toContain(LESS_SURE_TEXT);
  });
});
