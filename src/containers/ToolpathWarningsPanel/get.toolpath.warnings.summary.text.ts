/**
 * Gets the line of the closed warnings chip: each kind of warning once, in toolpath order, with how many objects have
 * it, for example "Warnings: text left out (2), images left out (1)". A warning is about part of an object (its text,
 * its images); the rest of the object still burns, so the chip never says the whole object is left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { SvgUnsupportedKind } from '../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import { OBJECT_WARNING_KIND_LABEL_KEY } from '../../utils/toolpath/object.warning.kind.label.key';

const WARNING_KIND_SEPARATOR = ', ';

export const getToolpathWarningsSummaryText = (t: TFunction, warnings: ObjectWarning[]): string => {
  const kindCounts: Map<SvgUnsupportedKind, number> = new Map<SvgUnsupportedKind, number>();

  for (const { kind } of warnings) {
    kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1);
  }

  const kindLabels: string[] = [];

  for (const [kind, count] of kindCounts) {
    kindLabels.push(t(OBJECT_WARNING_KIND_LABEL_KEY[kind], { count }));
  }

  return t(DEFAULT.TOOLPATH_WARNINGS_SUMMARY, { kinds: kindLabels.join(WARNING_KIND_SEPARATOR) });
};
