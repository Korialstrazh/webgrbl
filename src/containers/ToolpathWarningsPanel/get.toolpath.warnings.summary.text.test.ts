import { i18n } from '../../utils/localization/localization';
import { SVG_UNSUPPORTED_KIND } from '../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import { getToolpathWarningsSummaryText } from './get.toolpath.warnings.summary.text';

const CLOCK_ID = 'clock';
const LOGO_ID = 'logo';

describe(getToolpathWarningsSummaryText.name, () => {
  it('names the left-out part instead of the whole object, which still burns', () => {
    const warnings: ObjectWarning[] = [{ objectId: CLOCK_ID, kind: SVG_UNSUPPORTED_KIND.TEXT }];

    expect(getToolpathWarningsSummaryText(i18n.t, warnings)).toBe('Warnings: text left out (1)');
  });

  it('counts each kind once, in toolpath order', () => {
    const warnings: ObjectWarning[] = [
      { objectId: CLOCK_ID, kind: SVG_UNSUPPORTED_KIND.TEXT },
      { objectId: CLOCK_ID, kind: SVG_UNSUPPORTED_KIND.IMAGE },
      { objectId: LOGO_ID, kind: SVG_UNSUPPORTED_KIND.TEXT },
    ];

    expect(getToolpathWarningsSummaryText(i18n.t, warnings)).toBe('Warnings: text left out (2), images left out (1)');
  });

  it('says that clipped parts burn in full rather than calling them left out', () => {
    const warnings: ObjectWarning[] = [{ objectId: LOGO_ID, kind: SVG_UNSUPPORTED_KIND.CLIPPED }];

    expect(getToolpathWarningsSummaryText(i18n.t, warnings)).toBe('Warnings: clipped parts burn in full (1)');
  });
});
