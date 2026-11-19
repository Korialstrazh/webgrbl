/**
 * Gets the lines of the G-code export confirmation: each warning with the name of its object, in toolpath order.
 * A warning whose object is gone keeps the default object name, so no warning is ever dropped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { DEFAULT_OBJECT_NAME } from '../../utils/project/project.constants';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import { OBJECT_WARNING_TEXT_KEY } from '../../utils/toolpath/object.warning.text.key';
import type { GcodeWarningLine } from './interfaces/GcodeWarningLine';

const LINE_KEY_SEPARATOR = ':';

export const getGcodeWarningLines = (warnings: ObjectWarning[], projectObjects: ProjectObject[]): GcodeWarningLine[] =>
  warnings.map((warning: ObjectWarning): GcodeWarningLine => ({
    lineKey: [warning.objectId, warning.kind].join(LINE_KEY_SEPARATOR),
    objectId: warning.objectId,
    objectName: projectObjects.find((projectObject: ProjectObject): boolean => projectObject.id === warning.objectId)
      ?.name ?? DEFAULT_OBJECT_NAME,
    kind: warning.kind,
    warningTextKey: OBJECT_WARNING_TEXT_KEY[warning.kind],
  }));
