/**
 * Gets the kinds of content of one object that the job leaves out. The ready toolpath's warnings are used when there
 * are some, since they also know about off-page geometry; otherwise the object's SVG is checked on its own (parsed
 * once per SVG text).
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../../utils/project/interfaces/ProjectObject';
import { getCachedSvgUnsupportedKinds } from '../../../utils/svg/geometry/get.cached.svg.unsupported.kinds';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../../utils/toolpath/interfaces/ObjectWarning';

export const getObjectWarningKinds = (
  projectObject: ProjectObject,
  readyToolpathWarnings: ObjectWarning[] | undefined,
): SvgUnsupportedKind[] => {
  if (!readyToolpathWarnings) {
    return getCachedSvgUnsupportedKinds(projectObject.svgText);
  }

  const warningKinds: Set<SvgUnsupportedKind> = new Set<SvgUnsupportedKind>();

  for (const warning of readyToolpathWarnings) {
    if (warning.objectId === projectObject.id) {
      warningKinds.add(warning.kind);
    }
  }

  return Array.from(warningKinds);
};
